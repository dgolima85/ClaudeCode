"use client";

import { useRef, useState } from "react";
import { paraInputDataHoraBR, deInputDataHoraBR, formatarDataHoraBR } from "@/lib/dataHoraBR";
import { TIMES_COMUNICADO, formatarListaTimes } from "@/lib/comunicados/times";

const CLASSE_SELECT =
  "rounded border border-gray-300 bg-transparent px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark]";
const CLASSE_INPUT =
  "rounded border border-gray-300 bg-transparent px-2 py-1.5 text-sm dark:border-gray-600 dark:text-gray-100";
const CLASSE_TEXTAREA = `${CLASSE_INPUT} w-full resize-none`;

// Largura do cabeçalho/rodapé tanto na pré-visualização quanto na captura —
// não usa "transform: scale" no contêiner porque o html2canvas (biblioteca
// que transforma esses blocos em imagem) não lida bem com transforms em
// ancestrais do elemento capturado. A nitidez da imagem final não depende
// dessa largura: vem do "scale" passado pro html2canvas no momento da
// captura (ver gerarComunicado), que fotografa em resolução maior.
const TEMPLATE_LARGURA = 640;

// Cores do cabeçalho/rodapé são sempre em hex/rgb "cru" (nunca classes
// Tailwind) porque o html2canvas não entende cores modernas como oklch() —
// que é o que o Tailwind v4 usa por padrão na paleta. O corpo, no meio, NÃO
// é mais capturado como imagem (vira texto de verdade, pesquisável — ver
// conversa), então ele pode usar classes Tailwind normalmente.
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

function MarcaWatch() {
  // eslint-disable-next-line @next/next/no-img-element -- precisa ser um <img> "cru": o html2canvas captura a árvore do DOM e next/image passa pela rota de otimização, que complica a captura sem ganho nenhum aqui (o arquivo já é pequeno).
  return <img src="/watch-logo.png" alt="Watch" style={{ height: 22, width: "auto", flexShrink: 0 }} />;
}

// Cabeçalho: o único pedaço que vira imagem na ponta de cima — mesmo visual
// de sempre (ícone + "Acionamento NOC" + logo da Watch).
function CabecalhoTemplate({ innerRef }: { innerRef: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={innerRef}
      style={{
        width: TEMPLATE_LARGURA,
        boxSizing: "border-box",
        background: `linear-gradient(160deg, ${CORES.fundoInicio} 0%, ${CORES.fundoFim} 100%)`,
        padding: "22px 32px",
        borderRadius: "12px 12px 0 0",
        fontFamily: "Arial, Helvetica, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <LogoMarca />
      <MarcaWatch />
    </div>
  );
}

// Rodapé: o outro pedaço que vira imagem, na ponta de baixo — a partir da
// linha divisória que hoje já vem logo depois do "Obrigado!".
function RodapeTemplate({
  innerRef,
  timesNotificados,
}: {
  innerRef: React.Ref<HTMLDivElement>;
  timesNotificados: string[];
}) {
  return (
    <div
      ref={innerRef}
      style={{
        width: TEMPLATE_LARGURA,
        boxSizing: "border-box",
        background: `linear-gradient(160deg, ${CORES.fundoInicio} 0%, ${CORES.fundoFim} 100%)`,
        padding: "16px 32px 22px",
        borderRadius: "0 0 12px 12px",
        fontFamily: "Arial, Helvetica, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
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
  );
}

type DadosCorpo = {
  time: string;
  alerta: string;
  dataHoraTexto: string;
  descricao: string;
  ticket: string;
};

// Corpo: fica entre o cabeçalho e o rodapé, mas não é mais capturado como
// imagem — é texto de verdade (pesquisável depois no Teams/e-mail). Por não
// ser capturado pelo html2canvas, pode usar classes Tailwind à vontade.
function CorpoPreview({ time, alerta, dataHoraTexto, descricao, ticket }: DadosCorpo) {
  return (
    <div
      className="flex flex-col gap-3 bg-white px-8 py-4 text-sm leading-relaxed break-words text-gray-800 dark:bg-gray-900 dark:text-gray-100"
      style={{ width: TEMPLATE_LARGURA, maxWidth: "100%", boxSizing: "border-box", fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      <p className="m-0">Olá equipe de {time}!</p>
      <p className="m-0">Identificamos um novo alerta em nossa monitoração. Abaixo os detalhes para análise:</p>
      <div className="flex flex-col gap-1.5">
        <p className="m-0 whitespace-pre-wrap">
          <span className="font-semibold">Alerta:</span> {alerta}
        </p>
        <p className="m-0">
          <span className="font-semibold">Data e Hora:</span> {dataHoraTexto}
        </p>
        <p className="m-0 whitespace-pre-wrap">
          <span className="font-semibold">Descrição:</span> {descricao}
        </p>
      </div>
      <p className="m-0">
        <span className="font-semibold">Ticket:</span> {ticket || "—"}
      </p>
      <p className="m-0">Pedimos a gentileza de validarem a ocorrência e nos retornarem assim que possível.</p>
      <p className="m-0">Obrigado!</p>
    </div>
  );
}

function escaparHtml(texto: string): string {
  return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function escaparComQuebras(texto: string): string {
  return escaparHtml(texto).replace(/\n/g, "<br>");
}

// HTML do corpo pra colar junto com as imagens. Usa <br><br> entre linhas em
// vez de <p style="margin:...">: apps como o Teams removem o atributo
// style ao colar (foi assim que a saudação "Olá equipe de..." ficou colada
// do lado do cabeçalho em vez de embaixo, e as linhas do meio ficaram sem
// respiro entre si — ver conversa/imagem). <br> é uma quebra de linha de
// verdade, não depende de CSS, então sobrevive a essa limpeza.
function montarCorpoHtml({ time, alerta, dataHoraTexto, descricao, ticket }: DadosCorpo): string {
  const linhas = [
    `Olá equipe de ${escaparHtml(time)}!`,
    "Identificamos um novo alerta em nossa monitoração. Abaixo os detalhes para análise:",
    `<b>Alerta:</b> ${escaparComQuebras(alerta)}`,
    `<b>Data e Hora:</b> ${escaparHtml(dataHoraTexto)}`,
    `<b>Descrição:</b> ${escaparComQuebras(descricao)}`,
    `<b>Ticket:</b> ${escaparHtml(ticket || "—")}`,
    "Pedimos a gentileza de validarem a ocorrência e nos retornarem assim que possível.",
    "Obrigado!",
  ];
  return `<span style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:#1f2937;">${linhas.join("<br><br>")}</span>`;
}

function montarCorpoTexto({ time, alerta, dataHoraTexto, descricao, ticket }: DadosCorpo): string {
  return [
    `Olá equipe de ${time}!`,
    "",
    "Identificamos um novo alerta em nossa monitoração. Abaixo os detalhes para análise:",
    "",
    `Alerta: ${alerta}`,
    `Data e Hora: ${dataHoraTexto}`,
    `Descrição: ${descricao}`,
    `Ticket: ${ticket || "—"}`,
    "",
    "Pedimos a gentileza de validarem a ocorrência e nos retornarem assim que possível.",
    "",
    "Obrigado!",
  ].join("\n");
}

export default function ComunicadoForm() {
  const [time, setTime] = useState<string>(TIMES_COMUNICADO[0]);
  const [alerta, setAlerta] = useState("");
  const [dataHora, setDataHora] = useState(() => paraInputDataHoraBR(new Date()));
  const [descricao, setDescricao] = useState("");
  const [ticket, setTicket] = useState("");
  const [timesNotificados, setTimesNotificados] = useState<string[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [cabecalhoUrl, setCabecalhoUrl] = useState<string | null>(null);
  const [rodapeUrl, setRodapeUrl] = useState<string | null>(null);
  const [gerando, setGerando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [avisoCopia, setAvisoCopia] = useState<string | null>(null);

  const cabecalhoRef = useRef<HTMLDivElement>(null);
  const rodapeRef = useRef<HTMLDivElement>(null);

  function alternarTimeNotificado(t: string) {
    setTimesNotificados((atual) => (atual.includes(t) ? atual.filter((x) => x !== t) : [...atual, t]));
  }

  const dataHoraTexto = dataHora ? formatarDataHoraBR(deInputDataHoraBR(dataHora)) : "";
  const dadosCorpo: DadosCorpo = { time, alerta, dataHoraTexto, descricao, ticket };

  async function gerarComunicado() {
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
    if (!cabecalhoRef.current || !rodapeRef.current) return;

    setGerando(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const [canvasCabecalho, canvasRodape] = await Promise.all([
        html2canvas(cabecalhoRef.current, { backgroundColor: null, scale: 3 }),
        html2canvas(rodapeRef.current, { backgroundColor: null, scale: 3 }),
      ]);
      setCabecalhoUrl(canvasCabecalho.toDataURL("image/png"));
      setRodapeUrl(canvasRodape.toDataURL("image/png"));
    } catch {
      setErro("Não foi possível gerar o comunicado.");
    } finally {
      setGerando(false);
    }
  }

  async function copiarComunicado() {
    if (!cabecalhoUrl || !rodapeUrl) return;
    setAvisoCopia(null);

    // <br><br> entre a imagem e o texto (nos dois sentidos) força uma linha
    // em branco entre eles mesmo se o Teams ignorar o "style" das imagens —
    // sem isso, a saudação ficou colada do lado do cabeçalho em vez de
    // embaixo dele (ver conversa/imagem).
    const htmlCompleto = [
      `<img src="${cabecalhoUrl}" alt="Acionamento NOC" style="display:block;width:100%;max-width:${TEMPLATE_LARGURA}px;border:0;">`,
      "<br><br>",
      montarCorpoHtml(dadosCorpo),
      "<br><br>",
      `<img src="${rodapeUrl}" alt="" style="display:block;width:100%;max-width:${TEMPLATE_LARGURA}px;border:0;">`,
    ].join("");

    const textoCompleto = `${montarCorpoTexto(dadosCorpo)}\n\n—\nComunicado enviado para: ${formatarListaTimes(timesNotificados)}`;

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([htmlCompleto], { type: "text/html" }),
          "text/plain": new Blob([textoCompleto], { type: "text/plain" }),
        }),
      ]);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setAvisoCopia(
        "Não foi possível copiar automaticamente (permissão do navegador). Baixe o cabeçalho e o rodapé abaixo, copie o texto do meio manualmente (selecione e Ctrl+C) e monte a mensagem direto no Teams/e-mail.",
      );
    }
  }

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
          onClick={gerarComunicado}
          className="mt-1 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {gerando ? "Gerando..." : "Gerar Comunicado"}
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pré-visualização</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Cabeçalho e rodapé viram imagem (chamam atenção no Teams); o texto do meio é copiado como texto de
          verdade, pesquisável depois.
        </p>

        <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
          <CabecalhoTemplate innerRef={cabecalhoRef} />
          <CorpoPreview {...dadosCorpo} />
          <RodapeTemplate innerRef={rodapeRef} timesNotificados={timesNotificados.length > 0 ? timesNotificados : ["—"]} />
        </div>

        {cabecalhoUrl && rodapeUrl && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={copiarComunicado}
                className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                {copiado ? "Copiado!" : "Copiar comunicado"}
              </button>
              <a
                href={cabecalhoUrl}
                download="acionamento-noc-cabecalho.png"
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Baixar cabeçalho
              </a>
              <a
                href={rodapeUrl}
                download="acionamento-noc-rodape.png"
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Baixar rodapé
              </a>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Cole direto no Teams/e-mail: cabeçalho e rodapé entram como imagem, o texto do meio entra
              pesquisável.
            </p>

            {avisoCopia && <p className="text-xs text-amber-600 dark:text-amber-400">{avisoCopia}</p>}
          </>
        )}
      </div>
    </div>
  );
}
