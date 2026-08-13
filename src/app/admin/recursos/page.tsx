import { prisma } from "@/lib/prisma";
import CrudTable from "@/components/admin/CrudTable";
import { criarRecurso, atualizarRecurso, excluirRecurso } from "./actions";

export default async function RecursosPage() {
  const [recursos, ambientes] = await Promise.all([
    prisma.recurso.findMany({ orderBy: { nome: "asc" } }),
    prisma.ambienteInfra.findMany({ orderBy: { nome: "asc" } }),
  ]);

  const itens = recursos.map((r) => ({
    id: r.id,
    ativo: r.ativo,
    nome: r.nome,
    ambienteInfraId: r.ambienteInfraId,
  }));

  const ambienteOptions = ambientes.map((a) => ({
    value: a.id,
    label: a.ativo ? a.nome : `${a.nome} (inativo)`,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Recurso</h1>
        <p className="text-sm text-gray-500">
          Cada recurso pertence a um ambiente (ex: recursos de AWS, recursos de Data Center).
          Cadastre ambientes primeiro em <span className="font-medium">Ambiente</span>.
        </p>
      </div>
      {ambientes.length === 0 ? (
        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          Cadastre ao menos um ambiente antes de adicionar recursos.
        </p>
      ) : (
        <CrudTable
          campos={[
            { key: "nome", label: "Nome", type: "text", required: true },
            {
              key: "ambienteInfraId",
              label: "Ambiente",
              type: "select",
              required: true,
              options: ambienteOptions,
            },
          ]}
          itens={itens}
          criar={criarRecurso}
          atualizar={atualizarRecurso}
          excluir={excluirRecurso}
          labelNovo="Adicionar recurso"
        />
      )}
    </div>
  );
}
