"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { nomeSchema } from "@/lib/validations";
import { isUniqueConstraintError } from "@/lib/prismaErrors";

export async function criarCanalPortfolio(dados: Record<string, string>) {
  const parsed = nomeSchema.safeParse(dados.nome);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  try {
    await prisma.canalPortfolio.create({ data: { nome: parsed.data } });
  } catch (e) {
    if (isUniqueConstraintError(e)) return { error: "Já existe um canal com esse nome." };
    return { error: "Não foi possível criar o canal." };
  }
  revalidatePath("/admin/canais-portfolio");
  return {};
}

export async function atualizarCanalPortfolio(id: string, dados: Record<string, string | boolean>) {
  const parsed = nomeSchema.safeParse(dados.nome);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  try {
    await prisma.canalPortfolio.update({
      where: { id },
      data: { nome: parsed.data, ativo: Boolean(dados.ativo) },
    });
  } catch (e) {
    if (isUniqueConstraintError(e)) return { error: "Já existe um canal com esse nome." };
    return { error: "Não foi possível atualizar o canal." };
  }
  revalidatePath("/admin/canais-portfolio");
  return {};
}

export async function excluirCanalPortfolio(id: string) {
  try {
    await prisma.canalPortfolio.delete({ where: { id } });
  } catch {
    return { error: "Não foi possível excluir o canal." };
  }
  revalidatePath("/admin/canais-portfolio");
  return {};
}

/**
 * Cadastra vários canais de uma vez (um nome por linha) — usado pelo campo
 * de importação em lote da página, pra colar uma lista nova sem precisar
 * adicionar um por um. Nomes já cadastrados (mesmo que já existam, ativos
 * ou não) são simplesmente ignorados, não é um erro.
 */
export async function importarCanaisPortfolio(texto: string): Promise<{ error?: string; importados?: number }> {
  const nomes = Array.from(
    new Set(
      texto
        .split("\n")
        .map((linha) => linha.trim())
        .filter(Boolean),
    ),
  );
  if (nomes.length === 0) return { error: "Nenhum nome de canal encontrado no texto colado." };

  const resultado = await prisma.canalPortfolio.createMany({
    data: nomes.map((nome) => ({ nome })),
    skipDuplicates: true,
  });

  revalidatePath("/admin/canais-portfolio");
  return { importados: resultado.count };
}
