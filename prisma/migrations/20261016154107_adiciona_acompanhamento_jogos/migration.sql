-- CreateTable
CREATE TABLE "jogo_do_dia_acompanhamento" (
    "id" TEXT NOT NULL,
    "jogoSourceId" INTEGER NOT NULL,
    "dataBR" TEXT NOT NULL,
    "mandante" TEXT NOT NULL,
    "visitante" TEXT NOT NULL,
    "campeonato" TEXT NOT NULL,
    "canal" TEXT NOT NULL,
    "foraDoPortfolio" BOOLEAN NOT NULL DEFAULT false,
    "testadoValidado" BOOLEAN NOT NULL DEFAULT false,
    "somEImagem" TEXT,
    "delayClaro" TEXT,
    "relatorioPosJogo" TEXT,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "atualizadoPorId" TEXT,

    CONSTRAINT "jogo_do_dia_acompanhamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "jogo_do_dia_acompanhamento_dataBR_idx" ON "jogo_do_dia_acompanhamento"("dataBR");

-- CreateIndex
CREATE UNIQUE INDEX "jogo_do_dia_acompanhamento_jogoSourceId_canal_key" ON "jogo_do_dia_acompanhamento"("jogoSourceId", "canal");

-- AddForeignKey
ALTER TABLE "jogo_do_dia_acompanhamento" ADD CONSTRAINT "jogo_do_dia_acompanhamento_atualizadoPorId_fkey" FOREIGN KEY ("atualizadoPorId") REFERENCES "analistas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
