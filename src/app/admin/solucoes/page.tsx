import { prisma } from "@/lib/prisma";
import CrudTable from "@/components/admin/CrudTable";
import { criarSolucao, atualizarSolucao, excluirSolucao } from "./actions";

export default async function SolucoesPage() {
  const solucoes = await prisma.solucao.findMany({ orderBy: { nome: "asc" } });
  const itens = solucoes.map((s) => ({ id: s.id, ativo: s.ativo, nome: s.nome }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Soluções</h1>
        <p className="text-sm text-gray-500">
          Soluções disponíveis para a normalização de ocorrências resolvidas.
        </p>
      </div>
      <CrudTable
        campos={[{ key: "nome", label: "Nome", type: "text", required: true }]}
        itens={itens}
        criar={criarSolucao}
        atualizar={atualizarSolucao}
        excluir={excluirSolucao}
        labelNovo="Adicionar solução"
      />
    </div>
  );
}
