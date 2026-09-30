// Nome do TipoOcorrencia usado para distinguir a origem "Monitoria APP" do
// resto — separa as duas homes de Ocorrências (Ongoing em "/" e Qualidade
// App em "/ocorrencias-qualidade-app") e as duas passagens de turno (ver
// src/lib/origemPassagemTurno.ts).
export const NOME_TIPO_MONITORIA_APP = "Monitoria APP";

// Cláusulas de filtro do Prisma sobre TipoOcorrencia.nome, prontas pra usar
// em `where: { tipo: ... }`. mode:"insensitive" precisa ficar ao lado de
// `not`/`equals` (não aninhado dentro dele — NestedStringFilter não tem
// `mode`).
export const FILTRO_TIPO_MONITORIA_APP = {
  nome: { equals: NOME_TIPO_MONITORIA_APP, mode: "insensitive" as const },
};
export const FILTRO_TIPO_DEMAIS_ORIGENS = {
  nome: { not: NOME_TIPO_MONITORIA_APP, mode: "insensitive" as const },
};
