"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { nomeSchema } from "@/lib/validations";
import { isForeignKeyError, isUniqueConstraintError } from "@/lib/prismaErrors";

export async function criarCausa(dados: Record<string, string>) {
  const parsed = nomeSchema.safeParse(dados.nome);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  try {
    await prisma.causa.create({ data: { nome: parsed.data } });
  } catch (e) {
    if (isUniqueConstraintError(e)) return { error: "Já existe uma causa com esse nome." };
    return { error: "Não foi possível criar a causa." };
  }
  revalidatePath("/admin/causas");
  return {};
}

export async function atualizarCausa(id: string, dados: Record<string, string | boolean>) {
  const parsed = nomeSchema.safeParse(dados.nome);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  try {
    await prisma.causa.update({
      where: { id },
      data: { nome: parsed.data, ativo: Boolean(dados.ativo) },
    });
  } catch (e) {
    if (isUniqueConstraintError(e)) return { error: "Já existe uma causa com esse nome." };
    return { error: "Não foi possível atualizar a causa." };
  }
  revalidatePath("/admin/causas");
  return {};
}

export async function excluirCausa(id: string) {
  try {
    await prisma.causa.delete({ where: { id } });
  } catch (e) {
    if (isForeignKeyError(e)) {
      return {
        error: "Não é possível excluir: esta causa já está em uso em ocorrências. Desative-a em vez de excluir.",
      };
    }
    return { error: "Não foi possível excluir a causa." };
  }
  revalidatePath("/admin/causas");
  return {};
}
