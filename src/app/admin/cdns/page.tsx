import { prisma } from "@/lib/prisma";
import CrudTable from "@/components/admin/CrudTable";
import { criarCdn, atualizarCdn, excluirCdn } from "./actions";

export default async function CdnsPage() {
  const cdns = await prisma.cdn.findMany({ orderBy: { nome: "asc" } });
  const itens = cdns.map((c) => ({ id: c.id, ativo: c.ativo, nome: c.nome }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">CDN</h1>
      </div>
      <CrudTable
        campos={[{ key: "nome", label: "Nome", type: "text", required: true }]}
        itens={itens}
        criar={criarCdn}
        atualizar={atualizarCdn}
        excluir={excluirCdn}
        labelNovo="Adicionar CDN"
      />
    </div>
  );
}
