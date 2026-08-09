import { prisma } from "@/lib/prisma";
import CrudTable from "@/components/admin/CrudTable";
import { criarCausa, atualizarCausa, excluirCausa } from "./actions";

export default async function CausasPage() {
  const causas = await prisma.causa.findMany({ orderBy: { nome: "asc" } });
  const itens = causas.map((c) => ({ id: c.id, ativo: c.ativo, nome: c.nome }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Causas</h1>
        <p className="text-sm text-gray-500">
          Causas disponíveis para a normalização de ocorrências resolvidas.
        </p>
      </div>
      <CrudTable
        campos={[{ key: "nome", label: "Nome", type: "text", required: true }]}
        itens={itens}
        criar={criarCausa}
        atualizar={atualizarCausa}
        excluir={excluirCausa}
        labelNovo="Adicionar causa"
      />
    </div>
  );
}
