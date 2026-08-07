"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { empresaSchema } from "@/lib/validations";
import { isForeignKeyError, isUniqueConstraintError } from "@/lib/prismaErrors";

export async function criarEmpresa(dados: Record<string, string>) {
  const parsed = empresaSchema.safeParse(dados);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  try {
    await prisma.empresa.create({ data: parsed.data });
  } catch (e) {
    if (isUniqueConstraintError(e)) return { error: "Já existe uma empresa com esse nome nessa parceria." };
    return { error: "Não foi possível criar a empresa." };
  }
  revalidatePath("/admin/empresas");
  return {};
}

export async function atualizarEmpresa(id: string, dados: Record<string, string | boolean>) {
  const parsed = empresaSchema.safeParse(dados);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  try {
    await prisma.empresa.update({
      where: { id },
      data: { ...parsed.data, ativo: Boolean(dados.ativo) },
    });
  } catch (e) {
    if (isUniqueConstraintError(e)) return { error: "Já existe uma empresa com esse nome nessa parceria." };
    return { error: "Não foi possível atualizar a empresa." };
  }
  revalidatePath("/admin/empresas");
  return {};
}

export async function excluirEmpresa(id: string) {
  try {
    await prisma.empresa.delete({ where: { id } });
  } catch (e) {
    if (isForeignKeyError(e)) {
      return {
        error: "Não é possível excluir: esta empresa já está em uso em ocorrências. Desative-a em vez de excluir.",
      };
    }
    return { error: "Não foi possível excluir a empresa." };
  }
  revalidatePath("/admin/empresas");
  return {};
}
