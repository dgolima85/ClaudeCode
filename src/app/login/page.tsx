import { prisma } from "@/lib/prisma";
import { TURNO_LABELS, type Turno } from "@/lib/turno";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
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

      <form action={login} className="flex flex-col gap-4">
        <input type="hidden" name="redirect" value={redirect ?? ""} />
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Analista</span>
          <select
            name="analistaId"
            required
            defaultValue=""
            className="rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:text-gray-100 dark:[color-scheme:dark]"
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
