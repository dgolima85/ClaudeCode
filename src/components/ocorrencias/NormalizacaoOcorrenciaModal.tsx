"use client";

import { useEffect, useState, useTransition } from "react";
import Modal from "@/components/ui/Modal";
import { paraInputDataHoraBR } from "@/lib/dataHoraBR";
import { CRITICIDADES, CRITICIDADE_LABELS, type Criticidade } from "@/lib/criticidade";
import {
  buscarDadosNormalizacaoOcorrencia,
  normalizarOcorrencia,
  type DadosNormalizacaoOcorrencia,
} from "@/app/ocorrencias/actions";

type NormalizacaoOcorrenciaModalProps = {
  ocorrenciaId: string;
  onClose: () => void;
  onNormalizado: () => void;
};

export default function NormalizacaoOcorrenciaModal({
  ocorrenciaId,
  onClose,
  onNormalizado,
}: NormalizacaoOcorrenciaModalProps) {
  const [dados, setDados] = useState<DadosNormalizacaoOcorrencia | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [causa, setCausa] = useState("");
  const [solucao, setSolucao] = useState("");
  const [criticidade, setCriticidade] = useState<Criticidade | "">("");
  const [fim, setFim] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelado = false;
    buscarDadosNormalizacaoOcorrencia(ocorrenciaId).then((d) => {
      if (cancelado) return;
      setDados(d);
      setCriticidade(d?.criticidade ?? "");
      setFim(paraInputDataHoraBR(new Date()));
      setCarregando(false);
    });
    return () => {
      cancelado = true;
    };
  }, [ocorrenciaId]);

  function confirmar() {
    setErro(null);
    if (!fim) {
      setErro("Informe a data e hora de término (Fim).");
      return;
    }
    if (!causa.trim()) {
      setErro("Descreva a causa da ocorrência.");
      return;
    }
    if (!solucao.trim()) {
      setErro("Descreva a solução da ocorrência.");
      return;
    }
    if (!criticidade) {
      setErro("Selecione a criticidade da ocorrência.");
      return;
    }

    startTransition(async () => {
      const res = await normalizarOcorrencia(ocorrenciaId, {
        causa: causa.trim(),
        solucao: solucao.trim(),
        criticidade,
        fim,
      });
      if (res.error) {
        setErro(res.error);
        return;
      }
      onNormalizado();
    });
  }

  return (
    <Modal open onClose={onClose} title="Normalização da Ocorrência" zIndexClassName="z-[60]">
      {carregando || !dados ? (
        <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">Carregando...</p>
      ) : (
        <div className="flex flex-col gap-5">
          <section className="grid grid-cols-1 gap-3 rounded-md border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2 dark:border-gray-700 dark:bg-gray-800">
            <div>
              <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Origem</span>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{dados.afiliada}</p>
            </div>
            <div className="sm:col-span-2">
              <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Título</span>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{dados.titulo}</p>
            </div>
            <div>
              <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Parceria / Empresa
              </span>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{dados.parceriaEmpresa ?? "—"}</p>
            </div>
            <div>
              <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Ambiente</span>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{dados.ambiente ?? "—"}</p>
            </div>
            <div>
              <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Recurso</span>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{dados.recurso ?? "—"}</p>
            </div>
            <div>
              <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Serviço</span>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{dados.servico ?? "—"}</p>
            </div>
          </section>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Fim *</label>
              <input
                type="datetime-local"
                value={fim}
                disabled={pending}
                onChange={(e) => setFim(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 bg-transparent px-2 py-1.5 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Criticidade *
              </label>
              <select
                value={criticidade}
                disabled={pending}
                onChange={(e) => setCriticidade(e.target.value as Criticidade)}
                className="mt-1 w-full rounded border border-gray-300 bg-transparent px-2 py-1.5 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
              >
                <option value="" disabled>
                  Selecione
                </option>
                {CRITICIDADES.map((c) => (
                  <option key={c} value={c}>
                    {CRITICIDADE_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Causa *</label>
              <textarea
                autoFocus
                rows={2}
                disabled={pending}
                value={causa}
                onChange={(e) => setCausa(e.target.value)}
                placeholder="Descreva a causa da ocorrência..."
                className="mt-1 w-full resize-none rounded border border-gray-300 bg-transparent px-2 py-1.5 text-sm dark:border-gray-600 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Solução *</label>
              <textarea
                rows={2}
                disabled={pending}
                value={solucao}
                onChange={(e) => setSolucao(e.target.value)}
                placeholder="Descreva a solução aplicada..."
                className="mt-1 w-full resize-none rounded border border-gray-300 bg-transparent px-2 py-1.5 text-sm dark:border-gray-600 dark:text-gray-100"
              />
            </div>
          </div>

          {erro && <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>}

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">
            <button
              type="button"
              disabled={pending}
              onClick={onClose}
              className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={confirmar}
              className="rounded-md bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
