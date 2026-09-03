import Link from "next/link";
import { getAnalistaLogado } from "@/lib/session";
import { sair } from "@/app/login/actions";
import { TURNO_LABELS, type Turno } from "@/lib/turno";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default async function HeaderAnalistaLogado() {
  const analista = await getAnalistaLogado();

  if (!analista) return null;

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Passagem de Turno
        </Link>
        <nav className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
            Ocorrências
          </Link>
          <Link href="/passagem-turno" className="hover:text-blue-600 dark:hover:text-blue-400">
            Passagem de Turno
          </Link>
          <Link href="/admin/analistas" className="hover:text-blue-600 dark:hover:text-blue-400">
            Administração
          </Link>
          <Link href="/relatorios" className="hover:text-blue-600 dark:hover:text-blue-400">
            Relatórios
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-700 dark:text-gray-300">
          {analista.nome}{" "}
          <span className="text-gray-400 dark:text-gray-500">
            ({TURNO_LABELS[analista.turno as Turno] ?? analista.turno})
          </span>
        </span>
        <form action={sair}>
          <button type="submit" className="text-blue-600 hover:underline dark:text-blue-400">
            Logout
          </button>
        </form>
        <ThemeToggle />
      </div>
    </header>
  );
}
