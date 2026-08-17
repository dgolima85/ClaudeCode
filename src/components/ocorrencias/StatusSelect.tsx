"use client";

import { useTransition } from "react";
import { STATUS_OCORRENCIA, STATUS_LABELS, STATUS_DOT_COLOR, type StatusOcorrencia } from "@/lib/status";

type StatusSelectProps = {
  value: StatusOcorrencia;
  onChange: (novoStatus: StatusOcorrencia) => Promise<{ error?: string } | void>;
};

export default function StatusSelect({ value, onChange }: StatusSelectProps) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT_COLOR[value]}`}
        aria-hidden
      />
      <select
        value={value}
        disabled={pending}
        onChange={(e) => {
          const novoStatus = e.target.value as StatusOcorrencia;
          startTransition(async () => {
            await onChange(novoStatus);
          });
        }}
        className="rounded border border-gray-300 bg-transparent px-1.5 py-1 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
      >
        {STATUS_OCORRENCIA.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>
    </div>
  );
}
