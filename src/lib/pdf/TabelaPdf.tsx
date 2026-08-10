import { View, Text } from "@react-pdf/renderer";
import { estilos } from "./estilos";

export type ColunaPdf = { label: string; largura: number };

type TabelaPdfProps = {
  colunas: ColunaPdf[];
  linhas: string[][];
  mensagemVazio?: string;
};

export function TabelaPdf({ colunas, linhas, mensagemVazio = "Nenhum registro encontrado." }: TabelaPdfProps) {
  return (
    <View style={estilos.tabela}>
      <View style={estilos.linhaCabecalho} fixed>
        {colunas.map((c, i) => (
          <Text key={i} style={[estilos.celulaCabecalho, { flex: c.largura }]}>
            {c.label}
          </Text>
        ))}
      </View>
      {linhas.map((linha, i) => (
        <View key={i} style={estilos.linha} wrap={false}>
          {linha.map((valor, j) => (
            <Text key={j} style={[estilos.celula, { flex: colunas[j].largura }]}>
              {valor}
            </Text>
          ))}
        </View>
      ))}
      {linhas.length === 0 && (
        <View style={estilos.linha}>
          <Text style={[estilos.celula, { flex: 1 }]}>{mensagemVazio}</Text>
        </View>
      )}
    </View>
  );
}
