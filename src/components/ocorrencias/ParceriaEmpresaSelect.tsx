"use client";

type Opcao = { id: string; nome: string; ativo: boolean };
type Empresa = Opcao & { parceriaId: string };

type ParceriaEmpresaSelectProps = {
  parcerias: Opcao[];
  empresas: Empresa[];
  parceriaId: string | null;
  empresaId: string | null;
  disabled?: boolean;
  onChange: (novo: { parceriaId: string | null; empresaId: string | null }) => void;
};

function rotulo(item: Opcao) {
  return item.ativo ? item.nome : `${item.nome} (inativo)`;
}

export default function ParceriaEmpresaSelect({
  parcerias,
  empresas,
  parceriaId,
  empresaId,
  disabled,
  onChange,
}: ParceriaEmpresaSelectProps) {
  const empresasFiltradas = empresas.filter((e) => e.parceriaId === parceriaId);

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <select
        value={parceriaId ?? ""}
        disabled={disabled}
        onChange={(e) => {
          const novaParceriaId = e.target.value || null;
          onChange({ parceriaId: novaParceriaId, empresaId: null });
        }}
        className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm disabled:opacity-50"
      >
        <option value="">Sem parceria</option>
        {parcerias.map((p) => (
          <option key={p.id} value={p.id}>
            {rotulo(p)}
          </option>
        ))}
      </select>
      {parceriaId && (
        <select
          value={empresaId ?? ""}
          disabled={disabled}
          onChange={(e) => onChange({ parceriaId, empresaId: e.target.value || null })}
          className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm disabled:opacity-50"
        >
          <option value="">Selecione a empresa</option>
          {empresasFiltradas.map((empresa) => (
            <option key={empresa.id} value={empresa.id}>
              {rotulo(empresa)}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
