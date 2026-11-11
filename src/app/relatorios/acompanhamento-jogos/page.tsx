import AcompanhamentoJogosCharts from "@/components/relatorios/AcompanhamentoJogosCharts";
import { buscarRelatorioAcompanhamentoJogos } from "@/lib/acompanhamentoJogos";

export default async function AcompanhamentoJogosPage() {
  const relatorio = await buscarRelatorioAcompanhamentoJogos();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Acompanhamento dos Jogos</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Checklist de transmissão preenchido pelos analistas no painel &quot;Jogos de Hoje&quot; (Ocorrências
          Ongoing): canal testado e validado, som e imagem, delay em relação à Claro e relatório pós jogo.
        </p>
      </div>

      <AcompanhamentoJogosCharts relatorio={relatorio} />
    </div>
  );
}
