"use server";

import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { exigirAnalistaLogado } from "@/lib/session";
import { validarEvidencia } from "@/lib/evidencias";

export async function anexarEvidencia(ocorrenciaId: string, formData: FormData) {
  const analista = await exigirAnalistaLogado();

  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { error: "Selecione um arquivo para anexar." };
  }

  const buffer = Buffer.from(await arquivo.arrayBuffer());
  const validacao = validarEvidencia(arquivo.name, buffer);
  if ("error" in validacao) {
    return { error: validacao.error };
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      error:
        "Armazenamento de evidências não configurado (crie um Vercel Blob Store e conecte ao projeto — veja o README).",
    };
  }

  const blob = await put(`evidencias/${ocorrenciaId}/${arquivo.name}`, buffer, {
    access: "public",
    addRandomSuffix: true,
    contentType: validacao.tipo,
  });

  const evidencia = await prisma.evidenciaOcorrencia.create({
    data: {
      ocorrenciaId,
      analistaId: analista.id,
      nomeArquivo: arquivo.name,
      tipo: validacao.tipo,
      tamanhoBytes: buffer.length,
      url: blob.url,
      blobPath: blob.pathname,
    },
    include: { analista: true },
  });

  revalidatePath("/");

  return {
    evidencia: {
      id: evidencia.id,
      nomeArquivo: evidencia.nomeArquivo,
      tipo: evidencia.tipo,
      tamanhoBytes: evidencia.tamanhoBytes,
      url: evidencia.url,
      createdAt: evidencia.createdAt.toISOString(),
      analista: { id: evidencia.analista.id, nome: evidencia.analista.nome },
    },
  };
}

export async function excluirEvidencia(evidenciaId: string) {
  await exigirAnalistaLogado();

  const evidencia = await prisma.evidenciaOcorrencia.findUnique({ where: { id: evidenciaId } });
  if (!evidencia) return { error: "Evidência não encontrada." };

  // Mesmo se o Blob já tiver sido removido de outra forma, o registro no
  // banco ainda deve sumir — não vale travar a exclusão por causa disso.
  await del(evidencia.blobPath).catch(() => {});
  await prisma.evidenciaOcorrencia.delete({ where: { id: evidenciaId } });

  revalidatePath("/");
  return {};
}
