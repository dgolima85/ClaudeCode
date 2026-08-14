import { Document, Page, Text } from "@react-pdf/renderer";
import { estilos } from "./estilos";
import { TabelaPdf, type ColunaPdf } from "./TabelaPdf";
import { TURNO_LABELS, type Turno } from "@/lib/turno";
import { STATUS_LABELS, type StatusOcorrencia } from "@/lib/status";
import { formatarDataHoraBR } from "@/lib/dataHoraBR";

export type LinhaPassagemTurnoPdf = {
  tipo: string;
  status: StatusOcorrencia;
  createdAt: string;
  analista: string;
  titulo: string;
  ticket: string | null;
};

type PassagemTurnoPdfDocumentProps = {
  turno: Turno;
  data: string;
  geradoEm: string;
  geradoPor: string;
  emAberto: LinhaPassagemTurnoPdf[];
  atividade: LinhaPassagemTurnoPdf[];
};

const colunas: ColunaPdf[] = [
  { label: "Origem", largura: 2 },
  { label: "Status", largura: 1.3 },
  { label: "Início", largura: 1.3 },
  { label: "Analista", largura: 1.3 },
  { label: "Título", largura: 2.8 },
  { label: "Ticket", largura: 1 },
];

function formatarDataBR(dia: string): string {
  const [ano, mes, diaDoMes] = dia.split("-");
  return `${diaDoMes}/${mes}/${ano}`;
}

function linhasParaTabela(linhas: LinhaPassagemTurnoPdf[]): string[][] {
  return linhas.map((l) => [
    l.tipo,
    STATUS_LABELS[l.status] ?? l.status,
    formatarDataHoraBR(l.createdAt),
    l.analista,
    l.titulo,
    l.ticket ?? "—",
  ]);
}

export function PassagemTurnoPdfDocument({
  turno,
  data,
  geradoEm,
  geradoPor,
  emAberto,
  atividade,
}: PassagemTurnoPdfDocumentProps) {
  return (
    <Document title={`Passagem de Turno - ${TURNO_LABELS[turno]} - ${data}`}>
      <Page size="A4" orientation="landscape" style={estilos.pagina}>
        <Text style={estilos.tituloRelatorio}>Passagem de Turno</Text>
        <Text style={estilos.subtitulo}>
          Turno {TURNO_LABELS[turno]} · {formatarDataBR(data)} · Gerado por {geradoPor} em{" "}
          {formatarDataHoraBR(geradoEm)}
        </Text>

        <Text style={estilos.secaoTitulo}>Em Aberto ({emAberto.length})</Text>
        <TabelaPdf colunas={colunas} linhas={linhasParaTabela(emAberto)} />

        <Text style={estilos.secaoTitulo}>Atividade no Período ({atividade.length})</Text>
        <TabelaPdf colunas={colunas} linhas={linhasParaTabela(atividade)} />

        <Text
          style={estilos.rodape}
          render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}
