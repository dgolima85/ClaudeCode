import ComunicadoForm from "@/components/comunicados/ComunicadoForm";

export default function ComunicadosPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 p-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Comunicados</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Preencha os campos do acionamento e gere uma imagem pronta para colar no e-mail. Nada aqui é
          salvo — a imagem só existe no seu navegador.
        </p>
      </div>

      <ComunicadoForm />
    </div>
  );
}
