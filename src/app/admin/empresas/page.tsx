import { prisma } from "@/lib/prisma";
import CrudTable from "@/components/admin/CrudTable";
import { criarEmpresa, atualizarEmpresa, excluirEmpresa } from "./actions";

export default async function EmpresasPage() {
  const [empresas, parcerias] = await Promise.all([
    prisma.empresa.findMany({ orderBy: { nome: "asc" } }),
    prisma.parceria.findMany({ orderBy: { nome: "asc" } }),
  ]);

  const itens = empresas.map((e) => ({
    id: e.id,
    ativo: e.ativo,
    nome: e.nome,
    parceriaId: e.parceriaId,
  }));

  const parceriaOptions = parcerias.map((p) => ({
    value: p.id,
    label: p.ativo ? p.nome : `${p.nome} (inativa)`,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Empresas</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Cada empresa pertence a uma parceria. Cadastre parcerias primeiro em{" "}
          <span className="font-medium">Parcerias</span>.
        </p>
      </div>
      {parcerias.length === 0 ? (
        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-yellow-900/40 dark:text-yellow-300">
          Cadastre ao menos uma parceria antes de adicionar empresas.
        </p>
      ) : (
        <CrudTable
          campos={[
            { key: "nome", label: "Nome", type: "text", required: true },
            {
              key: "parceriaId",
              label: "Parceria",
              type: "select",
              required: true,
              options: parceriaOptions,
            },
          ]}
          itens={itens}
          criar={criarEmpresa}
          atualizar={atualizarEmpresa}
          excluir={excluirEmpresa}
          labelNovo="Adicionar empresa"
        />
      )}
    </div>
  );
}
