"use client";

import MultiSelect from "@/components/ui/MultiSelect";

type Opcao = { id: string; nome: string; ativo: boolean };
type Empresa = Opcao & { parceriaId: string };

type ParceriaEmpresaSelectProps = {
  parcerias: Opcao[];
  empresas: Empresa[];
  parceriaIds: string[];
  empresaIds: string[];
  disabled?: boolean;
  onChange: (novo: { parceriaIds: string[]; empresaIds: string[] }) => void;
};

export default function ParceriaEmpresaSelect({
  parcerias,
  empresas,
  parceriaIds,
  empresaIds,
  disabled,
  onChange,
}: ParceriaEmpresaSelectProps) {
  const empresasFiltradas = empresas.filter((e) => parceriaIds.includes(e.parceriaId));

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="flex-1">
        <MultiSelect
          opcoes={parcerias}
          selecionados={parceriaIds}
          disabled={disabled}
          placeholder="Sem parceria"
          onChange={(novasParceriaIds) => {
            const idsValidos = new Set(
              empresas.filter((e) => novasParceriaIds.includes(e.parceriaId)).map((e) => e.id),
            );
            onChange({
              parceriaIds: novasParceriaIds,
              empresaIds: empresaIds.filter((id) => idsValidos.has(id)),
            });
          }}
        />
      </div>
      {parceriaIds.length > 0 && (
        <div className="flex-1">
          <MultiSelect
            opcoes={empresasFiltradas}
            selecionados={empresaIds}
            disabled={disabled}
            placeholder="Selecione a empresa"
            onChange={(novasEmpresaIds) => onChange({ parceriaIds, empresaIds: novasEmpresaIds })}
          />
        </div>
      )}
    </div>
  );
}
