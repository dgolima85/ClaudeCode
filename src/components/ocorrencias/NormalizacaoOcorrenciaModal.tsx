"use client";

import { useEffect, useState, useTransition } from "react";
import Modal from "@/components/ui/Modal";
import { paraInputDataHoraBR } from "@/lib/dataHoraBR";
import {
  buscarDadosNormalizacaoOcorrencia,
  normalizarOcorrencia,
  type DadosNormalizacaoOcorrencia,
} from "@/app/ocorrencias/actions";

const OUTRA = "OUTRA";

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
  const [causaId, setCausaId] = useState("");
  const [causaOutra, setCausaOutra] = useState("");
  const [solucaoId, setSolucaoId] = useState("");
  const [solucaoOutra, setSolucaoOutra] = useState("");
  const [fim, setFim] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelado = false;
    buscarDadosNormalizacaoOcorrencia(ocorrenciaId).then((d) => {
      if (cancelado) return;
      setDados(d);
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
    if (!causaId) {
      setErro("Selecione a causa da ocorrência.");
      return;
    }
    if (causaId === OUTRA && !causaOutra.trim()) {
      setErro("Descreva a causa da ocorrência.");
      return;
    }
    if (!solucaoId) {
      setErro("Selecione a solução da ocorrência.");
      return;
    }
    if (solucaoId === OUTRA && !solucaoOutra.trim()) {
      setErro("Descreva a solução da ocorrência.");
      return;
    }

    startTransition(async () => {
      const res = await normalizarOcorrencia(ocorrenciaId, {
        causaId: causaId === OUTRA ? null : causaId,
        causaOutra: causaId === OUTRA ? causaOutra.trim() : "",
        solucaoId: solucaoId === OUTRA ? null : solucaoId,
        solucaoOutra: solucaoId === OUTRA ? solucaoOutra.trim() : "",
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
        <p className="py-6 text-center text-sm text-gray-400">Carregando...</p>
      ) : (
        <div className="flex flex-col gap-5">
          <section className="grid grid-cols-1 gap-3 rounded-md border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">
            <div>
              <span className="block text-xs font-medium uppercase text-gray-500">Tipo</span>
              <p className="mt-1 text-sm text-gray-700">{dados.tipo}</p>
            </div>
            <div className="sm:col-span-2">
              <span className="block text-xs font-medium uppercase text-gray-500">Ocorrência</span>
              <p className="mt-1 text-sm text-gray-700">{dados.titulo}</p>
            </div>
            <div>
              <span className="block text-xs font-medium uppercase text-gray-500">
                Parceria / Empresa
              </span>
              <p className="mt-1 text-sm text-gray-700">{dados.parceriaEmpresa ?? "—"}</p>
            </div>
            <div>
              <span className="block text-xs font-medium uppercase text-gray-500">Ambiente</span>
              <p className="mt-1 text-sm text-gray-700">{dados.ambiente ?? "—"}</p>
            </div>
            <div>
              <span className="block text-xs font-medium uppercase text-gray-500">Serviço</span>
              <p className="mt-1 text-sm text-gray-700">{dados.servico ?? "—"}</p>
            </div>
          </section>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium uppercase text-gray-500">Fim *</label>
              <input
                type="datetime-local"
                value={fim}
                disabled={pending}
                onChange={(e) => setFim(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase text-gray-500">Causa *</label>
              <select
                value={causaId}
                disabled={pending}
                onChange={(e) => setCausaId(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm disabled:opacity-50"
              >
                <option value="" disabled>
                  Selecione a causa
                </option>
                {dados.causas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
                <option value={OUTRA}>Outra</option>
              </select>
              {causaId === OUTRA && (
                <input
                  autoFocus
                  disabled={pending}
                  value={causaOutra}
                  onChange={(e) => setCausaOutra(e.target.value)}
                  placeholder="Descreva a causa"
                  className="mt-2 w-full rounded border border-gray-300 px-2 py-1.5 text-sm disabled:opacity-50"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-medium uppercase text-gray-500">Solução *</label>
              <select
                value={solucaoId}
                disabled={pending}
                onChange={(e) => setSolucaoId(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm disabled:opacity-50"
              >
                <option value="" disabled>
                  Selecione a solução
                </option>
                {dados.solucoes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
                  </option>
                ))}
                <option value={OUTRA}>Outra</option>
              </select>
              {solucaoId === OUTRA && (
                <input
                  disabled={pending}
                  value={solucaoOutra}
                  onChange={(e) => setSolucaoOutra(e.target.value)}
                  placeholder="Descreva a solução"
                  className="mt-2 w-full rounded border border-gray-300 px-2 py-1.5 text-sm disabled:opacity-50"
                />
              )}
            </div>
          </div>

          {erro && <p className="text-sm text-red-600">{erro}</p>}

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              disabled={pending}
              onClick={onClose}
              className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
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
