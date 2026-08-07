"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { nomeSchema } from "@/lib/validations";
import { isForeignKeyError, isUniqueConstraintError } from "@/lib/prismaErrors";

export async function criarAmbiente(dados: Record<string, string>) {
  const parsed = nomeSchema.safeParse(dados.nome);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  try {
    await prisma.ambiente.create({ data: { nome: parsed.data } });
  } catch (e) {
    if (isUniqueConstraintError(e)) return { error: "Já existe um ambiente com esse nome." };
    return { error: "Não foi possível criar o ambiente." };
  }
  revalidatePath("/admin/ambientes");
  return {};
}

export async function atualizarAmbiente(id: string, dados: Record<string, string | boolean>) {
  const parsed = nomeSchema.safeParse(dados.nome);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  try {
    await prisma.ambiente.update({
      where: { id },
      data: { nome: parsed.data, ativo: Boolean(dados.ativo) },
    });
  } catch (e) {
    if (isUniqueConstraintError(e)) return { error: "Já existe um ambiente com esse nome." };
    return { error: "Não foi possível atualizar o ambiente." };
  }
  revalidatePath("/admin/ambientes");
  return {};
}

export async function excluirAmbiente(id: string) {
  try {
    await prisma.ambiente.delete({ where: { id } });
  } catch (e) {
    if (isForeignKeyError(e)) {
      return {
        error: "Não é possível excluir: este ambiente já está em uso em ocorrências. Desative-o em vez de excluir.",
      };
    }
    return { error: "Não foi possível excluir o ambiente." };
  }
  revalidatePath("/admin/ambientes");
  return {};
}
