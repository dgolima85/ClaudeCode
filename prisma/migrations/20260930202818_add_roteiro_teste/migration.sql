-- CreateTable
CREATE TABLE "roteiro_teste_execucoes" (
    "id" TEXT NOT NULL,
    "rotina" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "versao" TEXT NOT NULL,
    "anotacao" TEXT,
    "analistaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roteiro_teste_execucoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roteiro_teste_itens" (
    "id" TEXT NOT NULL,
    "execucaoId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "resultado" TEXT NOT NULL,

    CONSTRAINT "roteiro_teste_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roteiro_teste_evidencias" (
    "id" TEXT NOT NULL,
    "execucaoId" TEXT NOT NULL,
    "analistaId" TEXT NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tamanhoBytes" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "blobPath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roteiro_teste_evidencias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "roteiro_teste_execucoes_rotina_idx" ON "roteiro_teste_execucoes"("rotina");

-- CreateIndex
CREATE INDEX "roteiro_teste_execucoes_createdAt_idx" ON "roteiro_teste_execucoes"("createdAt");

-- CreateIndex
CREATE INDEX "roteiro_teste_itens_execucaoId_idx" ON "roteiro_teste_itens"("execucaoId");

-- CreateIndex
CREATE INDEX "roteiro_teste_evidencias_execucaoId_idx" ON "roteiro_teste_evidencias"("execucaoId");

-- AddForeignKey
ALTER TABLE "roteiro_teste_execucoes" ADD CONSTRAINT "roteiro_teste_execucoes_analistaId_fkey" FOREIGN KEY ("analistaId") REFERENCES "analistas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roteiro_teste_itens" ADD CONSTRAINT "roteiro_teste_itens_execucaoId_fkey" FOREIGN KEY ("execucaoId") REFERENCES "roteiro_teste_execucoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roteiro_teste_evidencias" ADD CONSTRAINT "roteiro_teste_evidencias_execucaoId_fkey" FOREIGN KEY ("execucaoId") REFERENCES "roteiro_teste_execucoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roteiro_teste_evidencias" ADD CONSTRAINT "roteiro_teste_evidencias_analistaId_fkey" FOREIGN KEY ("analistaId") REFERENCES "analistas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
