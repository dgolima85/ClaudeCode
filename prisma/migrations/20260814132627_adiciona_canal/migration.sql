-- AlterTable
ALTER TABLE "ocorrencias" ADD COLUMN     "canalId" TEXT;

-- CreateTable
CREATE TABLE "canais" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canais_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "canais_nome_key" ON "canais"("nome");

-- AddForeignKey
ALTER TABLE "ocorrencias" ADD CONSTRAINT "ocorrencias_canalId_fkey" FOREIGN KEY ("canalId") REFERENCES "canais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
