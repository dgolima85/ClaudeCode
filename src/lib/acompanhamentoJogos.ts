import { prisma } from "@/lib/prisma";

export type AcompanhamentoJogosRelatorio = {
  totalJogos: number;
  totalRegistros: number;
  percentualValidado: number;
  totalForaDoPortfolio: number;
  totalComIncidencia: number;
  porCampeonato: { campeonato: string; jogos: number; registros: number }[];
  porCanal: { canal: string; testados: number; naoTestados: number; total: number }[];
  porAnalista: { nome: string; registros: number }[];
  delayPorCanal: { canal: string; mediaSegundos: number | null; amostras: number; total: number }[];
  incidencias: {
    id: string;
    dataBR: string;
    mandante: string;
    visitante: string;
    canal: string;
    relatorio: string;
    registradoPor: string | null;
  }[];
};

// Frases padrão que os analistas usam quando a transmissão não teve nenhum
// problema — qualquer "Relatório pós jogo" que bata com uma dessas é
// considerado "sem incidência" e fica de fora da lista de incidências; o
// resto (inclusive texto vazio/placeholder como "---") é tratado como
// potencialmente relevante pra revisão.
const FRASES_SEM_INCIDENCIA = [
  "sem problema",
  "sem incidente",
  "sem incidênc",
  "sem ocorrênc",
  "sem falha",
  "sem registro de incident",
  "nenhuma intercorrênc",
  "ocorreu normalmente",
  "ocorreu sem falhas",
  "ocorreu sem problemas",
  "sem impacto",
];

function pareceIncidencia(texto: string): boolean {
  const normalizado = texto.trim().toLowerCase();
  if (!normalizado || normalizado === "---") return false;
  return !FRASES_SEM_INCIDENCIA.some((frase) => normalizado.includes(frase));
}

// Extrai segundos de textos livres como "25\" na frente", "20\"", "13" —
// best-effort: textos sem nenhum número (ex.: "sem comparação", "não
// validado") retornam null e ficam de fora da média, mas continuam
// contados como amostra registrada.
function parseDelaySegundos(texto: string): number | null {
  const match = texto.match(/(\d+)/);
  if (!match) return null;
  return Number(match[1]);
}

export async function buscarRelatorioAcompanhamentoJogos(): Promise<AcompanhamentoJogosRelatorio> {
  const registros = await prisma.jogoDoDiaAcompanhamento.findMany({
    include: { atualizadoPor: true },
    orderBy: { atualizadoEm: "desc" },
  });

  const jogosDistintos = new Set(registros.map((r) => r.jogoSourceId));

  const porCampeonatoMap = new Map<string, { jogos: Set<number>; registros: number }>();
  const porCanalMap = new Map<string, { testados: number; naoTestados: number; total: number }>();
  const porAnalistaMap = new Map<string, number>();
  const delayMap = new Map<string, { somaSegundos: number; amostras: number; total: number }>();
  const incidencias: AcompanhamentoJogosRelatorio["incidencias"] = [];

  let totalValidado = 0;
  let totalForaDoPortfolio = 0;

  for (const r of registros) {
    const campeonato = porCampeonatoMap.get(r.campeonato) ?? { jogos: new Set(), registros: 0 };
    campeonato.jogos.add(r.jogoSourceId);
    campeonato.registros += 1;
    porCampeonatoMap.set(r.campeonato, campeonato);

    const canal = porCanalMap.get(r.canal) ?? { testados: 0, naoTestados: 0, total: 0 };
    canal.total += 1;
    if (r.testadoValidado) canal.testados += 1;
    else canal.naoTestados += 1;
    porCanalMap.set(r.canal, canal);

    if (r.testadoValidado) totalValidado += 1;
    if (r.foraDoPortfolio) totalForaDoPortfolio += 1;

    const nomeAnalista = r.atualizadoPor?.nome ?? "—";
    porAnalistaMap.set(nomeAnalista, (porAnalistaMap.get(nomeAnalista) ?? 0) + 1);

    if (r.delayClaro && r.delayClaro.trim()) {
      const delay = delayMap.get(r.canal) ?? { somaSegundos: 0, amostras: 0, total: 0 };
      delay.total += 1;
      const segundos = parseDelaySegundos(r.delayClaro);
      if (segundos !== null) {
        delay.somaSegundos += segundos;
        delay.amostras += 1;
      }
      delayMap.set(r.canal, delay);
    }

    if (r.relatorioPosJogo && pareceIncidencia(r.relatorioPosJogo)) {
      incidencias.push({
        id: r.id,
        dataBR: r.dataBR,
        mandante: r.mandante,
        visitante: r.visitante,
        canal: r.canal,
        relatorio: r.relatorioPosJogo,
        registradoPor: r.atualizadoPor?.nome ?? null,
      });
    }
  }

  return {
    totalJogos: jogosDistintos.size,
    totalRegistros: registros.length,
    percentualValidado: registros.length > 0 ? Math.round((totalValidado / registros.length) * 100) : 0,
    totalForaDoPortfolio,
    totalComIncidencia: incidencias.length,
    porCampeonato: [...porCampeonatoMap.entries()]
      .map(([campeonato, v]) => ({ campeonato, jogos: v.jogos.size, registros: v.registros }))
      .sort((a, b) => b.registros - a.registros),
    porCanal: [...porCanalMap.entries()]
      .map(([canal, v]) => ({ canal, ...v }))
      .sort((a, b) => b.total - a.total),
    porAnalista: [...porAnalistaMap.entries()]
      .map(([nome, registros]) => ({ nome, registros }))
      .sort((a, b) => b.registros - a.registros),
    delayPorCanal: [...delayMap.entries()]
      .map(([canal, v]) => ({
        canal,
        mediaSegundos: v.amostras > 0 ? Math.round(v.somaSegundos / v.amostras) : null,
        amostras: v.amostras,
        total: v.total,
      }))
      .sort((a, b) => b.total - a.total),
    incidencias,
  };
}
