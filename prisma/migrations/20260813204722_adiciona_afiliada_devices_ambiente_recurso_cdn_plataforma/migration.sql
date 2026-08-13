-- AlterTable
ALTER TABLE "ocorrencias" ADD COLUMN     "ambienteInfraId" TEXT,
ADD COLUMN     "cdnId" TEXT,
ADD COLUMN     "plataformaId" TEXT,
ADD COLUMN     "recursoId" TEXT;

-- CreateTable
CREATE TABLE "ambientes_infra" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ambientes_infra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recursos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ambienteInfraId" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recursos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cdns" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cdns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plataformas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plataformas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ambientes_infra_nome_key" ON "ambientes_infra"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "recursos_ambienteInfraId_nome_key" ON "recursos"("ambienteInfraId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "cdns_nome_key" ON "cdns"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "plataformas_nome_key" ON "plataformas"("nome");

-- AddForeignKey
ALTER TABLE "recursos" ADD CONSTRAINT "recursos_ambienteInfraId_fkey" FOREIGN KEY ("ambienteInfraId") REFERENCES "ambientes_infra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocorrencias" ADD CONSTRAINT "ocorrencias_ambienteInfraId_fkey" FOREIGN KEY ("ambienteInfraId") REFERENCES "ambientes_infra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocorrencias" ADD CONSTRAINT "ocorrencias_recursoId_fkey" FOREIGN KEY ("recursoId") REFERENCES "recursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocorrencias" ADD CONSTRAINT "ocorrencias_cdnId_fkey" FOREIGN KEY ("cdnId") REFERENCES "cdns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocorrencias" ADD CONSTRAINT "ocorrencias_plataformaId_fkey" FOREIGN KEY ("plataformaId") REFERENCES "plataformas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
