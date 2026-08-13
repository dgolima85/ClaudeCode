"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { recursoSchema } from "@/lib/validations";
import { isForeignKeyError, isUniqueConstraintError } from "@/lib/prismaErrors";

export async function criarRecurso(dados: Record<string, string>) {
  const parsed = recursoSchema.safeParse(dados);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  try {
    await prisma.recurso.create({ data: parsed.data });
  } catch (e) {
    if (isUniqueConstraintError(e)) return { error: "Já existe um recurso com esse nome nesse ambiente." };
    return { error: "Não foi possível criar o recurso." };
  }
  revalidatePath("/admin/recursos");
  return {};
}

export async function atualizarRecurso(id: string, dados: Record<string, string | boolean>) {
  const parsed = recursoSchema.safeParse(dados);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  try {
    await prisma.recurso.update({
      where: { id },
      data: { ...parsed.data, ativo: Boolean(dados.ativo) },
    });
  } catch (e) {
    if (isUniqueConstraintError(e)) return { error: "Já existe um recurso com esse nome nesse ambiente." };
    return { error: "Não foi possível atualizar o recurso." };
  }
  revalidatePath("/admin/recursos");
  return {};
}

export async function excluirRecurso(id: string) {
  try {
    await prisma.recurso.delete({ where: { id } });
  } catch (e) {
    if (isForeignKeyError(e)) {
      return {
        error: "Não é possível excluir: este recurso já está em uso em ocorrências. Desative-o em vez de excluir.",
      };
    }
    return { error: "Não foi possível excluir o recurso." };
  }
  revalidatePath("/admin/recursos");
  return {};
}
