type ExportPdfButtonProps = {
  href: string;
  label?: string;
};

export default function ExportPdfButton({ href, label = "Exportar PDF" }: ExportPdfButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-md border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      {label}
    </a>
  );
}
