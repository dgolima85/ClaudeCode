-- CreateTable
CREATE TABLE "analistas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "turno" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tipos_ocorrencia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "parcerias" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "parceriaId" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "empresas_parceriaId_fkey" FOREIGN KEY ("parceriaId") REFERENCES "parcerias" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ambientes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "servicos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "sistemas_operacionais" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ocorrencias" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipoId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'EM_ANDAMENTO',
    "titulo" TEXT NOT NULL,
    "ticket" TEXT,
    "analistaId" TEXT NOT NULL,
    "parceriaId" TEXT,
    "empresaId" TEXT,
    "ambienteId" TEXT,
    "servicoId" TEXT,
    "sistemaOperacionalId" TEXT,
    "resolvidoEm" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ocorrencias_tipoId_fkey" FOREIGN KEY ("tipoId") REFERENCES "tipos_ocorrencia" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ocorrencias_analistaId_fkey" FOREIGN KEY ("analistaId") REFERENCES "analistas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ocorrencias_parceriaId_fkey" FOREIGN KEY ("parceriaId") REFERENCES "parcerias" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ocorrencias_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ocorrencias_ambienteId_fkey" FOREIGN KEY ("ambienteId") REFERENCES "ambientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ocorrencias_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ocorrencias_sistemaOperacionalId_fkey" FOREIGN KEY ("sistemaOperacionalId") REFERENCES "sistemas_operacionais" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ocorrenciaId" TEXT NOT NULL,
    "analistaId" TEXT NOT NULL,
    "comentario" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "eventos_ocorrenciaId_fkey" FOREIGN KEY ("ocorrenciaId") REFERENCES "ocorrencias" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "eventos_analistaId_fkey" FOREIGN KEY ("analistaId") REFERENCES "analistas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "analistas_email_key" ON "analistas"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_ocorrencia_nome_key" ON "tipos_ocorrencia"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "parcerias_nome_key" ON "parcerias"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_parceriaId_nome_key" ON "empresas"("parceriaId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "ambientes_nome_key" ON "ambientes"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "servicos_nome_key" ON "servicos"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "sistemas_operacionais_nome_key" ON "sistemas_operacionais"("nome");

-- CreateIndex
CREATE INDEX "ocorrencias_status_idx" ON "ocorrencias"("status");

-- CreateIndex
CREATE INDEX "ocorrencias_createdAt_idx" ON "ocorrencias"("createdAt");

-- CreateIndex
CREATE INDEX "eventos_ocorrenciaId_idx" ON "eventos"("ocorrenciaId");
