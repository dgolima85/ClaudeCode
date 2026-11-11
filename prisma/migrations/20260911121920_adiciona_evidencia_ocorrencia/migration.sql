-- CreateTable
CREATE TABLE "evidencias_ocorrencia" (
    "id" TEXT NOT NULL,
    "ocorrenciaId" TEXT NOT NULL,
    "analistaId" TEXT NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tamanhoBytes" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "blobPath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidencias_ocorrencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "evidencias_ocorrencia_ocorrenciaId_idx" ON "evidencias_ocorrencia"("ocorrenciaId");

-- AddForeignKey
ALTER TABLE "evidencias_ocorrencia" ADD CONSTRAINT "evidencias_ocorrencia_ocorrenciaId_fkey" FOREIGN KEY ("ocorrenciaId") REFERENCES "ocorrencias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias_ocorrencia" ADD CONSTRAINT "evidencias_ocorrencia_analistaId_fkey" FOREIGN KEY ("analistaId") REFERENCES "analistas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
