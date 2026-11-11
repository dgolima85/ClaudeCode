-- CreateTable
CREATE TABLE "desvio_operacional" (
    "id" TEXT NOT NULL,
    "ultimoDesvioEm" TIMESTAMP(3) NOT NULL,
    "recordeDias" INTEGER NOT NULL DEFAULT 0,
    "atualizadoPorId" TEXT,

    CONSTRAINT "desvio_operacional_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "desvio_operacional" ADD CONSTRAINT "desvio_operacional_atualizadoPorId_fkey" FOREIGN KEY ("atualizadoPorId") REFERENCES "analistas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
