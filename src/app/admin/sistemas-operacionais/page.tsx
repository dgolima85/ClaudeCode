import { prisma } from "@/lib/prisma";
import CrudTable from "@/components/admin/CrudTable";
import {
  criarSistemaOperacional,
  atualizarSistemaOperacional,
  excluirSistemaOperacional,
} from "./actions";

export default async function SistemasOperacionaisPage() {
  const sistemas = await prisma.sistemaOperacional.findMany({ orderBy: { nome: "asc" } });
  const itens = sistemas.map((s) => ({ id: s.id, ativo: s.ativo, nome: s.nome }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Devices</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Ex: Linux, Windows Server, Windows 10/11.</p>
      </div>
      <CrudTable
        campos={[{ key: "nome", label: "Nome", type: "text", required: true }]}
        itens={itens}
        criar={criarSistemaOperacional}
        atualizar={atualizarSistemaOperacional}
        excluir={excluirSistemaOperacional}
        labelNovo="Adicionar device"
      />
    </div>
  );
}
