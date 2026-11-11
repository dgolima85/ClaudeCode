-- AlterTable
ALTER TABLE "avisos" ADD COLUMN     "contexto" TEXT;

-- CreateIndex
CREATE INDEX "avisos_contexto_idx" ON "avisos"("contexto");
