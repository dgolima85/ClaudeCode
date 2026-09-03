import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { exigirAnalistaLogado } from "@/lib/session";
import { TURNOS, TURNO_LABELS, TURNO_HORARIOS, isTurno, type Turno } from "@/lib/turno";
import { dataBR, idadeCurta } from "@/lib/dataHoraBR";
import { buscarDadosPassagemTurno } from "@/lib/passagemTurno";
import { CRITICIDADE_PESO, CRITICIDADE_HEX_COLOR, type Criticidade } from "@/lib/criticidade";

const LARGURA = 1080;
const MAX_RESOLVIDAS = 5;
const MAX_REPASSADAS = 5;

// Canvas do ImageResponse tem tamanho fixo (não estica pro conteúdo), então
// a altura é calculada a partir da quantidade real de itens — evita sobra
// de espaço em branco em turnos tranquilos e evita corte em turnos cheios.
const ALTURA_CABECALHO = 246;
const ALTURA_KPIS = 112;
const ALTURA_RODAPE = 84;
const ALTURA_TITULO_SECAO = 56;
const ALTURA_ITEM_RESOLVIDA_BASE = 50;
const ALTURA_LINHA_DETALHE = 28;
const ALTURA_ITEM_REPASSADA = 50;
const ALTURA_LINHA_OVERFLOW = 30;
const ALTURA_ESTADO_VAZIO = 54;
const ALTURA_MINIMA = 760;

const COR = {
  ink: "#10192b",
  inkSoft: "#3c465c",
  paper: "#fbfaf7",
  line: "#d8dde6",
  accent: "#ff7a3d",
  headerSub: "#9aa4bb",
  headerText: "#c9cedd",
  muted: "#6b7488",
  statusOpen: "#ef4444",
  statusDone: "#16a34a",
  statusCarry: "#f59e0b",
  badgeBg: "rgba(245,158,11,0.14)",
  badgeText: "#9a5b06",
};

// Fontes lidas uma vez, em escopo de módulo (não dependem da request).
const fonteRegular = readFile(join(process.cwd(), "src/assets/fonts/ibm-plex-sans-400.woff"));
const fonteSemiBold = readFile(join(process.cwd(), "src/assets/fonts/ibm-plex-sans-600.woff"));

function formatarDataCurta(diaBR: string): string {
  const [ano, mes, dia] = diaBR.split("-");
  const meses = [
    "JAN",
    "FEV",
    "MAR",
    "ABR",
    "MAI",
    "JUN",
    "JUL",
    "AGO",
    "SET",
    "OUT",
    "NOV",
    "DEZ",
  ];
  return `${dia} ${meses[Number(mes) - 1]} ${ano}`;
}

function pesoCriticidade(c: string | null): number {
  return c && c in CRITICIDADE_PESO ? CRITICIDADE_PESO[c as Criticidade] : 99;
}

function corCriticidade(c: string | null): string {
  return c && c in CRITICIDADE_HEX_COLOR ? CRITICIDADE_HEX_COLOR[c as Criticidade] : COR.muted;
}

// Trunca na última palavra que couber (satori não suporta text-overflow:
// ellipsis de forma confiável, e cortar no meio de uma palavra fica feio).
function truncar(texto: string, max: number): string {
  if (texto.length <= max) return texto;
  const cortado = texto.slice(0, max);
  const ultimoEspaco = cortado.lastIndexOf(" ");
  return `${ultimoEspaco > max * 0.6 ? cortado.slice(0, ultimoEspaco) : cortado}…`;
}

export async function GET(request: NextRequest) {
  const analista = await exigirAnalistaLogado();

  const sp = request.nextUrl.searchParams;
  const turnoParam = sp.get("turno");
  const turno: Turno = turnoParam && isTurno(turnoParam) ? turnoParam : ((analista.turno as Turno) ?? TURNOS[0]);
  const data = sp.get("data") || dataBR();

  const { emAberto, atividade } = await buscarDadosPassagemTurno(turno, data);

  const resolvidasTodas = atividade
    .filter((o) => o.status === "RESOLVIDO")
    .sort((a, b) => {
      const peso = pesoCriticidade(a.criticidade) - pesoCriticidade(b.criticidade);
      if (peso !== 0) return peso;
      const dataA = a.resolvidoEm ?? a.createdAt;
      const dataB = b.resolvidoEm ?? b.createdAt;
      return dataB.getTime() - dataA.getTime();
    });
  const resolvidas = resolvidasTodas.slice(0, MAX_RESOLVIDAS);
  const resolvidasRestantes = resolvidasTodas.length - resolvidas.length;

  const repassadasTodas = emAberto;
  const repassadas = repassadasTodas.slice(0, MAX_REPASSADAS);
  const repassadasRestantes = repassadasTodas.length - repassadas.length;

  const semTicket = emAberto.filter((o) => !o.ticket).length;
  const horario = TURNO_HORARIOS[turno];

  const alturaResolvidas = resolvidas.reduce((soma, o) => {
    let alturaItem = ALTURA_ITEM_RESOLVIDA_BASE;
    if (o.causaOutraDescricao) alturaItem += ALTURA_LINHA_DETALHE;
    if (o.solucaoOutraDescricao) alturaItem += ALTURA_LINHA_DETALHE;
    return soma + alturaItem;
  }, 0);

  const altura = Math.max(
    ALTURA_MINIMA,
    ALTURA_CABECALHO +
      ALTURA_KPIS +
      ALTURA_TITULO_SECAO +
      (resolvidas.length > 0 ? alturaResolvidas : ALTURA_ESTADO_VAZIO) +
      (resolvidasRestantes > 0 ? ALTURA_LINHA_OVERFLOW : 0) +
      ALTURA_TITULO_SECAO +
      (repassadas.length > 0 ? repassadas.length * ALTURA_ITEM_REPASSADA : ALTURA_ESTADO_VAZIO) +
      (repassadasRestantes > 0 ? ALTURA_LINHA_OVERFLOW : 0) +
      ALTURA_RODAPE,
  );

  const [dataRegular, dataSemiBold] = await Promise.all([fonteRegular, fonteSemiBold]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: COR.paper,
          fontFamily: "IBM Plex Sans",
        }}
      >
        {/* Cabeçalho */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: COR.ink,
            padding: "44px 48px 36px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div style={{ display: "flex", fontSize: 20, letterSpacing: 3, color: COR.headerSub }}>
              PASSAGEM DE TURNO
            </div>
            <div style={{ display: "flex", fontSize: 20, color: COR.headerText }}>
              {formatarDataCurta(data)}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 78,
              fontWeight: 600,
              color: COR.accent,
              marginTop: 6,
            }}
          >
            {TURNO_LABELS[turno].toUpperCase()}
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#eef1f6", marginTop: 6 }}>
            Turno {horario.inicio} → {horario.fim}
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: "flex", width: "100%", borderBottom: `1px solid ${COR.line}` }}>
          {[
            { num: atividade.length, label: "NO TURNO", cor: COR.ink },
            { num: resolvidasTodas.length, label: "RESOLVIDAS", cor: COR.statusDone },
            { num: repassadasTodas.length, label: "REPASSADAS", cor: COR.statusCarry },
            { num: semTicket, label: "SEM TICKET", cor: COR.statusOpen },
          ].map((kpi, i) => (
            <div
              key={kpi.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
                padding: "22px 8px",
                borderLeft: i === 0 ? "none" : `1px solid ${COR.line}`,
              }}
            >
              <div style={{ display: "flex", fontSize: 40, fontWeight: 600, color: kpi.cor }}>{kpi.num}</div>
              <div style={{ display: "flex", fontSize: 15, letterSpacing: 1, color: COR.muted, marginTop: 4 }}>
                {kpi.label}
              </div>
            </div>
          ))}
        </div>

        {/* Resolvidas */}
        <div style={{ display: "flex", flexDirection: "column", padding: "26px 48px 8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 22,
              fontWeight: 600,
              color: COR.inkSoft,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                width: 12,
                height: 12,
                borderRadius: 999,
                backgroundColor: COR.statusDone,
                marginRight: 10,
              }}
            />
            RESOLVIDAS NO TURNO ({resolvidasTodas.length})
          </div>

          {resolvidas.length === 0 && (
            <div style={{ display: "flex", fontSize: 20, color: COR.muted, padding: "10px 0" }}>
              Nenhuma ocorrência resolvida neste turno.
            </div>
          )}

          {resolvidas.map((o, i) => {
            const causa = o.causaOutraDescricao;
            const solucao = o.solucaoOutraDescricao;
            return (
              <div
                key={o.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px 0",
                  borderTop: i === 0 ? "none" : `1px solid ${COR.line}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div
                    style={{
                      display: "flex",
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      backgroundColor: corCriticidade(o.criticidade),
                      marginRight: 8,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ display: "flex", fontSize: 24, fontWeight: 600, color: COR.ink }}>
                    {truncar(o.titulo, 58)}
                  </div>
                </div>
                {causa && (
                  <div style={{ display: "flex", fontSize: 19, color: COR.muted, marginTop: 3 }}>
                    {truncar(`Causa: ${causa}`, 82)}
                  </div>
                )}
                {solucao && (
                  <div style={{ display: "flex", fontSize: 19, color: COR.muted, marginTop: 3 }}>
                    {truncar(`Solução: ${solucao}`, 82)}
                  </div>
                )}
              </div>
            );
          })}

          {resolvidasRestantes > 0 && (
            <div style={{ display: "flex", fontSize: 17, color: COR.muted, marginTop: 6 }}>
              + {resolvidasRestantes} outra{resolvidasRestantes > 1 ? "s" : ""} resolvida
              {resolvidasRestantes > 1 ? "s" : ""} — detalhe completo no sistema
            </div>
          )}
        </div>

        {/* Em aberto — repassadas */}
        <div style={{ display: "flex", flexDirection: "column", padding: "18px 48px 8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 22,
              fontWeight: 600,
              color: COR.inkSoft,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                width: 12,
                height: 12,
                borderRadius: 999,
                backgroundColor: COR.statusCarry,
                marginRight: 10,
              }}
            />
            EM ABERTO — REPASSADAS ({repassadasTodas.length})
          </div>

          {repassadas.length === 0 && (
            <div style={{ display: "flex", fontSize: 20, color: COR.muted, padding: "10px 0" }}>
              Nenhuma ocorrência em aberto no momento.
            </div>
          )}

          {repassadas.map((o, i) => (
            <div
              key={o.id}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 0",
                borderTop: i === 0 ? "none" : `1px solid ${COR.line}`,
                fontSize: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 15,
                  padding: "2px 7px",
                  borderRadius: 4,
                  backgroundColor: COR.badgeBg,
                  color: COR.badgeText,
                  marginRight: 10,
                  flexShrink: 0,
                }}
              >
                {idadeCurta(o.createdAt)}
              </div>
              <div style={{ display: "flex", color: COR.inkSoft, flex: 1 }}>{truncar(o.titulo, 50)}</div>
              <div style={{ display: "flex", color: COR.muted, fontSize: 17, marginLeft: 8 }}>
                {o.analista.nome}
              </div>
            </div>
          ))}

          {repassadasRestantes > 0 && (
            <div style={{ display: "flex", fontSize: 17, color: COR.muted, marginTop: 6 }}>
              + {repassadasRestantes} outra{repassadasRestantes > 1 ? "s" : ""} em aberto
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 48px 26px",
            borderTop: `1px solid ${COR.line}`,
            fontSize: 17,
            color: COR.muted,
          }}
        >
          <div style={{ display: "flex" }}>Gerado por {analista.nome}</div>
          <div style={{ display: "flex" }}>{new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</div>
        </div>
      </div>
    ),
    {
      width: LARGURA,
      height: altura,
      fonts: [
        { name: "IBM Plex Sans", data: dataRegular, weight: 400, style: "normal" },
        { name: "IBM Plex Sans", data: dataSemiBold, weight: 600, style: "normal" },
      ],
      headers: {
        "Content-Disposition": `inline; filename="boletim-turno-${turno.toLowerCase()}-${data}.png"`,
      },
    },
  );
}
