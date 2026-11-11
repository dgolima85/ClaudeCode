"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { exigirAnalistaLogado } from "@/lib/session";
import { deInputDataHoraBR } from "@/lib/dataHoraBR";
import {
  DESVIO_OPERACIONAL_ID,
  diasEntreCalendario,
  buscarHistoricoDesvioOperacional,
  type DesvioOperacionalRegistroInfo,
} from "@/lib/desvioOperacional";

/**
 * Reseta o indicador "dias sem Desvio Operacional" e registra o desvio no
 * histórico — usado quando um desvio acontece de fato. `ocorridoEmInput` é
 * o valor de um <input type="datetime-local"> (horário de Brasília, pode
 * ser uma data/hora passada, não precisa ser "agora"). Antes de zerar,
 * trava o streak corrente (calculado até a data escolhida, não até "agora")
 * como recorde se ele superar o recorde já salvo.
 */
export async function resetarDesvioOperacional(
  ocorridoEmInput: string,
  motivo: string,
): Promise<{ error?: string }> {
  const analista = await exigirAnalistaLogado();

  const motivoLimpo = motivo.trim();
  if (!motivoLimpo) return { error: "Informe o motivo do desvio." };
  if (!ocorridoEmInput) return { error: "Informe a data e hora do desvio." };

  const ocorridoEm = deInputDataHoraBR(ocorridoEmInput);
  if (Number.isNaN(ocorridoEm.getTime())) return { error: "Data e hora inválidas." };

  const agora = new Date();
  if (ocorridoEm.getTime() > agora.getTime()) {
    return { error: "A data do desvio não pode ser no futuro." };
  }

  const atual = await prisma.desvioOperacional.findUnique({ where: { id: DESVIO_OPERACIONAL_ID } });
  if (atual && ocorridoEm.getTime() < atual.ultimoDesvioEm.getTime()) {
    return { error: "A data do desvio não pode ser anterior ao último desvio já registrado." };
  }

  const diasAtual = atual ? diasEntreCalendario(atual.ultimoDesvioEm, ocorridoEm) : 0;
  const recordeAnterior = atual?.recordeDias ?? 0;
  const novoRecorde = Math.max(recordeAnterior, diasAtual);

  await prisma.$transaction([
    prisma.desvioOperacional.upsert({
      where: { id: DESVIO_OPERACIONAL_ID },
      create: { id: DESVIO_OPERACIONAL_ID, ultimoDesvioEm: ocorridoEm, recordeDias: 0, atualizadoPorId: analista.id },
      update: { ultimoDesvioEm: ocorridoEm, recordeDias: novoRecorde, atualizadoPorId: analista.id },
    }),
    prisma.desvioOperacionalRegistro.create({
      data: { ocorridoEm, motivo: motivoLimpo, registradoPorId: analista.id },
    }),
  ]);

  revalidatePath("/");
  return {};
}

export async function listarHistoricoDesvioOperacional(): Promise<DesvioOperacionalRegistroInfo[]> {
  await exigirAnalistaLogado();
  return buscarHistoricoDesvioOperacional();
}
