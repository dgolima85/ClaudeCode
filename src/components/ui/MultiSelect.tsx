"use client";

import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react";

type Opcao = { id: string; nome: string; ativo?: boolean };

type MultiSelectProps = {
  opcoes: Opcao[];
  selecionados: string[];
  onChange: (novos: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
};

function rotulo(item: Opcao) {
  return item.ativo === false ? `${item.nome} (inativo)` : item.nome;
}

export default function MultiSelect({
  opcoes,
  selecionados,
  onChange,
  disabled,
  placeholder = "Nenhum",
}: MultiSelectProps) {
  const textoBotao =
    opcoes
      .filter((o) => selecionados.includes(o.id))
      .map((o) => o.nome)
      .join(", ") || placeholder;

  return (
    <Listbox value={selecionados} onChange={onChange} multiple disabled={disabled}>
      <div className="relative">
        <ListboxButton className="w-full truncate rounded border border-gray-300 px-2 py-1 text-left text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
          {textoBotao}
        </ListboxButton>
        <ListboxOptions
          anchor="bottom start"
          className="z-50 mt-1 max-h-56 w-[var(--button-width)] overflow-auto rounded border border-gray-200 bg-white text-sm shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        >
          {opcoes.length === 0 && <p className="px-2 py-1.5 text-gray-400 dark:text-gray-500">Nenhuma opção cadastrada</p>}
          {opcoes.map((o) => (
            <ListboxOption
              key={o.id}
              value={o.id}
              className="flex cursor-pointer items-center gap-2 px-2 py-1.5 data-focus:bg-blue-50 dark:data-focus:bg-blue-900/40"
            >
              {({ selected }) => (
                <>
                  <input type="checkbox" checked={selected} readOnly className="pointer-events-none" />
                  <span>{rotulo(o)}</span>
                </>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
