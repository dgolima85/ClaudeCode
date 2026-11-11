"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { formatarDataHoraBR } from "@/lib/dataHoraBR";
import { listarHistoricoDesvioOperacional } from "@/app/desvio-operacional/actions";
import type { DesvioOperacionalRegistroInfo } from "@/lib/desvioOperacional";

type HistoricoDesvioModalProps = {
  onClose: () => void;
};

export default function HistoricoDesvioModal({ onClose }: HistoricoDesvioModalProps) {
  const [registros, setRegistros] = useState<DesvioOperacionalRegistroInfo[] | null>(null);

  useEffect(() => {
    let cancelado = false;
    listarHistoricoDesvioOperacional().then((r) => {
      if (!cancelado) setRegistros(r);
    });
    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <Modal open onClose={onClose} title="Histórico de Desvios Operacionais" maxWidthClassName="max-w-lg">
      {registros === null ? (
        <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">Carregando...</p>
      ) : registros.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">Nenhum desvio registrado ainda.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
          {registros.map((r) => (
            <li key={r.id} className="flex flex-col gap-0.5 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatarDataHoraBR(r.ocorridoEm)}
                </span>
                {r.registradoPor && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">{r.registradoPor}</span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{r.motivo}</p>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
