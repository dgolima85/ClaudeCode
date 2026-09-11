// Filtro por Origem na Home: três botões mutuamente exclusivos (só um
// ativo por vez — ver FiltroOrigem.tsx). "Todas as Origens" não é uma
// condição própria — é o atalho pra nenhum dos dois valores abaixo estar
// selecionado, ou seja, sem restrição de origem.
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
