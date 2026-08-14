import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { exigirAnalistaLogado } from "@/lib/session";
import { buscarResumoExecutivo, nomeCausa, nomeSolucao, parceriaEmpresaLabel } from "@/lib/resumoExecutivo";
import { ResumoExecutivoPdfDocument } from "@/lib/pdf/ResumoExecutivoPdfDocument";
import { STATUS_LABELS, type StatusOcorrencia } from "@/lib/status";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await exigirAnalistaLogado();
  const { id } = await params;

  const o = await buscarResumoExecutivo(id);
  if (!o) {
    return new NextResponse("Ocorrência não encontrada.", { status: 404 });
  }

  const buffer = await renderToBuffer(
    <ResumoExecutivoPdfDocument
      titulo={o.titulo}
      status={STATUS_LABELS[o.status as StatusOcorrencia] ?? o.status}
      resolvido={o.status === "RESOLVIDO"}
      ticket={o.ticket}
      tipo={o.tipo.nome}
      parceriaEmpresa={parceriaEmpresaLabel(o)}
      ambiente={o.ambienteInfra?.nome ?? null}
      recurso={o.recursos.map((r) => r.nome).join(", ") || null}
      cdn={o.cdn?.nome ?? null}
      plataforma={o.plataformas.map((p) => p.nome).join(", ") || null}
      canal={o.canais.map((c) => c.nome).join(", ") || null}
      servico={o.servicos.map((s) => s.nome).join(", ") || null}
      sistemaOperacional={o.sistemasOperacionais.map((s) => s.nome).join(", ") || null}
      analista={o.analista.nome}
      inicio={o.createdAt.toISOString()}
      fim={o.resolvidoEm ? o.resolvidoEm.toISOString() : null}
      causa={nomeCausa(o)}
      solucao={nomeSolucao(o)}
      eventos={o.eventos.map((e) => ({
        createdAt: e.createdAt.toISOString(),
        analista: e.analista.nome,
        comentario: e.comentario,
      }))}
    />,
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="resumo-executivo-${o.ticket ?? o.id}.pdf"`,
    },
  });
}
