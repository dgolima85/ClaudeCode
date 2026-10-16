import { NextResponse } from "next/server";
import { sincronizarJogosDoDia } from "@/lib/jogosDoDia/sync";

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

  const resultado = await sincronizarJogosDoDia();
  return NextResponse.json(resultado, { status: resultado.ok ? 200 : 500 });
}
