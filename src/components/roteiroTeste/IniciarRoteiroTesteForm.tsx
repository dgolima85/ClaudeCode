"use client";

import { useState } from "react";
import { ROTINAS_TESTE, ROTINA_TESTE_LABELS, type RotinaTeste } from "@/lib/roteiroTeste/rotinas";
import RoteiroTesteModal from "./RoteiroTesteModal";

type IniciarRoteiroTesteFormProps = {
  onExecucaoSalva: () => void;
};

export default function IniciarRoteiroTesteForm({ onExecucaoSalva }: IniciarRoteiroTesteFormProps) {
  const [rotina, setRotina] = useState<RotinaTeste | "">("");
  const [rotinaAberta, setRotinaAberta] = useState<RotinaTeste | null>(null);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Executar Rotina de Teste</h2>

      <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
        Qual Rotina deseja executar?
        <select
          value={rotina}
          onChange={(e) => setRotina(e.target.value as RotinaTeste)}
          className="rounded border border-gray-300 bg-transparent px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
        >
          <option value="" disabled>
            Selecione
          </option>
          {ROTINAS_TESTE.map((r) => (
            <option key={r} value={r}>
              {ROTINA_TESTE_LABELS[r]}
            </option>
          ))}
        </select>
      </label>

      <div>
        <button
          type="button"
          disabled={!rotina}
          onClick={() => rotina && setRotinaAberta(rotina)}
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Iniciar
        </button>
      </div>

      {rotinaAberta && (
        <RoteiroTesteModal
          rotina={rotinaAberta}
          onClose={() => setRotinaAberta(null)}
          onSalvo={() => {
            setRotinaAberta(null);
            setRotina("");
            onExecucaoSalva();
          }}
        />
      )}
    </div>
  );
}
