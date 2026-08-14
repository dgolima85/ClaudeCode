-- CreateTable
CREATE TABLE "avisos" (
    "id" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "analistaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avisos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "avisos_expiraEm_idx" ON "avisos"("expiraEm");

-- AddForeignKey
ALTER TABLE "avisos" ADD CONSTRAINT "avisos_analistaId_fkey" FOREIGN KEY ("analistaId") REFERENCES "analistas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
