import { prisma } from "@/lib/prisma";
import CrudTable from "@/components/admin/CrudTable";
import { criarTipoOcorrencia, atualizarTipoOcorrencia, excluirTipoOcorrencia } from "./actions";

export default async function TiposOcorrenciaPage() {
  const tipos = await prisma.tipoOcorrencia.findMany({ orderBy: { nome: "asc" } });
  const itens = tipos.map((t) => ({ id: t.id, ativo: t.ativo, nome: t.nome }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Tipos de Ocorrência</h1>
        <p className="text-sm text-gray-500">
          Categorias usadas para classificar as ocorrências registradas.
        </p>
      </div>
      <CrudTable
        campos={[{ key: "nome", label: "Nome", type: "text", required: true }]}
        itens={itens}
        criar={criarTipoOcorrencia}
        atualizar={atualizarTipoOcorrencia}
        excluir={excluirTipoOcorrencia}
        labelNovo="Adicionar tipo"
      />
    </div>
  );
}
