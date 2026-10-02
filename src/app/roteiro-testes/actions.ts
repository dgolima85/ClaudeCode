"use server";

import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { exigirAnalistaLogado } from "@/lib/session";
import { validarEvidencia } from "@/lib/evidencias";
import { isRotinaTeste, type RotinaTeste } from "@/lib/roteiroTeste/rotinas";
import { isResultadoTeste, type ResultadoTeste } from "@/lib/roteiroTeste/resultado";
import { DEFINICOES_ROTEIRO_TESTE, todosPassos } from "@/lib/roteiroTeste/definicoes";
import { inicioDoDiaBR } from "@/lib/dataHoraBR";

export async function criarExecucaoRoteiroTeste(
  formData: FormData,
): Promise<{ error?: string; id?: string; avisoEvidencias?: string }> {
  const analista = await exigirAnalistaLogado();

  const rotina = formData.get("rotina");
  if (typeof rotina !== "string" || !isRotinaTeste(rotina)) {
    return { error: "Selecione a rotina de teste." };
  }

  const definicao = DEFINICOES_ROTEIRO_TESTE[rotina];
  if (!definicao) {
    return { error: "Esta rotina de teste ainda não está disponível." };
  }

  const brand = formData.get("brand");
  if (typeof brand !== "string" || !definicao.brands.includes(brand)) {
    return { error: "Selecione o Brand." };
  }

  const versao = formData.get("versao");
  if (typeof versao !== "string" || !versao.trim()) {
    return { error: "Informe a versão (release)." };
  }

  const dispositivosDisponiveis = definicao.dispositivos;
  const dispositivos = formData
    .getAll("dispositivos")
    .filter((v): v is string => typeof v === "string" && (dispositivosDisponiveis?.includes(v) ?? false));
  if (dispositivosDisponiveis && dispositivos.length === 0) {
    return { error: "Selecione ao menos um dispositivo." };
  }

  const dataExecucaoBruta = formData.get("dataExecucao");
  const dataExecucao =
    definicao.usaData && typeof dataExecucaoBruta === "string" && dataExecucaoBruta
      ? inicioDoDiaBR(dataExecucaoBruta)
      : null;

  const itens: { codigo: string; resultado: ResultadoTeste }[] = [];
  for (const passo of todosPassos(definicao)) {
    const valor = formData.get(`passo_${passo.codigo}`);
    if (typeof valor !== "string" || !isResultadoTeste(valor)) {
      return { error: `Preencha o resultado de "${passo.codigo}".` };
    }
    itens.push({ codigo: passo.codigo, resultado: valor });
  }

  const anotacao = formData.get("anotacao");

  // Valida todos os arquivos ANTES de criar qualquer coisa no banco — se um
  // anexo for inválido, o envio inteiro falha com uma mensagem clara em vez
  // de deixar a execução meio salva.
  const arquivos = formData.getAll("evidencias").filter((v): v is File => v instanceof File && v.size > 0);
  const arquivosValidados: { arquivo: File; buffer: Buffer; tipo: string }[] = [];
  for (const arquivo of arquivos) {
    const buffer = Buffer.from(await arquivo.arrayBuffer());
    const validacao = validarEvidencia(arquivo.name, buffer);
    if ("error" in validacao) {
      return { error: `${arquivo.name}: ${validacao.error}` };
    }
    arquivosValidados.push({ arquivo, buffer, tipo: validacao.tipo });
  }
  if (arquivosValidados.length > 0 && !process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      error:
        "Armazenamento de evidências não configurado (crie um Vercel Blob Store e conecte ao projeto — veja o README).",
    };
  }

  const execucao = await prisma.roteiroTesteExecucao.create({
    data: {
      rotina,
      brand,
      dispositivos,
      dataExecucao,
      versao: versao.trim(),
      anotacao: typeof anotacao === "string" && anotacao.trim() ? anotacao.trim() : null,
      analistaId: analista.id,
      itens: { create: itens },
    },
  });

  // Evidências são anexadas depois de a execução já existir (o path no Blob
  // usa o id dela). Uma falha pontual de upload aqui não derruba o envio —
  // os resultados dos passos já estão salvos, o que importa mais.
  const falhasEvidencia: string[] = [];
  for (const { arquivo, buffer, tipo } of arquivosValidados) {
    try {
      const blob = await put(`roteiro-testes/${execucao.id}/${arquivo.name}`, buffer, {
        access: "public",
        addRandomSuffix: true,
        contentType: tipo,
      });
      await prisma.roteiroTesteEvidencia.create({
        data: {
          execucaoId: execucao.id,
          analistaId: analista.id,
          nomeArquivo: arquivo.name,
          tipo,
          tamanhoBytes: buffer.length,
          url: blob.url,
          blobPath: blob.pathname,
        },
      });
    } catch {
      falhasEvidencia.push(arquivo.name);
    }
  }

  revalidatePath("/roteiro-testes");

  return {
    id: execucao.id,
    avisoEvidencias:
      falhasEvidencia.length > 0
        ? `A execução foi salva, mas não foi possível enviar: ${falhasEvidencia.join(", ")}.`
        : undefined,
  };
}

export type ExecucaoRoteiroTesteLinha = {
  id: string;
  rotina: RotinaTeste;
  brand: string;
  dispositivos: string[];
  versao: string;
  analista: string;
  createdAt: string;
  totalPassos: number;
  totalFalhas: number;
  totalObservacao: number;
};

export async function listarExecucoesRoteiroTeste(limit = 20): Promise<ExecucaoRoteiroTesteLinha[]> {
  await exigirAnalistaLogado();

  const execucoes = await prisma.roteiroTesteExecucao.findMany({
    include: { analista: true, itens: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return execucoes
    .filter((e): e is typeof e & { rotina: RotinaTeste } => isRotinaTeste(e.rotina))
    .map((e) => ({
      id: e.id,
      rotina: e.rotina,
      brand: e.brand,
      dispositivos: e.dispositivos,
      versao: e.versao,
      analista: e.analista.nome,
      createdAt: e.createdAt.toISOString(),
      totalPassos: e.itens.length,
      totalFalhas: e.itens.filter((i) => i.resultado === "FALHA").length,
      totalObservacao: e.itens.filter((i) => i.resultado === "EM_OBSERVACAO").length,
    }));
}

export type ExecucaoRoteiroTesteDetalhe = {
  id: string;
  rotina: RotinaTeste;
  brand: string;
  dispositivos: string[];
  versao: string;
  dataExecucao: string | null;
  anotacao: string | null;
  analista: string;
  createdAt: string;
  itens: { codigo: string; descricao: string; resultado: ResultadoTeste }[];
  evidencias: {
    id: string;
    nomeArquivo: string;
    tipo: string;
    tamanhoBytes: number;
    url: string;
    analista: string;
    createdAt: string;
  }[];
};

export async function buscarExecucaoRoteiroTeste(id: string): Promise<ExecucaoRoteiroTesteDetalhe | null> {
  await exigirAnalistaLogado();

  const execucao = await prisma.roteiroTesteExecucao.findUnique({
    where: { id },
    include: {
      analista: true,
      itens: true,
      evidencias: { include: { analista: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!execucao || !isRotinaTeste(execucao.rotina)) return null;

  const definicao = DEFINICOES_ROTEIRO_TESTE[execucao.rotina];
  const descricaoPorCodigo = new Map((definicao ? todosPassos(definicao) : []).map((p) => [p.codigo, p.descricao]));

  return {
    id: execucao.id,
    rotina: execucao.rotina,
    brand: execucao.brand,
    dispositivos: execucao.dispositivos,
    versao: execucao.versao,
    dataExecucao: execucao.dataExecucao ? execucao.dataExecucao.toISOString() : null,
    anotacao: execucao.anotacao,
    analista: execucao.analista.nome,
    createdAt: execucao.createdAt.toISOString(),
    itens: execucao.itens
      .filter((i): i is typeof i & { resultado: ResultadoTeste } => isResultadoTeste(i.resultado))
      .map((i) => ({
        codigo: i.codigo,
        descricao: descricaoPorCodigo.get(i.codigo) ?? "",
        resultado: i.resultado,
      })),
    evidencias: execucao.evidencias.map((ev) => ({
      id: ev.id,
      nomeArquivo: ev.nomeArquivo,
      tipo: ev.tipo,
      tamanhoBytes: ev.tamanhoBytes,
      url: ev.url,
      analista: ev.analista.nome,
      createdAt: ev.createdAt.toISOString(),
    })),
  };
}
