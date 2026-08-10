type ExportCsvButtonProps = {
  href: string;
  queryString: string;
  label?: string;
};

export default function ExportCsvButton({ href, queryString, label = "Exportar CSV" }: ExportCsvButtonProps) {
  return (
    <a
      href={`${href}${queryString ? `?${queryString}` : ""}`}
      className="rounded-md border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      {label}
    </a>
  );
}
