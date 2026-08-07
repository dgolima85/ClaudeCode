import { prisma } from "@/lib/prisma";
import CrudTable from "@/components/admin/CrudTable";
import { criarServico, atualizarServico, excluirServico } from "./actions";

export default async function ServicosPage() {
  const servicos = await prisma.servico.findMany({ orderBy: { nome: "asc" } });
  const itens = servicos.map((s) => ({ id: s.id, ativo: s.ativo, nome: s.nome }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Serviços</h1>
        <p className="text-sm text-gray-500">Ex: E-mail, VPN, Banco de Dados, Aplicação Web.</p>
      </div>
      <CrudTable
        campos={[{ key: "nome", label: "Nome", type: "text", required: true }]}
        itens={itens}
        criar={criarServico}
        atualizar={atualizarServico}
        excluir={excluirServico}
        labelNovo="Adicionar serviço"
      />
    </div>
  );
}
