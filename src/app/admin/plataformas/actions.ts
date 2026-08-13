"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { nomeSchema } from "@/lib/validations";
import { isForeignKeyError, isUniqueConstraintError } from "@/lib/prismaErrors";

export async function criarPlataforma(dados: Record<string, string>) {
  const parsed = nomeSchema.safeParse(dados.nome);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  try {
    await prisma.plataforma.create({ data: { nome: parsed.data } });
  } catch (e) {
    if (isUniqueConstraintError(e)) return { error: "Já existe uma plataforma com esse nome." };
    return { error: "Não foi possível criar a plataforma." };
  }
  revalidatePath("/admin/plataformas");
  return {};
}

export async function atualizarPlataforma(id: string, dados: Record<string, string | boolean>) {
  const parsed = nomeSchema.safeParse(dados.nome);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  try {
    await prisma.plataforma.update({
      where: { id },
      data: { nome: parsed.data, ativo: Boolean(dados.ativo) },
    });
  } catch (e) {
    if (isUniqueConstraintError(e)) return { error: "Já existe uma plataforma com esse nome." };
    return { error: "Não foi possível atualizar a plataforma." };
  }
  revalidatePath("/admin/plataformas");
  return {};
}

export async function excluirPlataforma(id: string) {
  try {
    await prisma.plataforma.delete({ where: { id } });
  } catch (e) {
    if (isForeignKeyError(e)) {
      return {
        error:
          "Não é possível excluir: esta plataforma já está em uso em ocorrências. Desative-a em vez de excluir.",
      };
    }
    return { error: "Não foi possível excluir a plataforma." };
  }
  revalidatePath("/admin/plataformas");
  return {};
}
