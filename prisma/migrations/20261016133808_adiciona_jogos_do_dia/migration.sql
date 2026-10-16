-- CreateTable
CREATE TABLE "jogos_do_dia" (
    "id" TEXT NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "mandante" TEXT NOT NULL,
    "visitante" TEXT NOT NULL,
    "horario" TEXT NOT NULL,
    "dataBR" TEXT NOT NULL,
    "estadio" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "campeonato" TEXT NOT NULL,
    "canais" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jogos_do_dia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jogo_do_dia_sync" (
    "id" TEXT NOT NULL,
    "ultimoSucessoEm" TIMESTAMP(3),
    "ultimaTentativaEm" TIMESTAMP(3),
    "ultimoErro" TEXT,
    "jogosEncontrados" INTEGER,

    CONSTRAINT "jogo_do_dia_sync_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "jogos_do_dia_sourceId_key" ON "jogos_do_dia"("sourceId");

-- CreateIndex
CREATE INDEX "jogos_do_dia_dataBR_idx" ON "jogos_do_dia"("dataBR");
