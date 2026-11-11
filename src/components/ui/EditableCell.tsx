"use client";

import { useState, useTransition } from "react";

type EditableCellProps = {
  value: string;
  placeholder?: string;
  emptyLabel?: string;
  widthClassName?: string;
  onSave: (novoValor: string) => Promise<{ error?: string } | void>;
};

export default function EditableCell({
  value,
  placeholder,
  emptyLabel = "—",
  widthClassName = "max-w-[16rem]",
  onSave,
}: EditableCellProps) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(value);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function salvar() {
    setErro(null);
    startTransition(async () => {
      const res = await onSave(valor);
      if (res && "error" in res && res.error) {
        setErro(res.error);
        return;
      }
      setEditando(false);
    });
  }

  function cancelar() {
    setValor(value);
    setErro(null);
    setEditando(false);
  }

  if (!editando) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setValor(value);
          setEditando(true);
        }}
        title={value || "Clique para editar"}
        className={`block w-full truncate text-left hover:underline ${widthClassName}`}
      >
        {value ? value : <span className="text-gray-400 dark:text-gray-500">{emptyLabel}</span>}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
      <input
        autoFocus
        value={valor}
        placeholder={placeholder}
        disabled={pending}
        onChange={(e) => setValor(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") salvar();
          if (e.key === "Escape") cancelar();
        }}
        className="w-full rounded border border-blue-400 bg-transparent px-2 py-1 text-sm dark:border-blue-500 dark:text-gray-100"
      />
      <div className="flex gap-2 text-xs">
        <button type="button" disabled={pending} onClick={salvar} className="text-blue-600 hover:underline dark:text-blue-400">
          Salvar
        </button>
        <button type="button" disabled={pending} onClick={cancelar} className="text-gray-500 hover:underline dark:text-gray-400">
          Cancelar
        </button>
      </div>
      {erro && <span className="text-xs text-red-600 dark:text-red-400">{erro}</span>}
    </div>
  );
}
