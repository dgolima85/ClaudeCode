"use client";

import { useRef, useState } from "react";
import { paraInputDataHoraBR, deInputDataHoraBR, formatarDataHoraBR } from "@/lib/dataHoraBR";
import { TIMES_COMUNICADO, formatarListaTimes } from "@/lib/comunicados/times";

const CLASSE_SELECT =
  "rounded border border-gray-300 bg-transparent px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark]";
const CLASSE_INPUT =
  "rounded border border-gray-300 bg-transparent px-2 py-1.5 text-sm dark:border-gray-600 dark:text-gray-100";
const CLASSE_TEXTAREA = `${CLASSE_INPUT} w-full resize-none`;

// Largura do template tanto na pré-visualização quanto na captura — não usa
// "transform: scale" no contêiner porque o html2canvas (biblioteca que
// transforma esse bloco numa imagem) não lida bem com transforms em
// ancestrais do elemento capturado. A nitidez da imagem final não depende
// dessa largura: vem do "scale" passado pro html2canvas no momento da
// captura (ver gerarImagem), que fotografa em resolução maior.
const TEMPLATE_LARGURA = 640;

// Cores do template são sempre em hex/rgb "cru" (nunca classes Tailwind)
// porque o html2canvas (biblioteca usada pra transformar esse bloco em
// imagem) não entende cores modernas como oklch() — que é o que o Tailwind
// v4 usa por padrão na paleta. Usando estilo inline cru aqui, a cor
// exportada na imagem final é garantida de bater com o que aparece na tela.
const CORES = {
  fundoInicio: "#3a0ca3",
  fundoFim: "#5b16c9",
  laranjaInicio: "#ff6a1a",
  laranjaFim: "#ff9142",
  texto: "#f5f3ff",
  textoMuted: "#c9b8f5",
  divisorInicio: "#ff5b1f",
  divisorFim: "#ffb347",
} as const;

type ComunicadoTemplateProps = {
  time: string;
  alerta: string;
  dataHoraTexto: string;
  descricao: string;
  ticket: string;
  timesNotificados: string[];
  // O html2canvas precisa capturar exatamente o elemento com a largura
  // fixa (width: TEMPLATE_LARGURA) — se o ref ficasse num wrapper por
  // fora, ele capturaria a largura desse wrapper (que encolhe pra caber
  // na coluna da página), não a do template, cortando o conteúdo.
  innerRef: React.Ref<HTMLDivElement>;
};

// Tamanhos pensados pra largura do template (TEMPLATE_LARGURA) — a nitidez
// final não depende deles, vem do "scale" do html2canvas na captura.
const FONTE_CORPO = 13;
const FONTE_TITULO = 20;
const FONTE_RODAPE = 11;

// Quebra palavras longas sem espaço (ex.: um link comprido colado no
// Alerta/Descrição) em vez de vazar pra fora do quadro.
const QUEBRA_TEXTO = { overflowWrap: "break-word", wordBreak: "break-word" } as const;

function LogoMarca() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          position: "relative",
          width: 36,
          height: 36,
          borderRadius: 10,
          background: `linear-gradient(135deg, ${CORES.laranjaInicio}, ${CORES.laranjaFim})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 20 20">
          <polygon points="4,2 18,10 4,18" fill="#ffffff" />
        </svg>
        <div
          style={{
            position: "absolute",
            top: -3,
            right: -3,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#ffffff",
          }}
        />
      </div>
      <span style={{ fontSize: FONTE_TITULO, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em" }}>
        Acionamento NOC
      </span>
    </div>
  );
}

function LinhaRotulo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <p style={{ margin: 0, fontSize: FONTE_CORPO, lineHeight: 1.55, color: CORES.texto, ...QUEBRA_TEXTO }}>
      <span style={{ fontWeight: 400 }}>{rotulo}: </span>
      {valor}
    </p>
  );
}

function BlocoLongo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: FONTE_CORPO, lineHeight: 1.55, color: CORES.texto, ...QUEBRA_TEXTO }}>{rotulo}:</p>
      <p
        style={{
          margin: 0,
          fontSize: FONTE_CORPO,
          lineHeight: 1.55,
          color: CORES.texto,
          whiteSpace: "pre-wrap",
          ...QUEBRA_TEXTO,
        }}
      >
        {valor}
      </p>
    </div>
  );
}

function ComunicadoTemplate({
  time,
  alerta,
  dataHoraTexto,
  descricao,
  ticket,
  timesNotificados,
  innerRef,
}: ComunicadoTemplateProps) {
  const alertaMultilinha = alerta.includes("\n") || alerta.length > 70;
  const descricaoMultilinha = descricao.includes("\n") || descricao.length > 70;

  return (
    <div
      ref={innerRef}
      style={{
        width: TEMPLATE_LARGURA,
        // boxSizing + minWidth: 0 são necessários porque isso tudo é um
        // flex column — sem minWidth: 0 os parágrafos (filhos de flex) não
        // encolhem pra caber na largura fixa e o texto vaza pra fora do
        // quadro em vez de quebrar linha (gotcha clássico de flexbox).
        minWidth: 0,
        background: `linear-gradient(160deg, ${CORES.fundoInicio} 0%, ${CORES.fundoFim} 100%)`,
        padding: "28px 32px",
        boxSizing: "border-box",
        fontFamily: "Arial, Helvetica, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <LogoMarca />

      <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: FONTE_CORPO, lineHeight: 1.55, color: CORES.texto, ...QUEBRA_TEXTO }}>
          Olá equipe de {time}!
        </p>

        <p style={{ margin: 0, fontSize: FONTE_CORPO, lineHeight: 1.55, color: CORES.texto, ...QUEBRA_TEXTO }}>
          Identificamos um novo alerta em nossa monitoração. Abaixo os detalhes para análise:
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
          {alertaMultilinha ? <BlocoLongo rotulo="Alerta" valor={alerta} /> : <LinhaRotulo rotulo="Alerta" valor={alerta} />}
          <LinhaRotulo rotulo="Data e Hora" valor={dataHoraTexto} />
          {descricaoMultilinha ? (
            <BlocoLongo rotulo="Descrição" valor={descricao} />
          ) : (
            <LinhaRotulo rotulo="Descrição" valor={descricao} />
          )}
        </div>

        <LinhaRotulo rotulo="Ticket" valor={ticket || "—"} />

        <p style={{ margin: 0, fontSize: FONTE_CORPO, lineHeight: 1.55, color: CORES.texto, ...QUEBRA_TEXTO }}>
          Pedimos a gentileza de validarem a ocorrência e nos retornarem assim que possível.
        </p>

        <p style={{ margin: 0, fontSize: FONTE_CORPO, lineHeight: 1.55, color: CORES.texto, ...QUEBRA_TEXTO }}>Obrigado!</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
        <div
          style={{
            height: 3,
            width: "100%",
            background: `linear-gradient(90deg, ${CORES.divisorInicio}, ${CORES.divisorFim})`,
            borderRadius: 2,
          }}
        />
        <p
          style={{
            margin: 0,
            fontSize: FONTE_RODAPE,
            lineHeight: 1.5,
            color: CORES.textoMuted,
            textAlign: "right",
            ...QUEBRA_TEXTO,
          }}
        >
          Comunicado enviado para: {formatarListaTimes(timesNotificados)}
        </p>
      </div>
    </div>
  );
}

export default function ComunicadoForm() {
  const [time, setTime] = useState<string>(TIMES_COMUNICADO[0]);
  const [alerta, setAlerta] = useState("");
  const [dataHora, setDataHora] = useState(() => paraInputDataHoraBR(new Date()));
  const [descricao, setDescricao] = useState("");
  const [ticket, setTicket] = useState("");
  const [timesNotificados, setTimesNotificados] = useState<string[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [imagemUrl, setImagemUrl] = useState<string | null>(null);
  const [imagemBlob, setImagemBlob] = useState<Blob | null>(null);
  const [gerando, setGerando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [avisoCopia, setAvisoCopia] = useState<string | null>(null);

  const templateRef = useRef<HTMLDivElement>(null);

  function alternarTimeNotificado(t: string) {
    setTimesNotificados((atual) => (atual.includes(t) ? atual.filter((x) => x !== t) : [...atual, t]));
  }

  async function gerarImagem() {
    setErro(null);
    setCopiado(false);
    setAvisoCopia(null);

    if (!alerta.trim()) {
      setErro("Descreva o alerta.");
      return;
    }
    if (!dataHora) {
      setErro("Informe a data e hora do alerta.");
      return;
    }
    if (!descricao.trim()) {
      setErro("Descreva o erro.");
      return;
    }
    if (timesNotificados.length === 0) {
      setErro("Selecione ao menos um time notificado.");
      return;
    }
    if (!templateRef.current) return;

    setGerando(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(templateRef.current, {
        backgroundColor: null,
        scale: 3,
      });
      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) {
        setErro("Não foi possível gerar a imagem.");
        return;
      }
      setImagemUrl((atual) => {
        if (atual) URL.revokeObjectURL(atual);
        return URL.createObjectURL(blob);
      });
      setImagemBlob(blob);
    } catch {
      setErro("Não foi possível gerar a imagem.");
    } finally {
      setGerando(false);
    }
  }

  async function copiarImagem() {
    if (!imagemBlob) return;
    setAvisoCopia(null);
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": imagemBlob })]);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setAvisoCopia(
        "Não foi possível copiar automaticamente (permissão do navegador). Clique com o botão direito na imagem abaixo e escolha \"Copiar imagem\", ou use o botão Baixar.",
      );
    }
  }

  const dataHoraTexto = dataHora ? formatarDataHoraBR(deInputDataHoraBR(dataHora)) : "";

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Acionamento NOC</h2>

        <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
          Time
          <select value={time} onChange={(e) => setTime(e.target.value)} className={CLASSE_SELECT}>
            {TIMES_COMUNICADO.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
          Alerta
          <textarea
            value={alerta}
            onChange={(e) => setAlerta(e.target.value)}
            placeholder="Cole aqui o alerta"
            rows={3}
            className={CLASSE_TEXTAREA}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
          Data e Hora do Alerta
          <input
            type="datetime-local"
            value={dataHora}
            onChange={(e) => setDataHora(e.target.value)}
            className={`${CLASSE_INPUT} dark:[color-scheme:dark]`}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
          Descrição
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição do erro"
            rows={3}
            className={CLASSE_TEXTAREA}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
          Ticket
          <input
            value={ticket}
            onChange={(e) => setTicket(e.target.value)}
            placeholder="Opcional"
            className={CLASSE_INPUT}
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-gray-600 dark:text-gray-400">Times notificados</span>
          <div className="flex flex-wrap gap-2">
            {TIMES_COMUNICADO.map((t) => {
              const ativo = timesNotificados.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => alternarTimeNotificado(t)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    ativo
                      ? "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500"
                      : "border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {erro && <p className="text-xs text-red-600 dark:text-red-400">{erro}</p>}

        <button
          type="button"
          disabled={gerando}
          onClick={gerarImagem}
          className="mt-1 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {gerando ? "Gerando..." : "Gerar Imagem"}
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pré-visualização</h2>

        <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
          <ComunicadoTemplate
            innerRef={templateRef}
            time={time}
            alerta={alerta || "[Colar Alerta]"}
            dataHoraTexto={dataHoraTexto}
            descricao={descricao || "[Descrição do Erro]"}
            ticket={ticket}
            timesNotificados={timesNotificados.length > 0 ? timesNotificados : ["—"]}
          />
        </div>

        {imagemUrl && (
          <>
            <p className="text-xs text-gray-500 dark:text-gray-400">Imagem gerada — clique em Copiar e cole no e-mail.</p>
            {/* eslint-disable-next-line @next/next/no-img-element -- é uma imagem gerada em memória (data/blob URL), não um asset do projeto */}
            <img src={imagemUrl} alt="Comunicado gerado" className="w-full rounded-md border border-gray-200 dark:border-gray-700" />

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={copiarImagem}
                className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                {copiado ? "Copiado!" : "Copiar imagem"}
              </button>
              <a
                href={imagemUrl}
                download="acionamento-noc.png"
                className="rounded-md border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Baixar imagem
              </a>
            </div>

            {avisoCopia && <p className="text-xs text-amber-600 dark:text-amber-400">{avisoCopia}</p>}
          </>
        )}
      </div>
    </div>
  );
}
