"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { analistaSchema } from "@/lib/validations";
import { isForeignKeyError, isUniqueConstraintError } from "@/lib/prismaErrors";

export async function criarAnalista(dados: Record<string, string>) {
  const parsed = analistaSchema.safeParse(dados);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  try {
    await prisma.analista.create({ data: parsed.data });
  } catch (e) {
    if (isUniqueConstraintError(e)) return { error: "Já existe um analista com esse email." };
    return { error: "Não foi possível criar o analista." };
  }
  revalidatePath("/admin/analistas");
  revalidatePath("/login");
  return {};
}

export async function atualizarAnalista(id: string, dados: Record<string, string | boolean>) {
  const parsed = analistaSchema.safeParse(dados);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  try {
    await prisma.analista.update({
      where: { id },
      data: { ...parsed.data, ativo: Boolean(dados.ativo) },
    });
  } catch (e) {
    if (isUniqueConstraintError(e)) return { error: "Já existe um analista com esse email." };
    return { error: "Não foi possível atualizar o analista." };
  }
  revalidatePath("/admin/analistas");
  revalidatePath("/login");
  return {};
}

export async function excluirAnalista(id: string) {
  try {
    await prisma.analista.delete({ where: { id } });
  } catch (e) {
    if (isForeignKeyError(e)) {
      return {
        error:
          "Não é possível excluir: este analista já possui ocorrências ou eventos registrados. Desative-o em vez de excluir.",
      };
    }
    return { error: "Não foi possível excluir o analista." };
  }
  revalidatePath("/admin/analistas");
  revalidatePath("/login");
  return {};
}
