import { prisma } from "@/lib/prisma";
import CrudTable from "@/components/admin/CrudTable";
import { criarAmbiente, atualizarAmbiente, excluirAmbiente } from "./actions";

export default async function AmbientesPage() {
  const ambientes = await prisma.ambiente.findMany({ orderBy: { nome: "asc" } });
  const itens = ambientes.map((a) => ({ id: a.id, ativo: a.ativo, nome: a.nome }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Ambientes</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Ex: Produção, Homologação, Desenvolvimento.</p>
      </div>
      <CrudTable
        campos={[{ key: "nome", label: "Nome", type: "text", required: true }]}
        itens={itens}
        criar={criarAmbiente}
        atualizar={atualizarAmbiente}
        excluir={excluirAmbiente}
        labelNovo="Adicionar ambiente"
      />
    </div>
  );
}
