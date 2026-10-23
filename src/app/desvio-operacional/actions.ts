"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { exigirAnalistaLogado } from "@/lib/session";
import { DESVIO_OPERACIONAL_ID, diasEntreCalendario } from "@/lib/desvioOperacional";

/**
 * Reseta o indicador "dias sem Desvio Operacional" pra hoje — usado quando
 * um desvio acontece de fato. Antes de zerar, trava o streak corrente como
 * recorde se ele superar o recorde já salvo.
 */
export async function resetarDesvioOperacional(): Promise<{ error?: string }> {
  const analista = await exigirAnalistaLogado();
  const agora = new Date();

  const atual = await prisma.desvioOperacional.findUnique({ where: { id: DESVIO_OPERACIONAL_ID } });
  const diasAtual = atual ? diasEntreCalendario(atual.ultimoDesvioEm, agora) : 0;
  const recordeAnterior = atual?.recordeDias ?? 0;
  const novoRecorde = Math.max(recordeAnterior, diasAtual);

  await prisma.desvioOperacional.upsert({
    where: { id: DESVIO_OPERACIONAL_ID },
    create: { id: DESVIO_OPERACIONAL_ID, ultimoDesvioEm: agora, recordeDias: 0, atualizadoPorId: analista.id },
    update: { ultimoDesvioEm: agora, recordeDias: novoRecorde, atualizadoPorId: analista.id },
  });

  revalidatePath("/");
  return {};
}
