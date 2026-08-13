import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { exigirAnalistaLogado } from "@/lib/session";
import { parseFiltros, type SearchParamsRelatorio } from "@/lib/relatorios";
import { listarResumosExecutivos, nomeCausa, nomeSolucao, parceriaEmpresaLabel } from "@/lib/resumoExecutivo";
import { formatarDataHoraBR } from "@/lib/dataHoraBR";
import { toCsv } from "@/lib/csv";

export async function GET(request: NextRequest) {
  await exigirAnalistaLogado();

  const sp: SearchParamsRelatorio = {};
  for (const key of new Set(request.nextUrl.searchParams.keys())) {
    const valores = request.nextUrl.searchParams.getAll(key);
    sp[key] = valores.length > 1 ? valores : valores[0];
  }

  const filtros = parseFiltros(sp);
  const ocorrencias = await listarResumosExecutivos(filtros);

  const linhas = ocorrencias.map((o) => [
    o.tipo.nome,
    o.titulo,
    parceriaEmpresaLabel(o) ?? "",
    o.ambienteInfra?.nome ?? "",
    o.recurso?.nome ?? "",
    o.cdn?.nome ?? "",
    o.plataforma?.nome ?? "",
    o.servico?.nome ?? "",
    o.sistemaOperacional?.nome ?? "",
    nomeCausa(o),
    nomeSolucao(o),
    formatarDataHoraBR(o.createdAt),
    o.resolvidoEm ? formatarDataHoraBR(o.resolvidoEm) : "",
    o.analista.nome,
    o.ticket ?? "",
  ]);

  const csv = toCsv(
    [
      "Afiliada",
      "Título",
      "Parceria / Empresa",
      "Ambiente",
      "Recurso",
      "CDN",
      "Plataforma",
      "Serviço",
      "Devices",
      "Causa",
      "Solução",
      "Início",
      "Fim",
      "Analista",
      "Ticket",
    ],
    linhas,
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="resumos-executivos.csv"',
    },
  });
}
