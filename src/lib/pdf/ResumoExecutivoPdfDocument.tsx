import { Document, Page, View, Text } from "@react-pdf/renderer";
import { estilos } from "./estilos";
import { formatarDataHoraBR } from "@/lib/dataHoraBR";

export type EventoPdf = {
  createdAt: string;
  analista: string;
  comentario: string;
};

type ResumoExecutivoPdfDocumentProps = {
  titulo: string;
  ticket: string | null;
  tipo: string;
  parceriaEmpresa: string | null;
  ambiente: string | null;
  recurso: string | null;
  cdn: string | null;
  plataforma: string | null;
  servico: string | null;
  sistemaOperacional: string | null;
  analista: string;
  inicio: string;
  fim: string | null;
  causa: string;
  solucao: string;
  eventos: EventoPdf[];
};

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <View style={estilos.campo}>
      <Text style={estilos.campoLabel}>{label}</Text>
      <Text style={estilos.campoValor}>{valor}</Text>
    </View>
  );
}

export function ResumoExecutivoPdfDocument({
  titulo,
  ticket,
  tipo,
  parceriaEmpresa,
  ambiente,
  recurso,
  cdn,
  plataforma,
  servico,
  sistemaOperacional,
  analista,
  inicio,
  fim,
  causa,
  solucao,
  eventos,
}: ResumoExecutivoPdfDocumentProps) {
  return (
    <Document title={`Resumo Executivo - ${titulo}`}>
      <Page size="A4" style={estilos.pagina}>
        <Text style={estilos.tituloRelatorio}>Resumo Executivo da Ocorrência</Text>
        <Text style={estilos.subtitulo}>{titulo}</Text>

        <View style={estilos.grade}>
          <Campo label="Afiliada" valor={tipo} />
          <Campo label="Ticket" valor={ticket ?? "—"} />
          <Campo label="Analista" valor={analista} />
          <Campo label="Parceria / Empresa" valor={parceriaEmpresa ?? "—"} />
          <Campo label="Ambiente" valor={ambiente ?? "—"} />
          <Campo label="Recurso" valor={recurso ?? "—"} />
          <Campo label="CDN" valor={cdn ?? "—"} />
          <Campo label="Plataforma" valor={plataforma ?? "—"} />
          <Campo label="Serviço" valor={servico ?? "—"} />
          <Campo label="Devices" valor={sistemaOperacional ?? "—"} />
          <Campo label="Início" valor={formatarDataHoraBR(inicio)} />
          <Campo label="Fim" valor={fim ? formatarDataHoraBR(fim) : "—"} />
        </View>

        <View style={estilos.blocoDestaque}>
          <Text style={estilos.blocoDestaqueLabel}>Causa</Text>
          <Text style={estilos.blocoDestaqueTexto}>{causa}</Text>
        </View>
        <View style={estilos.blocoDestaque}>
          <Text style={estilos.blocoDestaqueLabel}>Solução</Text>
          <Text style={estilos.blocoDestaqueTexto}>{solucao}</Text>
        </View>

        {eventos.length > 0 && (
          <>
            <Text style={estilos.secaoTitulo}>Histórico de Eventos ({eventos.length})</Text>
            {eventos.map((e, i) => (
              <View key={i} style={estilos.eventoItem} wrap={false}>
                <Text style={estilos.eventoCabecalho}>
                  {formatarDataHoraBR(e.createdAt)} — {e.analista}
                </Text>
                <Text style={estilos.eventoTexto}>{e.comentario}</Text>
              </View>
            ))}
          </>
        )}

        <Text
          style={estilos.rodape}
          render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}
