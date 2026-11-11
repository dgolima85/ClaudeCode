"use server";

import { prisma } from "@/lib/prisma";
import { exigirAnalistaLogado } from "@/lib/session";
import { avisoSchema } from "@/lib/validations";
import { deInputDataHoraBR } from "@/lib/dataHoraBR";
import { revalidarHomesOcorrencias } from "@/lib/revalidarOcorrencias";
import type { ContextoAviso } from "@/lib/contextoAviso";

export type AvisoCriado = {
  id: string;
  modelo: string;
  descricao: string;
  expiraEm: string;
};

export async function criarAviso(dados: {
  modelo: string;
  descricao: string;
  expiraEm: string;
  contexto: ContextoAviso;
}): Promise<{ error?: string; aviso?: AvisoCriado }> {
  const analista = await exigirAnalistaLogado();
  const parsed = avisoSchema.safeParse(dados);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const aviso = await prisma.aviso.create({
    data: {
      modelo: parsed.data.modelo,
      descricao: parsed.data.descricao,
      expiraEm: deInputDataHoraBR(parsed.data.expiraEm),
      contexto: parsed.data.contexto,
      analistaId: analista.id,
    },
  });

  revalidarHomesOcorrencias();
  return {
    aviso: {
      id: aviso.id,
      modelo: aviso.modelo,
      descricao: aviso.descricao,
      expiraEm: aviso.expiraEm.toISOString(),
    },
  };
}

export async function atualizarAviso(
  id: string,
  dados: { modelo: string; descricao: string; expiraEm: string; contexto: ContextoAviso },
): Promise<{ error?: string; aviso?: AvisoCriado }> {
  await exigirAnalistaLogado();
  const parsed = avisoSchema.safeParse(dados);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const aviso = await prisma.aviso.update({
    where: { id },
    data: {
      modelo: parsed.data.modelo,
      descricao: parsed.data.descricao,
      expiraEm: deInputDataHoraBR(parsed.data.expiraEm),
      // Avisos antigos (de antes dos quadros serem desmembrados) não têm
      // contexto definido — editar um deles passa a atribuí-lo ao quadro de
      // onde a edição partiu, migrando-o aos poucos pra o novo modelo.
      contexto: parsed.data.contexto,
    },
  });

  revalidarHomesOcorrencias();
  return {
    aviso: {
      id: aviso.id,
      modelo: aviso.modelo,
      descricao: aviso.descricao,
      expiraEm: aviso.expiraEm.toISOString(),
    },
  };
}

export async function excluirAviso(id: string): Promise<{ error?: string }> {
  await exigirAnalistaLogado();
  await prisma.aviso.delete({ where: { id } });
  revalidarHomesOcorrencias();
  return {};
}
