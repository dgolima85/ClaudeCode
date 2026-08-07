import Link from "next/link";
import { getAnalistaLogado } from "@/lib/session";
import { sair } from "@/app/login/actions";
import { TURNO_LABELS, type Turno } from "@/lib/turno";

export default async function HeaderAnalistaLogado() {
  const analista = await getAnalistaLogado();

  if (!analista) return null;

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-6 py-3">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-sm font-semibold text-gray-900">
          Passagem de Turno
        </Link>
        <nav className="flex gap-4 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">
            Ocorrências
          </Link>
          <Link href="/admin/analistas" className="hover:text-blue-600">
            Administração
          </Link>
          <Link href="/relatorios" className="hover:text-blue-600">
            Relatórios
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-700">
          {analista.nome}{" "}
          <span className="text-gray-400">
            ({TURNO_LABELS[analista.turno as Turno] ?? analista.turno})
          </span>
        </span>
        <form action={sair}>
          <button type="submit" className="text-blue-600 hover:underline">
            Trocar analista
          </button>
        </form>
      </div>
    </header>
  );
}
