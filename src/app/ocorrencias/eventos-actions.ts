"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { exigirAnalistaLogado } from "@/lib/session";
import { comentarioEventoSchema } from "@/lib/validations";

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

  revalidatePath("/");

  return {
    evento: {
      id: evento.id,
      comentario: evento.comentario,
      createdAt: evento.createdAt.toISOString(),
      analista: { id: evento.analista.id, nome: evento.analista.nome },
    },
  };
}
