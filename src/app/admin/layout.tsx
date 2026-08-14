import Link from "next/link";

const LINKS = [
  { href: "/admin/analistas", label: "Analistas" },
  { href: "/admin/tipos-ocorrencia", label: "Origens" },
  { href: "/admin/parcerias", label: "Parcerias" },
  { href: "/admin/empresas", label: "Empresas" },
  { href: "/admin/servicos", label: "Serviços" },
  { href: "/admin/sistemas-operacionais", label: "Devices" },
  { href: "/admin/ambientes-infra", label: "Ambiente" },
  { href: "/admin/recursos", label: "Recurso" },
  { href: "/admin/cdns", label: "CDN" },
  { href: "/admin/plataformas", label: "Plataforma" },
  { href: "/admin/canais", label: "Canal" },
  { href: "/admin/causas", label: "Causas" },
  { href: "/admin/solucoes", label: "Soluções" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-6xl gap-8 p-6">
      <aside className="w-56 shrink-0">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Administração
        </h2>
        <nav className="flex flex-col gap-1 text-sm">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded px-2 py-1.5 text-gray-700 hover:bg-gray-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
