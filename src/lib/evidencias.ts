// Evidências (prints e .txt) anexadas a uma ocorrência. O arquivo em si
// nunca fica no Postgres — só o metadado (ver EvidenciaOcorrencia no
// schema.prisma) — pra não inflar o banco com binários. Os arquivos ficam
// no Vercel Blob (src/app/ocorrencias/evidencias-actions.ts).

export const TAMANHO_MAXIMO_EVIDENCIA_BYTES = 5 * 1024 * 1024; // 5 MB

type Assinatura = {
  extensoes: string[];
  mime: string;
  // Confere os primeiros bytes do arquivo (magic number) em vez de confiar
  // só na extensão/no Content-Type que o navegador manda — evitar que um
  // arquivo renomeado (ex.: "print.exe" -> "print.png") passe despercebido.
  sniff: (buffer: Buffer) => boolean;
};

const ASSINATURAS: Assinatura[] = [
  {
    extensoes: [".png"],
    mime: "image/png",
    sniff: (buf) =>
      buf.length >= 8 &&
      buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  {
    extensoes: [".jpg", ".jpeg"],
    mime: "image/jpeg",
    sniff: (buf) => buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  },
];

function extensaoDoArquivo(nomeArquivo: string): string {
  const indice = nomeArquivo.lastIndexOf(".");
  return indice === -1 ? "" : nomeArquivo.slice(indice).toLowerCase();
}

export type ValidacaoEvidencia = { error: string } | { tipo: string };

export function validarEvidencia(nomeArquivo: string, buffer: Buffer): ValidacaoEvidencia {
  if (buffer.length === 0) {
    return { error: "O arquivo está vazio." };
  }
  if (buffer.length > TAMANHO_MAXIMO_EVIDENCIA_BYTES) {
    return { error: `O arquivo excede o limite de ${TAMANHO_MAXIMO_EVIDENCIA_BYTES / (1024 * 1024)}MB.` };
  }

  const extensao = extensaoDoArquivo(nomeArquivo);

  const assinatura = ASSINATURAS.find((a) => a.extensoes.includes(extensao));
  if (assinatura) {
    if (!assinatura.sniff(buffer)) {
      return { error: "O conteúdo do arquivo não corresponde a uma imagem PNG/JPEG válida." };
    }
    return { tipo: assinatura.mime };
  }

  if (extensao === ".txt") {
    // Heurística simples pra recusar binário disfarçado de .txt: um arquivo
    // de texto de verdade não deveria ter byte nulo logo no começo.
    const amostra = buffer.subarray(0, Math.min(buffer.length, 1024));
    if (amostra.includes(0)) {
      return { error: "O conteúdo não parece ser um arquivo de texto." };
    }
    return { tipo: "text/plain" };
  }

  return { error: "Formato não permitido. Envie apenas imagens PNG/JPEG ou arquivos .txt." };
}

export function formatarTamanhoArquivo(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
