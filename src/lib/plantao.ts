import { dataBR, horaBR } from "@/lib/dataHoraBR";

// Lê, via Microsoft Graph, a planilha de plantão mantida no SharePoint (fora
// do nosso banco de dados) e devolve só quem está de plantão agora. Autentica
// como aplicativo (client credentials), reaproveitando o mesmo App
// Registration do login com Microsoft — não depende de nenhum analista estar
// logado. Veja o README ("Painel de Plantonistas") para o passo a passo de
// configuração no Azure (permissão Sites.Selected + Client Secret) e para a
// descrição do layout esperado da planilha.

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
let worksheetCache: { id: string; name: string } | null = null;

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
    // suficiente pra sentir a troca de plantonista sem sobrecarregar.
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

// O nome da aba é usado como "Área" de todo mundo listado nela.
async function resolverPrimeiraAba(token: string, siteId: string): Promise<{ id: string; name: string }> {
  if (worksheetCache) return worksheetCache;
  const resposta = await graphFetch(
    token,
    `${GRAPH_BASE}/sites/${siteId}/drive/root:/${encodeURIComponent(SHAREPOINT_ARQUIVO)}:/workbook/worksheets`,
  );
  const dados = (await resposta.json()) as { value: { id: string; name: string }[] };
  if (dados.value.length === 0) {
    throw new Error("A planilha de plantão não tem nenhuma aba.");
  }
  worksheetCache = { id: dados.value[0].id, name: dados.value[0].name };
  return worksheetCache;
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

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/:$/, "")
    .trim();
}

// Layout real da planilha (confirmado pelo usuário): uma grade tipo
// calendário — coluna "Recursos" com o nome de cada pessoa, uma coluna
// "Contato" logo em seguida (telefone), e a partir daí uma coluna por dia
// do mês (cabeçalho com o número do dia), com códigos de plantão (P1, P2,
// P3 — ou combinações tipo "P1/P2") nas células de cada pessoa/dia. Uma
// legenda em algum lugar da planilha mapeia cada código pra uma faixa de
// horário (ex.: "P1 - 05h00 as 07:00"). "Área" não está na planilha — é o
// nome da própria aba.
const AREA_RECURSO_LABEL = ["recursos", "recurso"];
const AREA_CONTATO_LABEL = ["contato", "telefone"];

const MESES_ABREV: Record<string, number> = {
  jan: 1,
  fev: 2,
  mar: 3,
  abr: 4,
  mai: 5,
  jun: 6,
  jul: 7,
  ago: 8,
  set: 9,
  out: 10,
  nov: 11,
  dez: 12,
};

function parseMesAno(texto: string | undefined): { mes: number; ano: number } | null {
  if (!texto) return null;
  const m = normalizarTexto(texto).match(/^([a-z]{3})\/(\d{2,4})$/);
  if (!m) return null;
  const mes = MESES_ABREV[m[1]];
  if (!mes) return null;
  const anoBruto = parseInt(m[2], 10);
  return { mes, ano: anoBruto < 100 ? 2000 + anoBruto : anoBruto };
}

// Procura, na linha do cabeçalho, a primeira célula (a partir de
// colInicio) que pareça um "mmm/aa" — é aí que o "set/26" mesclado costuma
// cair, na mesma coluna onde começa o dia 1.
function localizarMesAno(linhaTexto: string[] | undefined, colInicio: number): { mes: number; ano: number } | null {
  for (let c = colInicio; c < (linhaTexto?.length ?? 0); c++) {
    const parsed = parseMesAno(linhaTexto?.[c]);
    if (parsed) return parsed;
  }
  return null;
}

type FaixaCodigo = { codigo: string; inicio: string; fim: string };

// Procura por células no formato da legenda ("P1 - 05h00 as 07:00") em
// qualquer lugar da planilha, sem depender de onde ela está posicionada.
function extrairLegenda(texto: string[][]): FaixaCodigo[] {
  const legenda: FaixaCodigo[] = [];
  const padrao = /^(\S+)\s*-\s*(\d{1,2})[h:](\d{2})\s*(?:as|à)\s*(\d{1,2})[h:](\d{2})/i;
  for (const linha of texto) {
    for (const celula of linha) {
      if (!celula) continue;
      const m = celula.trim().match(padrao);
      if (!m) continue;
      legenda.push({
        codigo: normalizarTexto(m[1]),
        inicio: `${m[2].padStart(2, "0")}:${m[3]}`,
        fim: `${m[4].padStart(2, "0")}:${m[5]}`,
      });
    }
  }
  return legenda;
}

type AncoraRecursos = { rHeader: number; cRecurso: number };

function localizarAncorasRecursos(texto: string[][]): AncoraRecursos[] {
  const ancoras: AncoraRecursos[] = [];
  for (let r = 0; r < texto.length; r++) {
    for (let c = 0; c < texto[r].length; c++) {
      const celula = texto[r][c];
      if (celula && AREA_RECURSO_LABEL.includes(normalizarTexto(celula))) {
        ancoras.push({ rHeader: r, cRecurso: c });
      }
    }
  }
  return ancoras;
}

// Colunas de código de plantão começam logo após "Recursos" (e depois de
// "Contato", se essa coluna existir nessa posição).
function localizarColunaContatoEInicioDias(texto: string[][], rHeader: number, cRecurso: number) {
  const possivelContato = texto[rHeader]?.[cRecurso + 1];
  const temContato = possivelContato !== undefined && AREA_CONTATO_LABEL.includes(normalizarTexto(possivelContato));
  return {
    cContato: temContato ? cRecurso + 1 : null,
    colInicioDias: temContato ? cRecurso + 2 : cRecurso + 1,
  };
}

// A linha de números do dia (1, 2, 3...) fica logo abaixo do cabeçalho
// "Recursos"/"Contato"/mês-ano.
function localizarColunasPorDia(texto: string[][], rDias: number, colInicio: number): Map<number, number> {
  const mapa = new Map<number, number>();
  const linha = texto[rDias] ?? [];
  for (let c = colInicio; c < linha.length; c++) {
    const n = Number((linha[c] ?? "").trim());
    if (Number.isInteger(n) && n >= 1 && n <= 31) mapa.set(n, c);
  }
  return mapa;
}

// Linhas de pessoa: da linha seguinte ao cabeçalho em diante, toda linha com
// algo escrito na coluna "Recursos" — pulando as linhas de número do dia e
// de dia da semana (que não têm nada nessa coluna) — até uma linha
// completamente vazia (fim do bloco) ou outra âncora "Recursos" (próximo bloco).
function localizarLinhasRecurso(texto: string[][], rHeader: number, cRecurso: number): number[] {
  const linhas: number[] = [];
  for (let r = rHeader + 1; r < texto.length; r++) {
    const linha = texto[r] ?? [];
    const nome = linha[cRecurso]?.trim();
    if (nome && AREA_RECURSO_LABEL.includes(normalizarTexto(nome))) break;
    const linhaVazia = linha.every((v) => !v || !v.trim());
    if (linhaVazia) {
      if (linhas.length > 0) break;
      continue;
    }
    if (nome) linhas.push(r);
  }
  return linhas;
}

export async function buscarPlantaoHoje(): Promise<PlantaoLinha[]> {
  const token = await obterTokenAppOnly();
  const siteId = await resolverSiteId(token);
  const aba = await resolverPrimeiraAba(token, siteId);
  const range = await buscarUsedRange(token, siteId, aba.id);

  const ancoras = localizarAncorasRecursos(range.text);
  if (ancoras.length === 0) {
    throw new Error('Não foi encontrada nenhuma coluna "Recursos" na planilha de plantão.');
  }

  const legenda = extrairLegenda(range.text);
  if (legenda.length === 0) {
    throw new Error("Não foi possível ler a legenda de horários (ex.: \"P1 - 05h00 as 07:00\") na planilha.");
  }

  const [anoAtual, mesAtual, diaAtualStr] = dataBR().split("-");
  const diaAtual = Number(diaAtualStr);
  const mesAtualNum = Number(mesAtual);
  const anoAtualNum = Number(anoAtual);
  const horaAtual = horaBR();

  const resultado: PlantaoLinha[] = [];

  for (const { rHeader, cRecurso } of ancoras) {
    const { cContato, colInicioDias } = localizarColunaContatoEInicioDias(range.text, rHeader, cRecurso);

    const mesAno = localizarMesAno(range.text[rHeader], colInicioDias);
    if (mesAno && (mesAno.mes !== mesAtualNum || mesAno.ano !== anoAtualNum)) continue;

    const rDias = rHeader + 1;
    const colunasPorDia = localizarColunasPorDia(range.text, rDias, colInicioDias);
    const colDiaAtual = colunasPorDia.get(diaAtual);
    if (colDiaAtual === undefined) continue;

    const linhasRecurso = localizarLinhasRecurso(range.text, rHeader, cRecurso);

    for (const r of linhasRecurso) {
      const codigoCelula = range.text[r]?.[colDiaAtual]?.trim();
      if (!codigoCelula) continue;

      const codigos = codigoCelula.split("/").map(normalizarTexto).filter(Boolean);
      const ativoAgora = codigos.some((codigo) => {
        const faixa = legenda.find((f) => f.codigo === codigo);
        return faixa && horaAtual >= faixa.inicio && horaAtual <= faixa.fim;
      });
      if (!ativoAgora) continue;

      resultado.push({
        area: aba.name,
        analista: range.text[r][cRecurso].trim(),
        telefone: cContato !== null ? (range.text[r][cContato]?.trim() ?? "") : "",
      });
    }
  }

  return resultado;
}
