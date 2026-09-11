// Filtro por Origem na Home, com a mesma mecânica de múltipla escolha
// combinada por OR já usada no filtro de status (ver FiltroStatus.tsx):
// os dois valores abaixo podem ser ativados juntos ou de forma independente.
// "Todas as Origens" não é uma condição própria — é o atalho pra nenhum
// (ou os dois) estar selecionado, ou seja, sem restrição de origem.
export const FILTROS_ORIGEM = ["MONITORIA_APP", "DEMAIS_ORIGENS"] as const;

export type FiltroOrigemValor = (typeof FILTROS_ORIGEM)[number];

export const ORIGEM_FILTRO_LABELS: Record<FiltroOrigemValor, string> = {
  MONITORIA_APP: "Monitoria APP",
  DEMAIS_ORIGENS: "Demais Origens",
};

export function isFiltroOrigemValor(value: string): value is FiltroOrigemValor {
  return (FILTROS_ORIGEM as readonly string[]).includes(value);
}

// Nome do TipoOcorrencia usado como referência pro botão "Monitoria APP".
// Tipos de ocorrência são cadastrados livremente em Administração → Tipos
// de Ocorrência (não é um enum fixo no código) — por isso a comparação é
// sempre sem diferenciar maiúsculas/minúsculas.
export const NOME_TIPO_MONITORIA_APP = "Monitoria APP";
