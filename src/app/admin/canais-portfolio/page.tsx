import { prisma } from "@/lib/prisma";
import CrudTable from "@/components/admin/CrudTable";
import ImportarCanais from "./ImportarCanais";
import { criarCanalPortfolio, atualizarCanalPortfolio, excluirCanalPortfolio } from "./actions";

export default async function CanaisPortfolioPage() {
  const canais = await prisma.canalPortfolio.findMany({ orderBy: { nome: "asc" } });
  const itens = canais.map((c) => ({ id: c.id, ativo: c.ativo, nome: c.nome }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Canais de Transmissão</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Canais do nosso portfólio — usado pelo painel &quot;Jogos de Hoje&quot; (Passagem de Turno) pra exibir só
          os canais de transmissão que são nossos, escondendo o jogo inteiro quando nenhum canal dele for nosso.
        </p>
      </div>
      <ImportarCanais />
      <CrudTable
        campos={[{ key: "nome", label: "Nome", type: "text", required: true }]}
        itens={itens}
        criar={criarCanalPortfolio}
        atualizar={atualizarCanalPortfolio}
        excluir={excluirCanalPortfolio}
        labelNovo="Adicionar canal"
      />
    </div>
  );
}
