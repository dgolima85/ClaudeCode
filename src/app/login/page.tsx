import { prisma } from "@/lib/prisma";
import { TURNO_LABELS, type Turno } from "@/lib/turno";
import { entrarComMicrosoft, login } from "./actions";

const ERROS_LOGIN_MICROSOFT: Record<string, string> = {
  AccessDenied:
    "Sua conta Microsoft não está associada a um analista ativo cadastrado neste sistema. Peça para o administrador cadastrar seu e-mail em Administração → Analistas.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const { redirect, error } = await searchParams;
  const analistas = await prisma.analista.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Passagem de Turno — NOC/VOC
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Identifique-se para registrar e acompanhar as ocorrências do seu turno.
        </p>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/40 dark:text-red-300">
          {ERROS_LOGIN_MICROSOFT[error] ??
            "Não foi possível entrar com a Microsoft. Tente novamente ou use a lista de analistas abaixo."}
        </p>
      )}

      <form action={entrarComMicrosoft}>
        <input type="hidden" name="redirect" value={redirect ?? ""} />
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
        >
          Entrar com Microsoft
        </button>
      </form>

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
    </div>
  );
}
