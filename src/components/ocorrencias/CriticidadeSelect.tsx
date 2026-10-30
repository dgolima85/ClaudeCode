"use client";

import { useTransition } from "react";
import { CRITICIDADES, CRITICIDADE_LABELS, CRITICIDADE_TEXT_COLOR, type Criticidade } from "@/lib/criticidade";
import { IconeCriticidade } from "./icones";

type CriticidadeSelectProps = {
  value: Criticidade | null;
  onChange: (novaCriticidade: string) => Promise<{ error?: string } | void>;
};

export default function CriticidadeSelect({ value, onChange }: CriticidadeSelectProps) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <IconeCriticidade
        className={`h-3.5 w-3.5 shrink-0 ${value ? CRITICIDADE_TEXT_COLOR[value] : "text-gray-300 dark:text-gray-600"}`}
      />
      <select
        value={value ?? ""}
        disabled={pending}
        onChange={(e) => {
          const nova = e.target.value;
          startTransition(async () => {
            await onChange(nova);
          });
        }}
        className="rounded border border-gray-300 bg-transparent px-1.5 py-1 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
      >
        <option value="">—</option>
        {CRITICIDADES.map((c) => (
          <option key={c} value={c}>
            {CRITICIDADE_LABELS[c]}
          </option>
        ))}
      </select>
    </div>
  );
}
