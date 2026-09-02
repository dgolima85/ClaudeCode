"use client";

import { useEffect, useState } from "react";
import { paraInputDataHoraBR, deInputDataHoraBR } from "@/lib/dataHoraBR";
import Modal from "@/components/ui/Modal";
import EditableCell from "@/components/ui/EditableCell";
import MultiSelect from "@/components/ui/MultiSelect";
import StatusSelect from "./StatusSelect";
import ParceriaEmpresaSelect from "./ParceriaEmpresaSelect";
import AmbienteRecursoSelect from "./AmbienteRecursoSelect";
import EventosTable from "./EventosTable";
import NormalizacaoOcorrenciaModal from "./NormalizacaoOcorrenciaModal";
import {
  buscarOcorrenciaDetalhe,
  buscarListasReferenciaOcorrencia,
  atualizarStatusOcorrencia,
  atualizarTituloOcorrencia,
  atualizarTicketOcorrencia,
  atualizarTipoDaOcorrencia,
  atualizarDetalhesOcorrencia,
  atualizarInicioOcorrencia,
  atualizarFimOcorrencia,
  type OcorrenciaDetalhe,
  type ItemReferencia,
} from "@/app/ocorrencias/actions";

type Empresa = ItemReferencia & { parceriaId: string };
type Recurso = ItemReferencia & { ambienteInfraId: string };

type Listas = {
  tipos: ItemReferencia[];
  parcerias: ItemReferencia[];
  empresas: Empresa[];
  servicos: ItemReferencia[];
  sistemasOperacionais: ItemReferencia[];
  ambientesInfra: ItemReferencia[];
  recursos: Recurso[];
  cdns: ItemReferencia[];
  plataformas: ItemReferencia[];
  canais: ItemReferencia[];
};

type CamposDetalhe = Pick<
  OcorrenciaDetalhe,
  | "parceriaIds"
  | "empresaIds"
  | "servicoIds"
  | "sistemaOperacionalIds"
  | "ambienteInfraId"
  | "recursoIds"
  | "cdnId"
  | "plataformaIds"
  | "canalIds"
>;

type OcorrenciaModalProps = {
  ocorrenciaId: string;
  onClose: () => void;
};

function rotulo(item: ItemReferencia) {
  return item.ativo ? item.nome : `${item.nome} (inativo)`;
}

export default function OcorrenciaModal({ ocorrenciaId, onClose }: OcorrenciaModalProps) {
  const [detalhe, setDetalhe] = useState<OcorrenciaDetalhe | null>(null);
  const [listas, setListas] = useState<Listas | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [normalizando, setNormalizando] = useState(false);
  // Cada campo/grupo controla sua própria pendência (chave = nome do campo),
  // em vez de um único `pending` compartilhado que "esmaecia" o formulário
  // inteiro sempre que qualquer campo estava salvando.
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());

  function estaPendente(...chaves: string[]) {
    return chaves.some((c) => pendingKeys.has(c));
  }

  async function comPendencia<T>(chaves: string[], fn: () => Promise<T>): Promise<T> {
    setPendingKeys((atual) => {
      const novo = new Set(atual);
      chaves.forEach((c) => novo.add(c));
      return novo;
    });
    try {
      return await fn();
    } finally {
      setPendingKeys((atual) => {
        const novo = new Set(atual);
        chaves.forEach((c) => novo.delete(c));
        return novo;
      });
    }
  }

  useEffect(() => {
    let cancelado = false;
    Promise.all([buscarOcorrenciaDetalhe(ocorrenciaId), buscarListasReferenciaOcorrencia()]).then(
      ([d, l]) => {
        if (cancelado) return;
        setDetalhe(d);
        setListas(l);
        setCarregando(false);
      },
    );
    return () => {
      cancelado = true;
    };
  }, [ocorrenciaId]);

  function salvarCamposDetalhe(patch: Partial<CamposDetalhe>) {
    if (!detalhe) return;
    const id = detalhe.id;
    const chaves = Object.keys(patch);
    setDetalhe({ ...detalhe, ...patch });
    comPendencia(chaves, () => atualizarDetalhesOcorrencia(id, patch));
  }

  return (
    <Modal open onClose={onClose} title={detalhe?.titulo ?? "Título"}>
      {carregando || !detalhe || !listas ? (
        <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">Carregando...</p>
      ) : (
        <div className="flex flex-col gap-5">
          <section className="grid grid-cols-1 gap-4 rounded-md border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2 dark:border-gray-700 dark:bg-gray-800">
            <div>
              <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Origem</span>
              <select
                value={detalhe.tipoId}
                disabled={estaPendente("tipoId")}
                onChange={(e) => {
                  const novoTipoId = e.target.value;
                  setDetalhe({ ...detalhe, tipoId: novoTipoId });
                  comPendencia(["tipoId"], () => atualizarTipoDaOcorrencia(detalhe.id, novoTipoId));
                }}
                className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
              >
                {listas.tipos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {rotulo(t)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Status</span>
              <div className="mt-1">
                <StatusSelect
                  value={detalhe.status}
                  onChange={async (novo) => {
                    if (novo === "RESOLVIDO") {
                      setNormalizando(true);
                      return;
                    }
                    setDetalhe({
                      ...detalhe,
                      status: novo,
                      resolvidoEm: null,
                      causa: null,
                      solucao: null,
                    });
                    return atualizarStatusOcorrencia(detalhe.id, novo);
                  }}
                />
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Analista</span>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{detalhe.analista.nome}</p>
            </div>

            <div>
              <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Início</span>
              <input
                type="datetime-local"
                value={paraInputDataHoraBR(detalhe.createdAt)}
                disabled={estaPendente("createdAt")}
                onChange={(e) => {
                  const valor = e.target.value;
                  if (!valor) return;
                  const novaData = deInputDataHoraBR(valor).toISOString();
                  setDetalhe({ ...detalhe, createdAt: novaData });
                  comPendencia(["createdAt"], () => atualizarInicioOcorrencia(detalhe.id, valor));
                }}
                className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
              />
            </div>

            <div>
              <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Fim</span>
              {detalhe.resolvidoEm ? (
                <input
                  type="datetime-local"
                  value={paraInputDataHoraBR(detalhe.resolvidoEm)}
                  disabled={estaPendente("resolvidoEm")}
                  onChange={(e) => {
                    const valor = e.target.value;
                    if (!valor) return;
                    const novaData = deInputDataHoraBR(valor).toISOString();
                    setDetalhe({ ...detalhe, resolvidoEm: novaData });
                    comPendencia(["resolvidoEm"], () => atualizarFimOcorrencia(detalhe.id, valor));
                  }}
                  className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">—</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Ambiente / Recurso</span>
              <div className="mt-1">
                <AmbienteRecursoSelect
                  ambientes={listas.ambientesInfra}
                  recursos={listas.recursos}
                  ambienteInfraId={detalhe.ambienteInfraId}
                  recursoIds={detalhe.recursoIds}
                  disabled={estaPendente("ambienteInfraId", "recursoIds")}
                  onChange={(novo) => salvarCamposDetalhe(novo)}
                />
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">CDN</span>
              <select
                value={detalhe.cdnId ?? ""}
                disabled={estaPendente("cdnId")}
                onChange={(e) => salvarCamposDetalhe({ cdnId: e.target.value || null })}
                className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
              >
                <option value="">Nenhum</option>
                {listas.cdns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {rotulo(c)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Plataforma</span>
              <div className="mt-1">
                <MultiSelect
                  opcoes={listas.plataformas}
                  selecionados={detalhe.plataformaIds}
                  disabled={estaPendente("plataformaIds")}
                  onChange={(plataformaIds) => salvarCamposDetalhe({ plataformaIds })}
                />
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Canal</span>
              <div className="mt-1">
                <MultiSelect
                  opcoes={listas.canais}
                  selecionados={detalhe.canalIds}
                  disabled={estaPendente("canalIds")}
                  onChange={(canalIds) => salvarCamposDetalhe({ canalIds })}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Título</span>
              <div className="mt-1">
                <EditableCell
                  value={detalhe.titulo}
                  onSave={async (novo) => {
                    const res = await atualizarTituloOcorrencia(detalhe.id, novo);
                    if (!res.error) setDetalhe({ ...detalhe, titulo: novo });
                    return res;
                  }}
                />
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Ticket</span>
              <div className="mt-1">
                <EditableCell
                  value={detalhe.ticket ?? ""}
                  emptyLabel="Adicionar ticket"
                  onSave={async (novo) => {
                    const res = await atualizarTicketOcorrencia(detalhe.id, novo);
                    if (!res.error) setDetalhe({ ...detalhe, ticket: novo || null });
                    return res;
                  }}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Parceria / Empresa
              </span>
              <div className="mt-1">
                <ParceriaEmpresaSelect
                  parcerias={listas.parcerias}
                  empresas={listas.empresas}
                  parceriaIds={detalhe.parceriaIds}
                  empresaIds={detalhe.empresaIds}
                  disabled={estaPendente("parceriaIds", "empresaIds")}
                  onChange={(novo) => salvarCamposDetalhe(novo)}
                />
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Serviço</span>
              <div className="mt-1">
                <MultiSelect
                  opcoes={listas.servicos}
                  selecionados={detalhe.servicoIds}
                  disabled={estaPendente("servicoIds")}
                  onChange={(servicoIds) => salvarCamposDetalhe({ servicoIds })}
                />
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Devices</span>
              <div className="mt-1">
                <MultiSelect
                  opcoes={listas.sistemasOperacionais}
                  selecionados={detalhe.sistemaOperacionalIds}
                  disabled={estaPendente("sistemaOperacionalIds")}
                  onChange={(sistemaOperacionalIds) => salvarCamposDetalhe({ sistemaOperacionalIds })}
                />
              </div>
            </div>

            {detalhe.status === "RESOLVIDO" && (
              <>
                <div>
                  <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Causa</span>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{detalhe.causa ?? "—"}</p>
                </div>
                <div>
                  <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Solução</span>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{detalhe.solucao ?? "—"}</p>
                </div>
              </>
            )}
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Eventos ({detalhe.eventos.length})
            </h3>
            <EventosTable
              ocorrenciaId={detalhe.id}
              eventos={detalhe.eventos}
              onNovoEvento={(evento) =>
                setDetalhe((atual) => (atual ? { ...atual, eventos: [evento, ...atual.eventos] } : atual))
              }
            />
          </section>
        </div>
      )}

      {normalizando && detalhe && (
        <NormalizacaoOcorrenciaModal
          ocorrenciaId={detalhe.id}
          onClose={() => setNormalizando(false)}
          onNormalizado={async () => {
            setNormalizando(false);
            const atualizado = await buscarOcorrenciaDetalhe(detalhe.id);
            if (atualizado) setDetalhe(atualizado);
          }}
        />
      )}
    </Modal>
  );
}
