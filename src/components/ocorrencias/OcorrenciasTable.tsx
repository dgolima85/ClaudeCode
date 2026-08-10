"use client";

import { useState, useTransition } from "react";
import { formatarDataHoraBR } from "@/lib/dataHoraBR";
import NovaOcorrenciaForm from "./NovaOcorrenciaForm";
import StatusSelect from "./StatusSelect";
import EditableCell from "@/components/ui/EditableCell";
import OcorrenciaModal from "./OcorrenciaModal";
import NormalizacaoOcorrenciaModal from "./NormalizacaoOcorrenciaModal";
import type { StatusOcorrencia } from "@/lib/status";
import {
  criarOcorrencia,
  atualizarStatusOcorrencia,
  atualizarTituloOcorrencia,
  atualizarTicketOcorrencia,
  atualizarTipoDaOcorrencia,
} from "@/app/ocorrencias/actions";

export type OcorrenciaLinha = {
  id: string;
  status: StatusOcorrencia;
  titulo: string;
  ticket: string | null;
  createdAt: string;
  resolvidoEm: string | null;
  tipo: { id: string; nome: string };
  analista: { id: string; nome: string };
};

type Tipo = { id: string; nome: string };

type OcorrenciasTableProps = {
  ocorrencias: OcorrenciaLinha[];
  tipos: Tipo[];
  ocorrenciaAbertaId?: string;
};

function TipoCell({ ocorrenciaId, tipoId, tipos }: { ocorrenciaId: string; tipoId: string; tipos: Tipo[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={tipoId}
      disabled={pending}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        const novoTipoId = e.target.value;
        startTransition(async () => {
          await atualizarTipoDaOcorrencia(ocorrenciaId, novoTipoId);
        });
      }}
      className="rounded border border-gray-300 bg-transparent px-1.5 py-1 text-sm disabled:opacity-50"
    >
      {tipos.map((t) => (
        <option key={t.id} value={t.id}>
          {t.nome}
        </option>
      ))}
    </select>
  );
}

export default function OcorrenciasTable({ ocorrencias, tipos, ocorrenciaAbertaId }: OcorrenciasTableProps) {
  const [modalId, setModalId] = useState<string | null>(ocorrenciaAbertaId ?? null);
  const [normalizandoId, setNormalizandoId] = useState<string | null>(null);

  function abrirModal(id: string) {
    setModalId(id);
    const url = new URL(window.location.href);
    url.searchParams.set("ocorrencia", id);
    window.history.pushState({}, "", url);
  }

  function fecharModal() {
    setModalId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("ocorrencia");
    window.history.pushState({}, "", url);
  }

  return (
    <>
      <NovaOcorrenciaForm tipos={tipos} onCriar={criarOcorrencia} />

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Tipo</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Status</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Início</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Fim</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Analista</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Ocorrência</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Ticket</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ocorrencias.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50/70">
                <td className="px-3 py-2">
                  <TipoCell ocorrenciaId={o.id} tipoId={o.tipo.id} tipos={tipos} />
                </td>
                <td className="px-3 py-2">
                  <StatusSelect
                    value={o.status}
                    onChange={async (novo) => {
                      if (novo === "RESOLVIDO") {
                        setNormalizandoId(o.id);
                        return;
                      }
                      return atualizarStatusOcorrencia(o.id, novo);
                    }}
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-gray-600">
                  {formatarDataHoraBR(o.createdAt)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-gray-600">
                  {o.resolvidoEm ? formatarDataHoraBR(o.resolvidoEm) : "—"}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-gray-600">{o.analista.nome}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => abrirModal(o.id)}
                      title="Abrir detalhes da ocorrência"
                      className="shrink-0 text-gray-400 hover:text-blue-600"
                    >
                      ⤢
                    </button>
                    <EditableCell
                      value={o.titulo}
                      placeholder="Breve descrição da ocorrência"
                      onSave={(novo) => atualizarTituloOcorrencia(o.id, novo)}
                    />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <EditableCell
                    value={o.ticket ?? ""}
                    emptyLabel="Adicionar ticket"
                    placeholder="Número do ticket"
                    onSave={(novo) => atualizarTicketOcorrencia(o.id, novo)}
                  />
                </td>
              </tr>
            ))}
            {ocorrencias.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-gray-400">
                  Nenhuma ocorrência encontrada para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalId && <OcorrenciaModal ocorrenciaId={modalId} onClose={fecharModal} />}
      {normalizandoId && (
        <NormalizacaoOcorrenciaModal
          ocorrenciaId={normalizandoId}
          onClose={() => setNormalizandoId(null)}
          onNormalizado={() => setNormalizandoId(null)}
        />
      )}
    </>
  );
}
