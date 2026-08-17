import { prisma } from "@/lib/prisma";
import CrudTable from "@/components/admin/CrudTable";
import { criarCanal, atualizarCanal, excluirCanal } from "./actions";

export default async function CanaisPage() {
  const canais = await prisma.canal.findMany({ orderBy: { nome: "asc" } });
  const itens = canais.map((c) => ({ id: c.id, ativo: c.ativo, nome: c.nome }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Canal</h1>
      </div>
      <CrudTable
        campos={[{ key: "nome", label: "Nome", type: "text", required: true }]}
        itens={itens}
        criar={criarCanal}
        atualizar={atualizarCanal}
        excluir={excluirCanal}
        labelNovo="Adicionar canal"
      />
    </div>
  );
}
