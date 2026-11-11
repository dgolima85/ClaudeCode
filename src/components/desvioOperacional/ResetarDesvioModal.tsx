"use client";

import { useState, useTransition } from "react";
import Modal from "@/components/ui/Modal";
import { paraInputDataHoraBR } from "@/lib/dataHoraBR";
import { resetarDesvioOperacional } from "@/app/desvio-operacional/actions";

type ResetarDesvioModalProps = {
  onClose: () => void;
};

export default function ResetarDesvioModal({ onClose }: ResetarDesvioModalProps) {
  const [ocorridoEm, setOcorridoEm] = useState(() => paraInputDataHoraBR(new Date()));
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirmar() {
    setErro(null);
    startTransition(async () => {
      const res = await resetarDesvioOperacional(ocorridoEm, motivo);
      if (res.error) {
        setErro(res.error);
        return;
      }
      onClose();
    });
  }

  return (
    <Modal open onClose={onClose} title="Resetar indicador de Desvio Operacional" maxWidthClassName="max-w-md">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Deseja realmente resetar o indicador de Desvio Operacional?
        </p>

        <label className="flex flex-col gap-1 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
          Data e hora do desvio
          <input
            type="datetime-local"
            value={ocorridoEm}
            disabled={pending}
            onChange={(e) => setOcorridoEm(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-sm font-normal normal-case text-gray-900 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
          Motivo do desvio
          <textarea
            value={motivo}
            disabled={pending}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            placeholder="Descreva o que aconteceu"
            className="rounded border border-gray-300 px-2 py-1 text-sm font-normal normal-case text-gray-900 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </label>

        {erro && <p className="text-xs text-red-600 dark:text-red-400">{erro}</p>}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:underline disabled:opacity-50 dark:text-gray-400"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={confirmar}
            className="rounded-md bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            Confirmar reset
          </button>
        </div>
      </div>
    </Modal>
  );
}
