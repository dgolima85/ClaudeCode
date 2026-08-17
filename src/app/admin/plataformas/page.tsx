import { prisma } from "@/lib/prisma";
import CrudTable from "@/components/admin/CrudTable";
import { criarPlataforma, atualizarPlataforma, excluirPlataforma } from "./actions";

export default async function PlataformasPage() {
  const plataformas = await prisma.plataforma.findMany({ orderBy: { nome: "asc" } });
  const itens = plataformas.map((p) => ({ id: p.id, ativo: p.ativo, nome: p.nome }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Plataforma</h1>
      </div>
      <CrudTable
        campos={[{ key: "nome", label: "Nome", type: "text", required: true }]}
        itens={itens}
        criar={criarPlataforma}
        atualizar={atualizarPlataforma}
        excluir={excluirPlataforma}
        labelNovo="Adicionar plataforma"
      />
    </div>
  );
}
