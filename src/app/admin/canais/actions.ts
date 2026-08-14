"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { nomeSchema } from "@/lib/validations";
import { isForeignKeyError, isUniqueConstraintError } from "@/lib/prismaErrors";

export async function criarCanal(dados: Record<string, string>) {
  const parsed = nomeSchema.safeParse(dados.nome);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  try {
    await prisma.canal.create({ data: { nome: parsed.data } });
  } catch (e) {
    if (isUniqueConstraintError(e)) return { error: "Já existe um canal com esse nome." };
    return { error: "Não foi possível criar o canal." };
  }
  revalidatePath("/admin/canais");
  return {};
}

export async function atualizarCanal(id: string, dados: Record<string, string | boolean>) {
  const parsed = nomeSchema.safeParse(dados.nome);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  try {
    await prisma.canal.update({
      where: { id },
      data: { nome: parsed.data, ativo: Boolean(dados.ativo) },
    });
  } catch (e) {
    if (isUniqueConstraintError(e)) return { error: "Já existe um canal com esse nome." };
    return { error: "Não foi possível atualizar o canal." };
  }
  revalidatePath("/admin/canais");
  return {};
}

export async function excluirCanal(id: string) {
  try {
    await prisma.canal.delete({ where: { id } });
  } catch (e) {
    if (isForeignKeyError(e)) {
      return {
        error: "Não é possível excluir: este canal já está em uso em ocorrências. Desative-o em vez de excluir.",
      };
    }
    return { error: "Não foi possível excluir o canal." };
  }
  revalidatePath("/admin/canais");
  return {};
}
