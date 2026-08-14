/** Coloca o item "N/A" (se existir) no topo da lista, mantendo a ordem alfabética dos demais. */
export function ordenarComNaPrimeiro<T extends { nome: string }>(itens: T[]): T[] {
  return [...itens].sort((a, b) => {
    const aNA = a.nome === "N/A" ? 0 : 1;
    const bNA = b.nome === "N/A" ? 0 : 1;
    return aNA - bNA;
  });
}
