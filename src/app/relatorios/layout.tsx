import Link from "next/link";

const LINKS = [
  { href: "/relatorios", label: "Dashboard" },
  { href: "/relatorios/tabela", label: "Tabela" },
  { href: "/relatorios/passagem-turno", label: "Passagem de Turno" },
];

export default function RelatoriosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 p-6">
      <nav className="flex gap-1 border-b border-gray-200">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-t-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
