"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { nomeSchema } from "@/lib/validations";
import { isForeignKeyError, isUniqueConstraintError } from "@/lib/prismaErrors";

export async function criarParceria(dados: Record<string, string>) {
  const parsed = nomeSchema.safeParse(dados.nome);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  try {
    await prisma.parceria.create({ data: { nome: parsed.data } });
  } catch (e) {
    if (isUniqueConstraintError(e)) return { error: "Já existe uma parceria com esse nome." };
    return { error: "Não foi possível criar a parceria." };
  }
  revalidatePath("/admin/parcerias");
  revalidatePath("/admin/empresas");
  return {};
}

export async function atualizarParceria(id: string, dados: Record<string, string | boolean>) {
  const parsed = nomeSchema.safeParse(dados.nome);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  try {
    await prisma.parceria.update({
      where: { id },
      data: { nome: parsed.data, ativo: Boolean(dados.ativo) },
    });
  } catch (e) {
    if (isUniqueConstraintError(e)) return { error: "Já existe uma parceria com esse nome." };
    return { error: "Não foi possível atualizar a parceria." };
  }
  revalidatePath("/admin/parcerias");
  revalidatePath("/admin/empresas");
  return {};
}

export async function excluirParceria(id: string) {
  try {
    await prisma.parceria.delete({ where: { id } });
  } catch (e) {
    if (isForeignKeyError(e)) {
      return {
        error:
          "Não é possível excluir: esta parceria possui empresas ou ocorrências vinculadas. Desative-a em vez de excluir.",
      };
    }
    return { error: "Não foi possível excluir a parceria." };
  }
  revalidatePath("/admin/parcerias");
  return {};
}
