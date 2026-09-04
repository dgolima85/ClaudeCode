import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { exigirAnalistaLogado } from "@/lib/session";
import { TURNOS, isTurno, diaInicioTurnoAtual, type Turno } from "@/lib/turno";
import { buscarDadosPassagemTurno } from "@/lib/passagemTurno";
import { PassagemTurnoPdfDocument, type LinhaPassagemTurnoPdf } from "@/lib/pdf/PassagemTurnoPdfDocument";
import type { StatusOcorrencia } from "@/lib/status";

export async function GET(request: NextRequest) {
  const analista = await exigirAnalistaLogado();

  const sp = request.nextUrl.searchParams;
  const turnoParam = sp.get("turno");
  const turnoSelecionado: Turno =
    turnoParam && isTurno(turnoParam) ? turnoParam : ((analista.turno as Turno) ?? TURNOS[0]);
  const dataSelecionada = sp.get("data") || diaInicioTurnoAtual(turnoSelecionado);

  const { emAberto, atividade } = await buscarDadosPassagemTurno(turnoSelecionado, dataSelecionada);

  function mapLinha(o: (typeof emAberto)[number]): LinhaPassagemTurnoPdf {
    return {
      tipo: o.tipo.nome,
      status: o.status as StatusOcorrencia,
      createdAt: o.createdAt.toISOString(),
      analista: o.analista.nome,
      titulo: o.titulo,
      ticket: o.ticket,
    };
  }

  const buffer = await renderToBuffer(
    <PassagemTurnoPdfDocument
      turno={turnoSelecionado}
      data={dataSelecionada}
      geradoEm={new Date().toISOString()}
      geradoPor={analista.nome}
      emAberto={emAberto.map(mapLinha)}
      atividade={atividade.map(mapLinha)}
    />,
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="passagem-turno-${turnoSelecionado.toLowerCase()}-${dataSelecionada}.pdf"`,
    },
  });
}
