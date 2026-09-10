import { dataBR } from "@/lib/dataHoraBR";

// Lê, via Microsoft Graph, a planilha de plantão mantida no SharePoint (fora
// do nosso banco de dados) e devolve só quem está de plantão hoje. Autentica
// como aplicativo (client credentials), reaproveitando o mesmo App
// Registration do login com Microsoft — não depende de nenhum analista estar
// logado. Veja o README ("Painel de Plantonistas") para o passo a passo de
// configuração no Azure (permissão Sites.Selected + Client Secret).

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

// A planilha nunca muda de lugar (garantido pelo time que a mantém), então
// esses caminhos ficam fixos no código — trocar exige só editar aqui.
const SHAREPOINT_HOST = "brwatchtv.sharepoint.com";
const SHAREPOINT_SITE_PATH = "/sites/WatchLabsVOC";
const SHAREPOINT_ARQUIVO = "Plantao.xlsx";

// Cache de token/tempo de vida em memória, no escopo do módulo: sobrevive
// entre requisições na mesma instância "quente" da função serverless,
// evitando pedir um token novo no Entra ID a cada carregamento da Home.
let tokenCache: { token: string; expiraEm: number } | null = null;
let siteIdCache: string | null = null;
let worksheetIdCache: string | null = null;

export type PlantaoLinha = {
  area: string;
  analista: string;
  telefone: string;
};

function extrairTenantId(issuer: string | undefined): string | null {
  if (!issuer) return null;
  const match = issuer.match(/microsoftonline\.com\/([^/]+)\//);
  return match ? match[1] : null;
}

async function obterTokenAppOnly(): Promise<string> {
  if (tokenCache && tokenCache.expiraEm > Date.now() + 60_000) {
    return tokenCache.token;
  }

  const tenantId = extrairTenantId(process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER);
  const clientId = process.env.AUTH_MICROSOFT_ENTRA_ID_ID;
  const clientSecret = process.env.AUTH_MICROSOFT_ENTRA_ID_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error(
      "Credenciais do Microsoft Graph não configuradas (AUTH_MICROSOFT_ENTRA_ID_CLIENT_SECRET ausente).",
    );
  }

  const resposta = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    }),
  });

  if (!resposta.ok) {
    throw new Error(`Falha ao autenticar no Microsoft Graph (HTTP ${resposta.status}).`);
  }

  const dados = (await resposta.json()) as { access_token: string; expires_in: number };
  tokenCache = { token: dados.access_token, expiraEm: Date.now() + dados.expires_in * 1000 };
  return dados.access_token;
}

async function graphFetch(token: string, url: string): Promise<Response> {
  const resposta = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    // Evita bater no Graph a cada carregamento da Home; 5 minutos é
    // suficiente pra sentir a troca de plantonista do dia sem sobrecarregar.
    next: { revalidate: 300 },
  });
  if (!resposta.ok) {
    const corpo = await resposta.text().catch(() => "");
    throw new Error(`Microsoft Graph retornou HTTP ${resposta.status} em ${url}: ${corpo.slice(0, 300)}`);
  }
  return resposta;
}

async function resolverSiteId(token: string): Promise<string> {
  if (siteIdCache) return siteIdCache;
  const resposta = await graphFetch(token, `${GRAPH_BASE}/sites/${SHAREPOINT_HOST}:${SHAREPOINT_SITE_PATH}`);
  const site = (await resposta.json()) as { id: string };
  siteIdCache = site.id;
  return site.id;
}

async function resolverPrimeiraAba(token: string, siteId: string): Promise<string> {
  if (worksheetIdCache) return worksheetIdCache;
  const resposta = await graphFetch(
    token,
    `${GRAPH_BASE}/sites/${siteId}/drive/root:/${encodeURIComponent(SHAREPOINT_ARQUIVO)}:/workbook/worksheets`,
  );
  const dados = (await resposta.json()) as { value: { id: string }[] };
  if (dados.value.length === 0) {
    throw new Error("A planilha de plantão não tem nenhuma aba.");
  }
  worksheetIdCache = dados.value[0].id;
  return worksheetIdCache;
}

async function buscarUsedRange(
  token: string,
  siteId: string,
  worksheetId: string,
): Promise<{ text: string[][]; values: unknown[][] }> {
  const resposta = await graphFetch(
    token,
    `${GRAPH_BASE}/sites/${siteId}/drive/root:/${encodeURIComponent(SHAREPOINT_ARQUIVO)}:/workbook/worksheets/${worksheetId}/usedRange`,
  );
  return (await resposta.json()) as { text: string[][]; values: unknown[][] };
}

function normalizarRotulo(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/:$/, "")
    .trim();
}

// A planilha n\u00e3o \u00e9 uma tabela (cabe\u00e7alho em cima, uma linha por plantonista);
// \u00e9 um bloco vertical de "r\u00f3tulo: valor" por \u00e1rea \u2014 r\u00f3tulos numa coluna,
// valores na coluna seguinte, repetido quantas vezes forem necess\u00e1rias
// (uma vez por \u00e1rea, empilhado abaixo ou ao lado do bloco anterior). Por
// isso a leitura varre a planilha inteira procurando toda c\u00e9lula "Data" como
// \u00e2ncora de um novo bloco, em vez de assumir cabe\u00e7alhos fixos numa linha 1.
const ALIASES_ROTULO = {
  data: ["data", "dia"],
  area: ["area", "equipe", "time"],
  analista: ["analista", "nome", "plantonista"],
  telefone: ["telefone", "contato", "fone", "ramal"],
};

function ehRotulo(texto: string | undefined, aliases: string[]): boolean {
  return texto !== undefined && aliases.includes(normalizarRotulo(texto));
}

function classificarRotulo(texto: string): keyof typeof ALIASES_ROTULO | null {
  const normalizado = normalizarRotulo(texto);
  for (const chave of Object.keys(ALIASES_ROTULO) as (keyof typeof ALIASES_ROTULO)[]) {
    if (ALIASES_ROTULO[chave].includes(normalizado)) return chave;
  }
  return null;
}

type BlocoPlantao = { dataISO: string | null; area: string; analista: string; telefone: string };

// A partir de uma c\u00e9lula "Data" (linha rAncora, coluna cRotulo), l\u00ea os pares
// r\u00f3tulo/valor abaixo dela na mesma coluna de r\u00f3tulos, at\u00e9 uma linha vazia
// ou outra c\u00e9lula "Data" (in\u00edcio do pr\u00f3ximo bloco).
function lerBloco(
  texto: string[][],
  valores: unknown[][],
  rAncora: number,
  cRotulo: number,
): BlocoPlantao {
  const cValor = cRotulo + 1;
  const campos: Partial<Record<keyof typeof ALIASES_ROTULO, string>> = {};
  let dataISO: string | null = null;

  for (let r = rAncora; r < texto.length; r++) {
    const rotulo = texto[r]?.[cRotulo]?.trim();
    if (!rotulo) break;
    if (r > rAncora && ehRotulo(rotulo, ALIASES_ROTULO.data)) break;

    const chave = classificarRotulo(rotulo);
    if (!chave) continue;
    const valorTexto = texto[r]?.[cValor]?.trim() ?? "";
    campos[chave] = valorTexto;
    if (chave === "data") {
      dataISO = celulaParaDataISO(valores[r]?.[cValor], valorTexto);
    }
  }

  return {
    dataISO,
    area: campos.area ?? "",
    analista: campos.analista ?? "",
    telefone: campos.telefone ?? "",
  };
}

function extrairBlocosPlantao(texto: string[][], valores: unknown[][]): BlocoPlantao[] {
  const blocos: BlocoPlantao[] = [];
  for (let r = 0; r < texto.length; r++) {
    for (let c = 0; c < texto[r].length; c++) {
      if (ehRotulo(texto[r][c], ALIASES_ROTULO.data)) {
        blocos.push(lerBloco(texto, valores, r, c));
      }
    }
  }
  return blocos;
}

// Data de uma célula pode vir como número de série do Excel (célula
// realmente formatada como data) ou como texto (dd/mm/yyyy, yyyy-mm-dd,
// dd/mm/yy...). Convertida sempre pra yyyy-MM-dd, pra comparar direto com
// dataBR().
function celulaParaDataISO(valorBruto: unknown, textoFormatado: string): string | null {
  if (typeof valorBruto === "number") {
    // Excel usa 30/12/1899 como "dia zero" (compensa o bug histórico do
    // 29/02/1900, que nunca existiu, mas o Excel trata como se existisse).
    const ms = Date.UTC(1899, 11, 30) + Math.round(valorBruto) * 86_400_000;
    const d = new Date(ms);
    const ano = d.getUTCFullYear();
    const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dia = String(d.getUTCDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  }

  const bruto = (typeof valorBruto === "string" ? valorBruto : textoFormatado).trim();

  let m = bruto.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;

  m = bruto.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;

  m = bruto.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2})$/);
  if (m) return `20${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;

  return null;
}

export async function buscarPlantaoHoje(): Promise<PlantaoLinha[]> {
  const token = await obterTokenAppOnly();
  const siteId = await resolverSiteId(token);
  const worksheetId = await resolverPrimeiraAba(token, siteId);
  const range = await buscarUsedRange(token, siteId, worksheetId);

  const blocos = extrairBlocosPlantao(range.text, range.values);
  if (blocos.length === 0) {
    throw new Error('Não foi encontrado nenhum bloco com rótulo "Data" na planilha de plantão.');
  }

  const hoje = dataBR();
  return blocos
    .filter((b) => b.dataISO === hoje && b.area && b.analista)
    .map((b) => ({ area: b.area, analista: b.analista, telefone: b.telefone }));
}
