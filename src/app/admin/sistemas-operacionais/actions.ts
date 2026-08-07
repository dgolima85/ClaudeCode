"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { nomeSchema } from "@/lib/validations";
import { isForeignKeyError, isUniqueConstraintError } from "@/lib/prismaErrors";

export async function criarSistemaOperacional(dados: Record<string, string>) {
  const parsed = nomeSchema.safeParse(dados.nome);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  try {
    await prisma.sistemaOperacional.create({ data: { nome: parsed.data } });
  } catch (e) {
    if (isUniqueConstraintError(e)) return { error: "Já existe um sistema operacional com esse nome." };
    return { error: "Não foi possível criar o sistema operacional." };
  }
  revalidatePath("/admin/sistemas-operacionais");
  return {};
}

export async function atualizarSistemaOperacional(id: string, dados: Record<string, string | boolean>) {
  const parsed = nomeSchema.safeParse(dados.nome);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  try {
    await prisma.sistemaOperacional.update({
      where: { id },
      data: { nome: parsed.data, ativo: Boolean(dados.ativo) },
    });
  } catch (e) {
    if (isUniqueConstraintError(e)) return { error: "Já existe um sistema operacional com esse nome." };
    return { error: "Não foi possível atualizar o sistema operacional." };
  }
  revalidatePath("/admin/sistemas-operacionais");
  return {};
}

export async function excluirSistemaOperacional(id: string) {
  try {
    await prisma.sistemaOperacional.delete({ where: { id } });
  } catch (e) {
    if (isForeignKeyError(e)) {
      return {
        error:
          "Não é possível excluir: este sistema operacional já está em uso em ocorrências. Desative-o em vez de excluir.",
      };
    }
    return { error: "Não foi possível excluir o sistema operacional." };
  }
  revalidatePath("/admin/sistemas-operacionais");
  return {};
}
