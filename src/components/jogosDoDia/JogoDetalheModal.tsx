"use client";

import { useEffect, useState, useTransition } from "react";
import Modal from "@/components/ui/Modal";
import type { JogoDoDiaLinha } from "@/lib/jogosDoDia/consulta";
import {
  buscarAcompanhamentoJogo,
  salvarAcompanhamentoCanal,
  type AcompanhamentoCanal,
} from "@/app/jogos-do-dia/actions";

type JogoDetalheModalProps = {
  jogo: JogoDoDiaLinha;
  onClose: () => void;
};

const CANAL_PADRAO: Omit<AcompanhamentoCanal, "canal"> = {
  foraDoPortfolio: false,
  testadoValidado: false,
  somEImagem: "",
  delayClaro: "",
  relatorioPosJogo: "",
  atualizadoEm: "",
};

type CanalSecaoProps = {
  jogo: JogoDoDiaLinha;
  canal: string;
  estadoInicial: AcompanhamentoCanal;
};

function CanalSecao({ jogo, canal, estadoInicial }: CanalSecaoProps) {
  const [estado, setEstado] = useState(estadoInicial);
  const [somEImagemRascunho, setSomEImagemRascunho] = useState(estadoInicial.somEImagem);
  const [delayClaroRascunho, setDelayClaroRascunho] = useState(estadoInicial.delayClaro);
  const [relatorioRascunho, setRelatorioRascunho] = useState(estadoInicial.relatorioPosJogo);
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  const contexto = {
    dataBR: jogo.dataBR,
    mandante: jogo.mandante,
    visitante: jogo.visitante,
    campeonato: jogo.campeonato,
  };

  function salvar(patch: Partial<Omit<AcompanhamentoCanal, "canal" | "atualizadoEm">>) {
    setErro(null);
    setEstado((atual) => ({ ...atual, ...patch }));
    startTransition(async () => {
      const res = await salvarAcompanhamentoCanal(jogo.sourceId, canal, contexto, patch);
      if (res.error) setErro(res.error);
    });
  }

  const desabilitarCamposOperacionais = estado.foraDoPortfolio;

  return (
    <div className="rounded-md border border-gray-200 p-3 dark:border-gray-700">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{canal}</h4>
        <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <input
            type="checkbox"
            checked={estado.foraDoPortfolio}
            disabled={pending}
            onChange={(e) => salvar({ foraDoPortfolio: e.target.checked })}
            className="h-3.5 w-3.5"
          />
          N/A — canal fora do nosso portfólio
        </label>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={estado.testadoValidado}
            disabled={pending || desabilitarCamposOperacionais}
            onChange={(e) => salvar({ testadoValidado: e.target.checked })}
            className="h-4 w-4"
          />
          Canal testado e validado 30min antes
        </label>

        <div>
          <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
            Som e Imagem
          </span>
          <textarea
            value={somEImagemRascunho}
            disabled={pending || desabilitarCamposOperacionais}
            onChange={(e) => setSomEImagemRascunho(e.target.value)}
            onBlur={() => {
              if (somEImagemRascunho !== estado.somEImagem) salvar({ somEImagem: somEImagemRascunho });
            }}
            rows={2}
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        <div>
          <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
            Delay em relação à Claro
          </span>
          <input
            type="text"
            value={delayClaroRascunho}
            disabled={pending || desabilitarCamposOperacionais}
            onChange={(e) => setDelayClaroRascunho(e.target.value)}
            onBlur={() => {
              if (delayClaroRascunho !== estado.delayClaro) salvar({ delayClaro: delayClaroRascunho });
            }}
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        <div>
          <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
            Relatório pós jogo
          </span>
          <textarea
            value={relatorioRascunho}
            disabled={pending || desabilitarCamposOperacionais}
            onChange={(e) => setRelatorioRascunho(e.target.value)}
            onBlur={() => {
              if (relatorioRascunho !== estado.relatorioPosJogo) salvar({ relatorioPosJogo: relatorioRascunho });
            }}
            rows={2}
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
      </div>

      {erro && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{erro}</p>}
    </div>
  );
}

export default function JogoDetalheModal({ jogo, onClose }: JogoDetalheModalProps) {
  const [carregando, setCarregando] = useState(true);
  const [porCanal, setPorCanal] = useState<Record<string, AcompanhamentoCanal>>({});

  const canais = jogo.canais.length > 0 ? jogo.canais : ["Geral"];

  useEffect(() => {
    let cancelado = false;
    buscarAcompanhamentoJogo(jogo.sourceId).then((linhas) => {
      if (cancelado) return;
      const mapa: Record<string, AcompanhamentoCanal> = {};
      for (const linha of linhas) mapa[linha.canal] = linha;
      setPorCanal(mapa);
      setCarregando(false);
    });
    return () => {
      cancelado = true;
    };
  }, [jogo.sourceId]);

  return (
    <Modal open onClose={onClose} title={`${jogo.mandante} x ${jogo.visitante}`}>
      <div className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        {jogo.campeonato} — {jogo.horario}
        {jogo.estadio && ` — ${jogo.estadio}`}
        {jogo.cidade && `, ${jogo.cidade}`}
      </div>

      {carregando ? (
        <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">Carregando...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {canais.map((canal) => (
            <CanalSecao
              key={canal}
              jogo={jogo}
              canal={canal}
              estadoInicial={porCanal[canal] ?? { ...CANAL_PADRAO, canal }}
            />
          ))}
        </div>
      )}
    </Modal>
  );
}
