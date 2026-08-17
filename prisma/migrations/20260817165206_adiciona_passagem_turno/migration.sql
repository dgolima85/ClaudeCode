-- CreateTable
CREATE TABLE "passagens_turno" (
    "id" TEXT NOT NULL,
    "turnoOrigem" TEXT NOT NULL,
    "turnoDestino" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ABERTA',
    "observacoes" TEXT,
    "analistaEntregaId" TEXT NOT NULL,
    "analistaRecebeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmadaEm" TIMESTAMP(3),

    CONSTRAINT "passagens_turno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_OcorrenciaToPassagemTurno" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OcorrenciaToPassagemTurno_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "passagens_turno_status_idx" ON "passagens_turno"("status");

-- CreateIndex
CREATE INDEX "passagens_turno_createdAt_idx" ON "passagens_turno"("createdAt");

-- CreateIndex
CREATE INDEX "_OcorrenciaToPassagemTurno_B_index" ON "_OcorrenciaToPassagemTurno"("B");

-- AddForeignKey
ALTER TABLE "passagens_turno" ADD CONSTRAINT "passagens_turno_analistaEntregaId_fkey" FOREIGN KEY ("analistaEntregaId") REFERENCES "analistas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passagens_turno" ADD CONSTRAINT "passagens_turno_analistaRecebeId_fkey" FOREIGN KEY ("analistaRecebeId") REFERENCES "analistas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OcorrenciaToPassagemTurno" ADD CONSTRAINT "_OcorrenciaToPassagemTurno_A_fkey" FOREIGN KEY ("A") REFERENCES "ocorrencias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OcorrenciaToPassagemTurno" ADD CONSTRAINT "_OcorrenciaToPassagemTurno_B_fkey" FOREIGN KEY ("B") REFERENCES "passagens_turno"("id") ON DELETE CASCADE ON UPDATE CASCADE;
