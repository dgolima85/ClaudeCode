-- CreateTable
CREATE TABLE "desvio_operacional_registros" (
    "id" TEXT NOT NULL,
    "ocorridoEm" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT NOT NULL,
    "registradoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "desvio_operacional_registros_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "desvio_operacional_registros_ocorridoEm_idx" ON "desvio_operacional_registros"("ocorridoEm");

-- AddForeignKey
ALTER TABLE "desvio_operacional_registros" ADD CONSTRAINT "desvio_operacional_registros_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "analistas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
