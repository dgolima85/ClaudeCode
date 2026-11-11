const URL_CENTRAL_DE_JOGOS = "https://www.uol.com.br/esporte/futebol/central-de-jogos/";

/** Busca o HTML da Central de Jogos do UOL — ver src/lib/jogosDoDia/parser.ts pra extração dos dados. */
export async function buscarHtmlCentralDeJogos(): Promise<string> {
  const resposta = await fetch(URL_CENTRAL_DE_JOGOS, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      Accept: "text/html",
    },
    // Sem cache aqui — a cadência já é controlada pela rotina agendada que
    // chama essa função (ver sync.ts), cachear nesse nível só confundiria.
    cache: "no-store",
  });
  if (!resposta.ok) {
    throw new Error(`A Central de Jogos do UOL respondeu HTTP ${resposta.status}.`);
  }
  return resposta.text();
}
