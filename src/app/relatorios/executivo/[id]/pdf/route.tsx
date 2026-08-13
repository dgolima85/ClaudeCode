import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { exigirAnalistaLogado } from "@/lib/session";
import { buscarResumoExecutivo, nomeCausa, nomeSolucao, parceriaEmpresaLabel } from "@/lib/resumoExecutivo";
import { ResumoExecutivoPdfDocument } from "@/lib/pdf/ResumoExecutivoPdfDocument";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await exigirAnalistaLogado();
  const { id } = await params;

  const o = await buscarResumoExecutivo(id);
  if (!o) {
    return new NextResponse("Ocorrência não encontrada ou ainda não normalizada.", { status: 404 });
  }

  const buffer = await renderToBuffer(
    <ResumoExecutivoPdfDocument
      titulo={o.titulo}
      ticket={o.ticket}
      tipo={o.tipo.nome}
      parceriaEmpresa={parceriaEmpresaLabel(o)}
      ambiente={o.ambienteInfra?.nome ?? null}
      recurso={o.recurso?.nome ?? null}
      cdn={o.cdn?.nome ?? null}
      plataforma={o.plataforma?.nome ?? null}
      servico={o.servico?.nome ?? null}
      sistemaOperacional={o.sistemaOperacional?.nome ?? null}
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
