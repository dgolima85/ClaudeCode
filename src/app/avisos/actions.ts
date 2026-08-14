"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { exigirAnalistaLogado } from "@/lib/session";
import { avisoSchema } from "@/lib/validations";
import { deInputDataHoraBR } from "@/lib/dataHoraBR";

export type AvisoCriado = {
  id: string;
  modelo: string;
  descricao: string;
  expiraEm: string;
};

export async function criarAviso(dados: {
  modelo: string;
  descricao: string;
  expiraEm: string;
}): Promise<{ error?: string; aviso?: AvisoCriado }> {
  const analista = await exigirAnalistaLogado();
  const parsed = avisoSchema.safeParse(dados);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const aviso = await prisma.aviso.create({
    data: {
      modelo: parsed.data.modelo,
      descricao: parsed.data.descricao,
      expiraEm: deInputDataHoraBR(parsed.data.expiraEm),
      analistaId: analista.id,
    },
  });

  revalidatePath("/");
  return {
    aviso: {
      id: aviso.id,
      modelo: aviso.modelo,
      descricao: aviso.descricao,
      expiraEm: aviso.expiraEm.toISOString(),
    },
  };
}

export async function atualizarAviso(
  id: string,
  dados: { modelo: string; descricao: string; expiraEm: string },
): Promise<{ error?: string; aviso?: AvisoCriado }> {
  await exigirAnalistaLogado();
  const parsed = avisoSchema.safeParse(dados);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const aviso = await prisma.aviso.update({
    where: { id },
    data: {
      modelo: parsed.data.modelo,
      descricao: parsed.data.descricao,
      expiraEm: deInputDataHoraBR(parsed.data.expiraEm),
    },
  });

  revalidatePath("/");
  return {
    aviso: {
      id: aviso.id,
      modelo: aviso.modelo,
      descricao: aviso.descricao,
      expiraEm: aviso.expiraEm.toISOString(),
    },
  };
}

export async function excluirAviso(id: string): Promise<{ error?: string }> {
  await exigirAnalistaLogado();
  await prisma.aviso.delete({ where: { id } });
  revalidatePath("/");
  return {};
}
