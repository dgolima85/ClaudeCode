import { prisma } from "@/lib/prisma";
import { TURNO_LABELS, type Turno } from "@/lib/turno";
import { login } from "@/app/login/actions";

// Backup do login manual (selecionar o nome na lista, sem autenticação real)
// desativado a pedido do usuário em favor de exigir sempre "Entrar com
// Microsoft". Não é usado em nenhuma página no momento — mantido aqui,
// pronto para uso, apenas para permitir rollback rápido se for preciso:
// basta importar <LoginManualForm redirect={redirect} /> de volta em
// src/app/login/page.tsx.
export default async function LoginManualForm({ redirect }: { redirect?: string }) {
  const analistas = await prisma.analista.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
  });

  return (
    <>
      <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
        <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        ou entre selecionando seu nome
        <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
      </div>

      <form action={login} className="flex flex-col gap-4">
        <input type="hidden" name="redirect" value={redirect ?? ""} />
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Analista</span>
          <select
            name="analistaId"
            required
            defaultValue=""
            className="rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
          >
            <option value="" disabled>
              Selecione seu nome
            </option>
            {analistas.map((analista) => (
              <option key={analista.id} value={analista.id}>
                {analista.nome} — {TURNO_LABELS[analista.turno as Turno] ?? analista.turno}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={analistas.length === 0}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Entrar
        </button>
      </form>

      {analistas.length === 0 && (
        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-yellow-900/40 dark:text-yellow-300">
          Nenhum analista cadastrado ainda. Rode o seed inicial (
          <code>npx prisma db seed</code>) ou cadastre um analista diretamente no
          banco para conseguir entrar pela primeira vez.
        </p>
      )}
    </>
  );
}
