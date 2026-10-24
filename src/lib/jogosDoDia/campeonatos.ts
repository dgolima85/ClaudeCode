// Campeonatos/divisões que devem aparecer no painel "Jogos de Hoje" — lista
// fechada, pedida explicitamente (Brasileirão, Sul-Americana, Libertadores,
// Liga dos Campeões, e os campeonatos Alemão/Espanhol/Italiano/Inglês/
// Francês). Qualquer outro campeonato (Série B, Copa do Brasil, seleções,
// etc.) fica de fora por não estar nessa lista — não é um bloqueio
// específico à Série B, é uma lista de permissão.
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
];

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function isCampeonatoPermitido(nome: string, slug: string): boolean {
  const nomeNorm = normalizar(nome);
  const slugNorm = normalizar(slug);
  return CAMPEONATOS_PERMITIDOS.some(
    (c) =>
      (slugNorm && c.slugs.some((s) => normalizar(s) === slugNorm)) ||
      (nomeNorm && c.nomes.some((n) => n === nomeNorm)),
  );
}
