import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirAnalistaLogado } from "@/lib/session";
import { parseFiltros, montarWhereOcorrencia, type SearchParamsRelatorio } from "@/lib/relatorios";
import { STATUS_LABELS, type StatusOcorrencia } from "@/lib/status";
import { TURNO_LABELS, type Turno } from "@/lib/turno";
import { toCsv } from "@/lib/csv";
import { formatarDataHoraBR } from "@/lib/dataHoraBR";

export async function GET(request: NextRequest) {
  await exigirAnalistaLogado();

  const sp: SearchParamsRelatorio = {};
  for (const key of new Set(request.nextUrl.searchParams.keys())) {
    const valores = request.nextUrl.searchParams.getAll(key);
    sp[key] = valores.length > 1 ? valores : valores[0];
  }

  const filtros = parseFiltros(sp);
  const where = montarWhereOcorrencia(filtros);

  const ocorrencias = await prisma.ocorrencia.findMany({
    where,
    include: { tipo: true, analista: true },
    orderBy: { createdAt: "desc" },
  });

  const linhas = ocorrencias.map((o) => [
    o.tipo.nome,
    STATUS_LABELS[o.status as StatusOcorrencia] ?? o.status,
    formatarDataHoraBR(o.createdAt),
    o.resolvidoEm ? formatarDataHoraBR(o.resolvidoEm) : "",
    o.analista.nome,
    TURNO_LABELS[o.analista.turno as Turno] ?? o.analista.turno,
    o.titulo,
    o.ticket ?? "",
  ]);

  const csv = toCsv(
    ["Origem", "Status", "Início", "Fim", "Analista", "Turno", "Título", "Ticket"],
    linhas,
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="ocorrencias.csv"',
    },
  });
}
