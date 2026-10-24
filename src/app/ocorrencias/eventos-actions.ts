"use server";

import { prisma } from "@/lib/prisma";
import { exigirAnalistaLogado } from "@/lib/session";
import { comentarioEventoSchema } from "@/lib/validations";
import { revalidarHomesOcorrencias } from "@/lib/revalidarOcorrencias";

export async function criarEvento(ocorrenciaId: string, comentario: string) {
  const analista = await exigirAnalistaLogado();
  const parsed = comentarioEventoSchema.safeParse(comentario);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Comentário inválido" };
  }

  const evento = await prisma.evento.create({
    data: {
      ocorrenciaId,
      analistaId: analista.id,
      comentario: parsed.data,
    },
    include: { analista: true },
  });

  revalidarHomesOcorrencias();

  return {
    evento: {
      id: evento.id,
      comentario: evento.comentario,
      createdAt: evento.createdAt.toISOString(),
      analista: { id: evento.analista.id, nome: evento.analista.nome },
    },
  };
}
