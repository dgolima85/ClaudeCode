import { entrarComMicrosoft } from "./actions";

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
          {ERROS_LOGIN_MICROSOFT[error] ?? "Não foi possível entrar com a Microsoft. Tente novamente."}
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
    </div>
  );
}
