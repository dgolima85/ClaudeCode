import { prisma } from "@/lib/prisma";
import CrudTable from "@/components/admin/CrudTable";
import { criarParceria, atualizarParceria, excluirParceria } from "./actions";

export default async function ParceriasPage() {
  const parcerias = await prisma.parceria.findMany({ orderBy: { nome: "asc" } });
  const itens = parcerias.map((p) => ({ id: p.id, ativo: p.ativo, nome: p.nome }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Parcerias</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Cadastre as parcerias; depois vincule as empresas de cada uma em{" "}
          <span className="font-medium">Empresas</span>.
        </p>
      </div>
      <CrudTable
        campos={[{ key: "nome", label: "Nome", type: "text", required: true }]}
        itens={itens}
        criar={criarParceria}
        atualizar={atualizarParceria}
        excluir={excluirParceria}
        labelNovo="Adicionar parceria"
      />
    </div>
  );
}
