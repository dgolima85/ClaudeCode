"use client";

type Opcao = { id: string; nome: string; ativo: boolean };
type Recurso = Opcao & { ambienteInfraId: string };

type AmbienteRecursoSelectProps = {
  ambientes: Opcao[];
  recursos: Recurso[];
  ambienteInfraId: string | null;
  recursoId: string | null;
  disabled?: boolean;
  onChange: (novo: { ambienteInfraId: string | null; recursoId: string | null }) => void;
};

function rotulo(item: Opcao) {
  return item.ativo ? item.nome : `${item.nome} (inativo)`;
}

export default function AmbienteRecursoSelect({
  ambientes,
  recursos,
  ambienteInfraId,
  recursoId,
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
          onChange({ ambienteInfraId: novoAmbienteId, recursoId: null });
        }}
        className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm disabled:opacity-50"
      >
        <option value="">Sem ambiente</option>
        {ambientes.map((a) => (
          <option key={a.id} value={a.id}>
            {rotulo(a)}
          </option>
        ))}
      </select>
      {ambienteInfraId && (
        <select
          value={recursoId ?? ""}
          disabled={disabled}
          onChange={(e) => onChange({ ambienteInfraId, recursoId: e.target.value || null })}
          className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm disabled:opacity-50"
        >
          <option value="">Selecione o recurso</option>
          {recursosFiltrados.map((recurso) => (
            <option key={recurso.id} value={recurso.id}>
              {rotulo(recurso)}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
