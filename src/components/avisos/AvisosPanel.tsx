"use client";

import { useState, useTransition } from "react";
import { formatarDataHoraBR, paraInputDataHoraBR, deInputDataHoraBR } from "@/lib/dataHoraBR";
import { MODELOS_AVISO, MODELO_AVISO_LABELS, type ModeloAviso } from "@/lib/aviso";
import { criarAviso, excluirAviso } from "@/app/avisos/actions";
import { IconeAtivo, IconeInformativo, IconeAcompanhamento, IconeAtuacao } from "./icones";

export type AvisoLinha = {
  id: string;
  modelo: ModeloAviso;
  descricao: string;
  expiraEm: string;
};

type AvisosPanelProps = {
  avisos: AvisoLinha[];
};

const ICONE_MODELO: Record<ModeloAviso, typeof IconeInformativo> = {
  INFORMATIVO: IconeInformativo,
  ACOMPANHAMENTO: IconeAcompanhamento,
  ATUACAO: IconeAtuacao,
};

function CampoIcone({
  Icone,
  label,
  className,
}: {
  Icone: typeof IconeAtivo;
  label: string;
  className: string;
}) {
  return (
    <div className={`flex shrink-0 flex-col items-center gap-1 ${className}`}>
      <Icone className="h-5 w-5" />
      <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
    </div>
  );
}

function AvisoCard({ aviso, onExcluir }: { aviso: AvisoLinha; onExcluir: (id: string) => void }) {
  const [pending, startTransition] = useTransition();
  const IconeModelo = ICONE_MODELO[aviso.modelo];

  return (
    <div className="flex items-start gap-3 rounded-md border border-gray-200 p-2.5">
      <CampoIcone Icone={IconeAtivo} label="Ativo" className="text-green-600" />
      <CampoIcone Icone={IconeModelo} label={MODELO_AVISO_LABELS[aviso.modelo]} className="text-blue-600" />
      <div className="min-w-0 flex-1">
        <p className="whitespace-pre-wrap break-words text-sm text-gray-700">{aviso.descricao}</p>
        <p className="mt-1 text-xs text-gray-400">Expira em {formatarDataHoraBR(aviso.expiraEm)}</p>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await excluirAviso(aviso.id);
            onExcluir(aviso.id);
          })
        }
        title="Excluir aviso"
        className="shrink-0 text-gray-400 hover:text-red-600 disabled:opacity-50"
      >
        ✕
      </button>
    </div>
  );
}

export default function AvisosPanel({ avisos: avisosIniciais }: AvisosPanelProps) {
  const [avisos, setAvisos] = useState(avisosIniciais);
  const [criando, setCriando] = useState(false);
  const [modelo, setModelo] = useState<ModeloAviso>("INFORMATIVO");
  const [descricao, setDescricao] = useState("");
  const [expiraEm, setExpiraEm] = useState(() => paraInputDataHoraBR(new Date()));
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function abrirForm() {
    setCriando(true);
    setErro(null);
    setModelo("INFORMATIVO");
    setDescricao("");
    setExpiraEm(paraInputDataHoraBR(new Date()));
  }

  function salvar() {
    setErro(null);
    if (deInputDataHoraBR(expiraEm).getTime() <= Date.now()) {
      setErro("Escolha uma data e hora futura para o aviso expirar.");
      return;
    }
    startTransition(async () => {
      const res = await criarAviso({ modelo, descricao, expiraEm });
      if (res?.error || !res.aviso) {
        setErro(res.error ?? "Não foi possível salvar o aviso.");
        return;
      }
      setCriando(false);
      setAvisos((atual) => [{ ...res.aviso!, modelo }, ...atual]);
    });
  }

  return (
    <div className="flex h-full flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Avisos</h2>
        <button
          type="button"
          onClick={() => (criando ? setCriando(false) : abrirForm())}
          className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
        >
          {criando ? "Cancelar" : "Novo"}
        </button>
      </div>

      {criando && (
        <div className="flex flex-col gap-2 rounded-md border border-gray-100 bg-gray-50 p-3">
          <div>
            <span className="block text-xs text-gray-600">Modelo</span>
            <div className="mt-1 flex gap-2">
              {MODELOS_AVISO.map((m) => {
                const IconeM = ICONE_MODELO[m];
                const ativo = modelo === m;
                return (
                  <button
                    key={m}
                    type="button"
                    disabled={pending}
                    onClick={() => setModelo(m)}
                    className={`flex flex-1 flex-col items-center gap-1 rounded border px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide ${
                      ativo
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <IconeM className="h-5 w-5" />
                    {MODELO_AVISO_LABELS[m]}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex flex-col gap-1 text-xs text-gray-600">
            Descrição
            <textarea
              value={descricao}
              disabled={pending}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Conteúdo do comunicado"
              rows={3}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-gray-600">
            Expira em
            <input
              type="datetime-local"
              value={expiraEm}
              disabled={pending}
              onChange={(e) => setExpiraEm(e.target.value)}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
          </label>

          {erro && <p className="text-xs text-red-600">{erro}</p>}

          <div className="flex justify-end">
            <button
              type="button"
              disabled={pending || !descricao.trim() || !expiraEm}
              onClick={salvar}
              className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {avisos.length === 0 ? (
          <p className="py-2 text-center text-sm text-gray-400">Nenhum aviso ativo no momento.</p>
        ) : (
          avisos.map((a) => (
            <AvisoCard
              key={a.id}
              aviso={a}
              onExcluir={(id) => setAvisos((atual) => atual.filter((x) => x.id !== id))}
            />
          ))
        )}
      </div>
    </div>
  );
}
