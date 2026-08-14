-- Converte Recurso, Plataforma, Canal, Parceria, Empresa, Serviço e Devices
-- (SistemaOperacional) de seleção única (coluna FK em ocorrencias) para
-- seleção múltipla (tabelas de junção N:N). Os dados existentes são
-- migrados para a nova estrutura ANTES das colunas antigas serem
-- removidas, então nenhuma seleção já feita é perdida.

-- CreateTable
CREATE TABLE "_EmpresaToOcorrencia" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EmpresaToOcorrencia_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CanalToOcorrencia" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CanalToOcorrencia_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OcorrenciaToParceria" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OcorrenciaToParceria_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OcorrenciaToServico" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OcorrenciaToServico_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OcorrenciaToSistemaOperacional" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OcorrenciaToSistemaOperacional_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OcorrenciaToRecurso" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OcorrenciaToRecurso_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OcorrenciaToPlataforma" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OcorrenciaToPlataforma_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EmpresaToOcorrencia_B_index" ON "_EmpresaToOcorrencia"("B");

-- CreateIndex
CREATE INDEX "_CanalToOcorrencia_B_index" ON "_CanalToOcorrencia"("B");

-- CreateIndex
CREATE INDEX "_OcorrenciaToParceria_B_index" ON "_OcorrenciaToParceria"("B");

-- CreateIndex
CREATE INDEX "_OcorrenciaToServico_B_index" ON "_OcorrenciaToServico"("B");

-- CreateIndex
CREATE INDEX "_OcorrenciaToSistemaOperacional_B_index" ON "_OcorrenciaToSistemaOperacional"("B");

-- CreateIndex
CREATE INDEX "_OcorrenciaToRecurso_B_index" ON "_OcorrenciaToRecurso"("B");

-- CreateIndex
CREATE INDEX "_OcorrenciaToPlataforma_B_index" ON "_OcorrenciaToPlataforma"("B");

-- AddForeignKey
ALTER TABLE "_EmpresaToOcorrencia" ADD CONSTRAINT "_EmpresaToOcorrencia_A_fkey" FOREIGN KEY ("A") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmpresaToOcorrencia" ADD CONSTRAINT "_EmpresaToOcorrencia_B_fkey" FOREIGN KEY ("B") REFERENCES "ocorrencias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CanalToOcorrencia" ADD CONSTRAINT "_CanalToOcorrencia_A_fkey" FOREIGN KEY ("A") REFERENCES "canais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CanalToOcorrencia" ADD CONSTRAINT "_CanalToOcorrencia_B_fkey" FOREIGN KEY ("B") REFERENCES "ocorrencias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OcorrenciaToParceria" ADD CONSTRAINT "_OcorrenciaToParceria_A_fkey" FOREIGN KEY ("A") REFERENCES "ocorrencias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OcorrenciaToParceria" ADD CONSTRAINT "_OcorrenciaToParceria_B_fkey" FOREIGN KEY ("B") REFERENCES "parcerias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OcorrenciaToServico" ADD CONSTRAINT "_OcorrenciaToServico_A_fkey" FOREIGN KEY ("A") REFERENCES "ocorrencias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OcorrenciaToServico" ADD CONSTRAINT "_OcorrenciaToServico_B_fkey" FOREIGN KEY ("B") REFERENCES "servicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OcorrenciaToSistemaOperacional" ADD CONSTRAINT "_OcorrenciaToSistemaOperacional_A_fkey" FOREIGN KEY ("A") REFERENCES "ocorrencias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OcorrenciaToSistemaOperacional" ADD CONSTRAINT "_OcorrenciaToSistemaOperacional_B_fkey" FOREIGN KEY ("B") REFERENCES "sistemas_operacionais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OcorrenciaToRecurso" ADD CONSTRAINT "_OcorrenciaToRecurso_A_fkey" FOREIGN KEY ("A") REFERENCES "ocorrencias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OcorrenciaToRecurso" ADD CONSTRAINT "_OcorrenciaToRecurso_B_fkey" FOREIGN KEY ("B") REFERENCES "recursos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OcorrenciaToPlataforma" ADD CONSTRAINT "_OcorrenciaToPlataforma_A_fkey" FOREIGN KEY ("A") REFERENCES "ocorrencias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OcorrenciaToPlataforma" ADD CONSTRAINT "_OcorrenciaToPlataforma_B_fkey" FOREIGN KEY ("B") REFERENCES "plataformas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migra os dados: cada ocorrência que já tinha um valor único passa a ter
-- esse mesmo valor como sua (única, por enquanto) seleção na lista.
INSERT INTO "_EmpresaToOcorrencia" ("A", "B")
SELECT "empresaId", "id" FROM "ocorrencias" WHERE "empresaId" IS NOT NULL;

INSERT INTO "_CanalToOcorrencia" ("A", "B")
SELECT "canalId", "id" FROM "ocorrencias" WHERE "canalId" IS NOT NULL;

INSERT INTO "_OcorrenciaToParceria" ("A", "B")
SELECT "id", "parceriaId" FROM "ocorrencias" WHERE "parceriaId" IS NOT NULL;

INSERT INTO "_OcorrenciaToServico" ("A", "B")
SELECT "id", "servicoId" FROM "ocorrencias" WHERE "servicoId" IS NOT NULL;

INSERT INTO "_OcorrenciaToSistemaOperacional" ("A", "B")
SELECT "id", "sistemaOperacionalId" FROM "ocorrencias" WHERE "sistemaOperacionalId" IS NOT NULL;

INSERT INTO "_OcorrenciaToRecurso" ("A", "B")
SELECT "id", "recursoId" FROM "ocorrencias" WHERE "recursoId" IS NOT NULL;

INSERT INTO "_OcorrenciaToPlataforma" ("A", "B")
SELECT "id", "plataformaId" FROM "ocorrencias" WHERE "plataformaId" IS NOT NULL;

-- Agora sim, remove as colunas antigas de seleção única.
-- DropForeignKey
ALTER TABLE "ocorrencias" DROP CONSTRAINT "ocorrencias_canalId_fkey";

-- DropForeignKey
ALTER TABLE "ocorrencias" DROP CONSTRAINT "ocorrencias_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "ocorrencias" DROP CONSTRAINT "ocorrencias_parceriaId_fkey";

-- DropForeignKey
ALTER TABLE "ocorrencias" DROP CONSTRAINT "ocorrencias_plataformaId_fkey";

-- DropForeignKey
ALTER TABLE "ocorrencias" DROP CONSTRAINT "ocorrencias_recursoId_fkey";

-- DropForeignKey
ALTER TABLE "ocorrencias" DROP CONSTRAINT "ocorrencias_servicoId_fkey";

-- DropForeignKey
ALTER TABLE "ocorrencias" DROP CONSTRAINT "ocorrencias_sistemaOperacionalId_fkey";

-- AlterTable
ALTER TABLE "ocorrencias" DROP COLUMN "canalId",
DROP COLUMN "empresaId",
DROP COLUMN "parceriaId",
DROP COLUMN "plataformaId",
DROP COLUMN "recursoId",
DROP COLUMN "servicoId",
DROP COLUMN "sistemaOperacionalId";
