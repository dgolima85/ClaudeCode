import { prisma } from "@/lib/prisma";
import CrudTable from "@/components/admin/CrudTable";
import { criarAmbienteInfra, atualizarAmbienteInfra, excluirAmbienteInfra } from "./actions";

export default async function AmbientesInfraPage() {
  const ambientes = await prisma.ambienteInfra.findMany({ orderBy: { nome: "asc" } });
  const itens = ambientes.map((a) => ({ id: a.id, ativo: a.ativo, nome: a.nome }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Ambiente</h1>
        <p className="text-sm text-gray-500">
          Ex: AWS, Data Center Lapa, Data Center Campinas. Cada ambiente tem sua própria lista de
          Recursos — cadastre-os em <span className="font-medium">Recurso</span>.
        </p>
      </div>
      <CrudTable
        campos={[{ key: "nome", label: "Nome", type: "text", required: true }]}
        itens={itens}
        criar={criarAmbienteInfra}
        atualizar={atualizarAmbienteInfra}
        excluir={excluirAmbienteInfra}
        labelNovo="Adicionar ambiente"
      />
    </div>
  );
}
