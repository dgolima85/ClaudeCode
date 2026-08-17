import { prisma } from "@/lib/prisma";
import CrudTable from "@/components/admin/CrudTable";
import { TURNOS, TURNO_LABELS, type Turno } from "@/lib/turno";
import { criarAnalista, atualizarAnalista, excluirAnalista } from "./actions";

export default async function AnalistasPage() {
  const analistas = await prisma.analista.findMany({ orderBy: { nome: "asc" } });

  const itens = analistas.map((a) => ({
    id: a.id,
    ativo: a.ativo,
    nome: a.nome,
    email: a.email,
    turno: a.turno,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Analistas</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Cadastro dos analistas do time: nome, email e turno.
        </p>
      </div>
      <CrudTable
        campos={[
          { key: "nome", label: "Nome", type: "text", required: true },
          { key: "email", label: "Email", type: "email", required: true },
          {
            key: "turno",
            label: "Turno",
            type: "select",
            required: true,
            options: TURNOS.map((t) => ({ value: t, label: TURNO_LABELS[t as Turno] })),
          },
        ]}
        itens={itens}
        criar={criarAnalista}
        atualizar={atualizarAnalista}
        excluir={excluirAnalista}
        labelNovo="Adicionar analista"
      />
    </div>
  );
}
