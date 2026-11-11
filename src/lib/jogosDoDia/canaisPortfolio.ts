// Confronto entre os canais de transmissão de um jogo (vindos do UOL) e o
// nosso portfólio de canais (cadastro em Administração > Canais de
// Transmissão — ver prisma/schema.prisma `CanalPortfolio`). Normaliza os
// dois lados (sem acento/caixa/espaço/pontuação) porque o nome cadastrado
// no portfólio não precisa bater caractere a caractere com o nome que o UOL
// usa (ex.: "GE TV" cadastrado vs "ge TV" do UOL; "Rede TV" vs "RedeTV!").
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * true se `canal` (nome vindo do UOL) está no portfólio. Além do match
 * exato normalizado, cobre o caso de o portfólio ter feeds numerados de um
 * mesmo canal (ex.: "Premiere 1".."Premiere 8") mas o UOL informar só o
 * nome genérico sem número (ex.: "Premiere") — nesse caso, se existe algum
 * feed numerado daquele canal no portfólio, considera que é nosso.
 */
export function isCanalDoPortfolio(canal: string, portfolioNormalizado: Set<string>): boolean {
  const nomeNorm = normalizar(canal);
  if (!nomeNorm) return false;
  if (portfolioNormalizado.has(nomeNorm)) return true;
  if (/\d$/.test(nomeNorm)) return false;
  for (const item of portfolioNormalizado) {
    if (item.startsWith(nomeNorm) && /^\d+$/.test(item.slice(nomeNorm.length))) return true;
  }
  return false;
}

export function normalizarNomeCanal(nome: string): string {
  return normalizar(nome);
}
