"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { nomeSchema } from "@/lib/validations";
import { isForeignKeyError, isUniqueConstraintError } from "@/lib/prismaErrors";

export async function criarServico(dados: Record<string, string>) {
  const parsed = nomeSchema.safeParse(dados.nome);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  try {
    await prisma.servico.create({ data: { nome: parsed.data } });
  } catch (e) {
    if (isUniqueConstraintError(e)) return { error: "Já existe um serviço com esse nome." };
    return { error: "Não foi possível criar o serviço." };
  }
  revalidatePath("/admin/servicos");
  return {};
}

export async function atualizarServico(id: string, dados: Record<string, string | boolean>) {
  const parsed = nomeSchema.safeParse(dados.nome);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  try {
    await prisma.servico.update({
      where: { id },
      data: { nome: parsed.data, ativo: Boolean(dados.ativo) },
    });
  } catch (e) {
    if (isUniqueConstraintError(e)) return { error: "Já existe um serviço com esse nome." };
    return { error: "Não foi possível atualizar o serviço." };
  }
  revalidatePath("/admin/servicos");
  return {};
}

export async function excluirServico(id: string) {
  try {
    await prisma.servico.delete({ where: { id } });
  } catch (e) {
    if (isForeignKeyError(e)) {
      return {
        error: "Não é possível excluir: este serviço já está em uso em ocorrências. Desative-o em vez de excluir.",
      };
    }
    return { error: "Não foi possível excluir o serviço." };
  }
  revalidatePath("/admin/servicos");
  return {};
}
