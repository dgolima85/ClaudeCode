type ExportCsvButtonProps = {
  queryString: string;
};

export default function ExportCsvButton({ queryString }: ExportCsvButtonProps) {
  return (
    <a
      href={`/relatorios/tabela/export${queryString ? `?${queryString}` : ""}`}
      className="rounded-md border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      Exportar CSV
    </a>
  );
}
