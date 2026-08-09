-- AlterTable
ALTER TABLE "ocorrencias" ADD COLUMN     "causaId" TEXT,
ADD COLUMN     "causaOutraDescricao" TEXT,
ADD COLUMN     "solucaoId" TEXT,
ADD COLUMN     "solucaoOutraDescricao" TEXT;

-- CreateTable
CREATE TABLE "causas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "causas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solucoes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solucoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "causas_nome_key" ON "causas"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "solucoes_nome_key" ON "solucoes"("nome");

-- AddForeignKey
ALTER TABLE "ocorrencias" ADD CONSTRAINT "ocorrencias_causaId_fkey" FOREIGN KEY ("causaId") REFERENCES "causas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocorrencias" ADD CONSTRAINT "ocorrencias_solucaoId_fkey" FOREIGN KEY ("solucaoId") REFERENCES "solucoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
