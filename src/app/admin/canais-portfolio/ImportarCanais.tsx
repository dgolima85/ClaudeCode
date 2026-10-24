"use client";

import { useState, useTransition } from "react";
import { importarCanaisPortfolio } from "./actions";

export default function ImportarCanais() {
  const [texto, setTexto] = useState("");
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function importar() {
    setErro(null);
    setMensagem(null);
    startTransition(async () => {
      const res = await importarCanaisPortfolio(texto);
      if (res.error) {
        setErro(res.error);
        return;
      }
      setMensagem(`${res.importados} canal(is) novo(s) importado(s).`);
      setTexto("");
    });
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Importar em lote</h2>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Cole uma lista de nomes de canais, um por linha. Nomes que já existirem são ignorados.
      </p>
      <textarea
        value={texto}
        disabled={pending}
        onChange={(e) => setTexto(e.target.value)}
        rows={5}
        placeholder={"Globo\nSportv\nESPN 2\n..."}
        className="mt-2 w-full rounded border border-gray-300 px-2 py-1 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          disabled={pending || !texto.trim()}
          onClick={importar}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Importar
        </button>
        {mensagem && <span className="text-xs text-green-700 dark:text-green-400">{mensagem}</span>}
        {erro && <span className="text-xs text-red-600 dark:text-red-400">{erro}</span>}
      </div>
    </div>
  );
}
