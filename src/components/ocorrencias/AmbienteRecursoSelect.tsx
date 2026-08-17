"use client";

import MultiSelect from "@/components/ui/MultiSelect";

type Opcao = { id: string; nome: string; ativo: boolean };
type Recurso = Opcao & { ambienteInfraId: string };

type AmbienteRecursoSelectProps = {
  ambientes: Opcao[];
  recursos: Recurso[];
  ambienteInfraId: string | null;
  recursoIds: string[];
  disabled?: boolean;
  onChange: (novo: { ambienteInfraId: string | null; recursoIds: string[] }) => void;
};

function rotulo(item: Opcao) {
  return item.ativo ? item.nome : `${item.nome} (inativo)`;
}

export default function AmbienteRecursoSelect({
  ambientes,
  recursos,
  ambienteInfraId,
  recursoIds,
  disabled,
  onChange,
}: AmbienteRecursoSelectProps) {
  const recursosFiltrados = recursos.filter((r) => r.ambienteInfraId === ambienteInfraId);

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <select
        value={ambienteInfraId ?? ""}
        disabled={disabled}
        onChange={(e) => {
          const novoAmbienteId = e.target.value || null;
          onChange({ ambienteInfraId: novoAmbienteId, recursoIds: [] });
        }}
        className="flex-1 rounded border border-gray-300 bg-transparent px-2 py-1 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
      >
        <option value="">Sem ambiente</option>
        {ambientes.map((a) => (
          <option key={a.id} value={a.id}>
            {rotulo(a)}
          </option>
        ))}
      </select>
      {ambienteInfraId && (
        <div className="flex-1">
          <MultiSelect
            opcoes={recursosFiltrados}
            selecionados={recursoIds}
            disabled={disabled}
            placeholder="Selecione o(s) recurso(s)"
            onChange={(novosRecursoIds) => onChange({ ambienteInfraId, recursoIds: novosRecursoIds })}
          />
        </div>
      )}
    </div>
  );
}
