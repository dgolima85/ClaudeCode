"use client";

import { useEffect, useState, useTransition } from "react";
import { formatarDataHoraBR, paraInputDataHoraBR, deInputDataHoraBR } from "@/lib/dataHoraBR";
import { MODELOS_AVISO, MODELO_AVISO_LABELS, type ModeloAviso } from "@/lib/aviso";
import { criarAviso, atualizarAviso, excluirAviso } from "@/app/avisos/actions";
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

const COR_MODELO: Record<ModeloAviso, string> = {
  INFORMATIVO: "text-blue-600",
  ACOMPANHAMENTO: "text-yellow-600",
  ATUACAO: "text-red-600",
};

const ESTILO_BOTAO_MODELO: Record<ModeloAviso, string> = {
  INFORMATIVO: "border-blue-500 bg-blue-50 text-blue-700",
  ACOMPANHAMENTO: "border-yellow-500 bg-yellow-50 text-yellow-700",
  ATUACAO: "border-red-500 bg-red-50 text-red-700",
};

const ROTACAO_AUTOMATICA_MS = 7000;

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

function IconeSeta({ direcao, className }: { direcao: "esquerda" | "direita"; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={direcao === "esquerda" ? "m14.5 5-7 7 7 7" : "m9.5 5 7 7-7 7"} />
    </svg>
  );
}

function AvisoCard({
  aviso,
  onExcluir,
  onAtualizar,
  onEditandoChange,
}: {
  aviso: AvisoLinha;
  onExcluir: (id: string) => void;
  onAtualizar: (aviso: AvisoLinha) => void;
  onEditandoChange: (editando: boolean) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [editando, setEditando] = useState(false);
  const [modelo, setModelo] = useState<ModeloAviso>(aviso.modelo);
  const [descricao, setDescricao] = useState(aviso.descricao);
  const [expiraEm, setExpiraEm] = useState(() => paraInputDataHoraBR(new Date(aviso.expiraEm)));
  const [erro, setErro] = useState<string | null>(null);
  const IconeModelo = ICONE_MODELO[aviso.modelo];

  useEffect(() => {
    onEditandoChange(editando);
    return () => onEditandoChange(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editando]);

  function abrirEdicao() {
    setModelo(aviso.modelo);
    setDescricao(aviso.descricao);
    setExpiraEm(paraInputDataHoraBR(new Date(aviso.expiraEm)));
    setErro(null);
    setEditando(true);
  }

  function salvarEdicao() {
    setErro(null);
    if (deInputDataHoraBR(expiraEm).getTime() <= Date.now()) {
      setErro("Escolha uma data e hora futura para o aviso expirar.");
      return;
    }
    startTransition(async () => {
      const res = await atualizarAviso(aviso.id, { modelo, descricao, expiraEm });
      if (res?.error || !res.aviso) {
        setErro(res.error ?? "Não foi possível salvar o aviso.");
        return;
      }
      onAtualizar({ ...res.aviso, modelo });
      setEditando(false);
    });
  }

  if (editando) {
    return (
      <div className="flex flex-col gap-2 rounded-md border border-gray-200 bg-gray-50 p-2.5">
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
                    ativo ? ESTILO_BOTAO_MODELO[m] : "border-gray-300 text-gray-500 hover:bg-gray-100"
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

        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => setEditando(false)}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={pending || !descricao.trim() || !expiraEm}
            onClick={salvarEdicao}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Salvar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-md border border-gray-200 p-2.5">
      <CampoIcone Icone={IconeAtivo} label="Ativo" className="text-green-600" />
      <CampoIcone
        Icone={IconeModelo}
        label={MODELO_AVISO_LABELS[aviso.modelo]}
        className={COR_MODELO[aviso.modelo]}
      />
      <div className="min-w-0 flex-1">
        <p className="max-h-40 overflow-y-auto whitespace-pre-wrap break-words pr-1 text-sm text-gray-700">
          {aviso.descricao}
        </p>
        <p className="mt-1 text-xs text-gray-400">Expira em {formatarDataHoraBR(aviso.expiraEm)}</p>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-1.5">
        <button
          type="button"
          disabled={pending}
          onClick={abrirEdicao}
          title="Editar aviso"
          className="text-gray-400 hover:text-blue-600 disabled:opacity-50"
        >
          ✎
        </button>
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
          className="text-gray-400 hover:text-red-600 disabled:opacity-50"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function AvisosPanel({ avisos: avisosIniciais }: AvisosPanelProps) {
  const [avisos, setAvisos] = useState(avisosIniciais);
  const [indice, setIndice] = useState(0);
  const [criando, setCriando] = useState(false);
  const [editandoAlgum, setEditandoAlgum] = useState(false);
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
      setIndice(0);
    });
  }

  function atualizarLocal(atualizado: AvisoLinha) {
    setAvisos((atual) => atual.map((a) => (a.id === atualizado.id ? atualizado : a)));
  }

  function excluirLocal(id: string) {
    setAvisos((atual) => {
      const novaLista = atual.filter((x) => x.id !== id);
      setIndice((i) => Math.min(i, Math.max(novaLista.length - 1, 0)));
      return novaLista;
    });
  }

  function anterior() {
    setIndice((i) => (i - 1 + avisos.length) % avisos.length);
  }

  function proximo() {
    setIndice((i) => (i + 1) % avisos.length);
  }

  useEffect(() => {
    if (avisos.length <= 1 || criando || editandoAlgum) return;
    const timer = setInterval(() => {
      setIndice((i) => (i + 1) % avisos.length);
    }, ROTACAO_AUTOMATICA_MS);
    return () => clearInterval(timer);
  }, [avisos.length, criando, editandoAlgum, indice]);

  return (
    <div className="flex h-[460px] flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex shrink-0 items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Avisos</h2>
        <button
          type="button"
          onClick={() => (criando ? setCriando(false) : abrirForm())}
          className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
        >
          {criando ? "Cancelar" : "Novo"}
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {criando && (
          <div className="flex shrink-0 flex-col gap-2 rounded-md border border-gray-100 bg-gray-50 p-3">
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
                          ? ESTILO_BOTAO_MODELO[m]
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

        <div className="flex flex-1 flex-col justify-center gap-2">
          {avisos.length === 0 ? (
            <p className="py-2 text-center text-sm text-gray-400">Nenhum aviso ativo no momento.</p>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={anterior}
                  disabled={avisos.length <= 1}
                  aria-label="Aviso anterior"
                  className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:pointer-events-none disabled:opacity-0"
                >
                  <IconeSeta direcao="esquerda" className="h-5 w-5" />
                </button>

                <div className="min-w-0 flex-1">
                  <AvisoCard
                    aviso={avisos[indice]}
                    onExcluir={excluirLocal}
                    onAtualizar={atualizarLocal}
                    onEditandoChange={setEditandoAlgum}
                  />
                </div>

                <button
                  type="button"
                  onClick={proximo}
                  disabled={avisos.length <= 1}
                  aria-label="Próximo aviso"
                  className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:pointer-events-none disabled:opacity-0"
                >
                  <IconeSeta direcao="direita" className="h-5 w-5" />
                </button>
              </div>

              {avisos.length > 1 && (
                <div className="flex shrink-0 items-center justify-center gap-1.5">
                  {avisos.map((a, i) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setIndice(i)}
                      aria-label={`Ir para o aviso ${i + 1}`}
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${
                        i === indice ? "bg-blue-600" : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
