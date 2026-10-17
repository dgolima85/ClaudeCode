import { NextResponse } from "next/server";
import { sincronizarJogosDoDia } from "@/lib/jogosDoDia/sync";
import { buscarHtmlCentralDeJogos } from "@/lib/jogosDoDia/uol";
import { diagnosticarHtml } from "@/lib/jogosDoDia/parser";

// Chamada pela rotina agendada do Vercel Cron (ver vercel.json). Protegida
// por CRON_SECRET quando configurada — o Vercel Cron manda essa chave
// automaticamente como "Authorization: Bearer <CRON_SECRET>" em produção;
// sem a variável configurada, a rota fica aberta (ok em desenvolvimento
// local, mas configure CRON_SECRET em produção pra ninguém mais disparar a
// sincronização à vontade).
export async function GET(request: Request) {
  const segredoEsperado = process.env.CRON_SECRET;
  if (segredoEsperado) {
    const autorizacao = request.headers.get("authorization");
    if (autorizacao !== `Bearer ${segredoEsperado}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  }

  // "?debug=1": diagnóstico temporário (ver parser.ts `diagnosticarHtml`)
  // pra investigar o que a página da fonte está devolvendo em produção,
  // sem rodar a sincronização de verdade. Remover depois de confirmar que
  // a extração está funcionando.
  const url = new URL(request.url);
  if (url.searchParams.get("debug") === "1") {
    const html = await buscarHtmlCentralDeJogos();
    return NextResponse.json(diagnosticarHtml(html));
  }

  const resultado = await sincronizarJogosDoDia();
  return NextResponse.json(resultado, { status: resultado.ok ? 200 : 500 });
}
