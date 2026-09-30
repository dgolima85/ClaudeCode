"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { formatarDataHoraBR } from "@/lib/dataHoraBR";
import { formatarTamanhoArquivo } from "@/lib/evidencias";
import { ROTINA_TESTE_LABELS } from "@/lib/roteiroTeste/rotinas";
import { RESULTADO_TESTE_LABELS, RESULTADO_TESTE_DOT_COLOR } from "@/lib/roteiroTeste/resultado";
import { buscarExecucaoRoteiroTeste, type ExecucaoRoteiroTesteDetalhe } from "@/app/roteiro-testes/actions";

type ExecucaoDetalheModalProps = {
  execucaoId: string;
  onClose: () => void;
};

export default function ExecucaoDetalheModal({ execucaoId, onClose }: ExecucaoDetalheModalProps) {
  const [detalhe, setDetalhe] = useState<ExecucaoRoteiroTesteDetalhe | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    buscarExecucaoRoteiroTeste(execucaoId).then((d) => {
      if (cancelado) return;
      setDetalhe(d);
      setCarregando(false);
    });
    return () => {
      cancelado = true;
    };
  }, [execucaoId]);

  return (
    <Modal
      open
      onClose={onClose}
      title={detalhe ? `${ROTINA_TESTE_LABELS[detalhe.rotina]} — ${detalhe.brand}` : "Execução"}
      maxWidthClassName="max-w-3xl"
    >
      {carregando && <p className="text-sm text-gray-500 dark:text-gray-400">Carregando...</p>}

      {!carregando && !detalhe && (
        <p className="text-sm text-red-600 dark:text-red-400">Execução não encontrada.</p>
      )}

      {detalhe && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm sm:grid-cols-4 dark:border-gray-700 dark:bg-gray-800">
            <div>
              <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Versão</span>
              <span className="text-gray-700 dark:text-gray-300">{detalhe.versao}</span>
            </div>
            <div>
              <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Analista</span>
              <span className="text-gray-700 dark:text-gray-300">{detalhe.analista}</span>
            </div>
            <div className="col-span-2">
              <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Data</span>
              <span className="text-gray-700 dark:text-gray-300">{formatarDataHoraBR(detalhe.createdAt)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            {detalhe.itens.map((item) => (
              <div
                key={item.codigo}
                className="flex items-start justify-between gap-3 border-b border-gray-100 pb-1.5 last:border-0 dark:border-gray-800"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-[11px] font-medium text-gray-400 dark:text-gray-500">
                    {item.codigo}
                  </span>
                  {item.descricao && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">{item.descricao}</p>
                  )}
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <span className={`h-2 w-2 rounded-full ${RESULTADO_TESTE_DOT_COLOR[item.resultado]}`} />
                  {RESULTADO_TESTE_LABELS[item.resultado]}
                </span>
              </div>
            ))}
          </div>

          {detalhe.anotacao && (
            <div>
              <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Anotação
              </span>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{detalhe.anotacao}</p>
            </div>
          )}

          <div>
            <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Evidências {detalhe.evidencias.length > 0 && `(${detalhe.evidencias.length})`}
            </span>
            {detalhe.evidencias.length === 0 ? (
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">Nenhuma evidência anexada.</p>
            ) : (
              <ul className="mt-1 flex flex-col gap-1">
                {detalhe.evidencias.map((ev) => (
                  <li key={ev.id} className="flex items-center gap-2 text-sm">
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={ev.nomeArquivo}
                      className="min-w-0 flex-1 truncate text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {ev.nomeArquivo}
                    </a>
                    <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                      {formatarTamanhoArquivo(ev.tamanhoBytes)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
