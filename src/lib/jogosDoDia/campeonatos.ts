// Campeonatos/divisões que devem aparecer no painel "Jogos de Hoje" — lista
// fechada, pedida explicitamente (Brasileirão, Sul-Americana, Libertadores,
// Liga dos Campeões, os campeonatos Alemão/Espanhol/Italiano/Inglês/
// Francês, a Copa da Liga Inglesa, a Copa do Brasil, a Liga das Nações, os
// Amistosos Internacionais e os Amistosos da Seleção Brasileira). Qualquer
// outro campeonato (Série B, etc.) fica de fora por não estar nessa lista —
// não é um bloqueio específico à Série B, é uma lista de permissão.
//
// Casa tanto pelo "slug" quanto pelo nome (normalizado, sem acento/caixa)
// porque não há como confirmar ao vivo o slug exato que o UOL usa pra cada
// campeonato (este ambiente de desenvolvimento não tem acesso à internet
// externa — ver conversa). Casar pelos dois reduz o risco de um campeonato
// pedido ficar de fora só por causa de um slug diferente do esperado.
type CampeonatoPermitido = {
  slugs: string[];
  nomes: string[];
};

const CAMPEONATOS_PERMITIDOS: CampeonatoPermitido[] = [
  { slugs: ["brasileirao"], nomes: ["brasileirao", "brasileirao serie a", "campeonato brasileiro"] },
  { slugs: ["sul-americana", "copa-sul-americana"], nomes: ["sul-americana", "copa sul-americana"] },
  { slugs: ["libertadores"], nomes: ["libertadores"] },
  {
    slugs: ["liga-dos-campeoes", "champions-league", "uefa-champions-league"],
    nomes: ["liga dos campeoes", "champions league"],
  },
  { slugs: ["alemao", "bundesliga"], nomes: ["alemao", "campeonato alemao", "bundesliga"] },
  { slugs: ["espanhol", "laliga", "la-liga"], nomes: ["espanhol", "campeonato espanhol", "laliga", "la liga"] },
  { slugs: ["italiano", "serie-a-italiana"], nomes: ["italiano", "campeonato italiano"] },
  { slugs: ["ingles", "premier-league"], nomes: ["ingles", "campeonato ingles", "premier league"] },
  { slugs: ["frances", "ligue-1"], nomes: ["frances", "campeonato frances", "ligue 1"] },
  {
    slugs: ["copa-da-liga-inglesa", "efl-cup", "carabao-cup", "league-cup"],
    nomes: ["copa da liga inglesa", "efl cup", "carabao cup", "league cup"],
  },
  { slugs: ["copa-do-brasil"], nomes: ["copa do brasil"] },
  {
    slugs: ["liga-das-nacoes", "nations-league", "uefa-nations-league"],
    nomes: ["liga das nacoes", "nations league"],
  },
  {
    slugs: ["amistosos-internacionais", "amistoso-internacional", "international-friendlies", "friendlies"],
    nomes: ["amistosos internacionais", "amistoso internacional", "international friendlies", "friendlies"],
  },
  {
    slugs: [
      "amistosos-selecao-brasileira",
      "amistoso-selecao-brasileira",
      "amistosos-da-selecao-brasileira",
      "amistoso-da-selecao-brasileira",
    ],
    nomes: [
      "amistosos selecao brasileira",
      "amistoso selecao brasileira",
      "amistosos da selecao brasileira",
      "amistoso da selecao brasileira",
    ],
  },
];

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

// A UOL inclui a edição/temporada em alguns campeonatos, às vezes como ano
// cheio ("Copa da Liga Inglesa 2027"), às vezes curto ("Copa do Brasil -
// 26") — remove de 2 a 4 dígitos no fim do nome/slug antes de comparar, pra
// não precisar atualizar a lista toda virada de ano/temporada. Seguro pra
// nomes permitidos com número no fim (ex. "Ligue 1"): só um dígito, abaixo
// do mínimo de 2 exigido aqui.
function semAnoFinal(texto: string): string {
  return texto.replace(/[\s-]*\d{2,4}$/, "").trim();
}

export function isCampeonatoPermitido(nome: string, slug: string): boolean {
  const nomeNorm = semAnoFinal(normalizar(nome));
  const slugNorm = semAnoFinal(normalizar(slug));
  return CAMPEONATOS_PERMITIDOS.some(
    (c) =>
      (slugNorm && c.slugs.some((s) => normalizar(s) === slugNorm)) ||
      (nomeNorm && c.nomes.some((n) => n === nomeNorm)),
  );
}
