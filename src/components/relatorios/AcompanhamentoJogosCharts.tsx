"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { AcompanhamentoJogosRelatorio } from "@/lib/acompanhamentoJogos";

// "yyyy-MM-dd" -> "dd/MM/yyyy", sem passar por Date/timezone (mesmo padrão
// de src/components/plantao/PlantonistasPanel.tsx) — dataBR já é uma data
// de calendário pura, converter por Date arriscaria deslocar um dia.
function formatarDataBRCurta(dataBR: string): string {
  const [ano, mes, dia] = dataBR.split("-");
  return `${dia}/${mes}/${ano}`;
}

// Cores "status" (bom/atenção) já validadas pro par testado x não testado —
// não reaproveitei o vermelho/amarelo de STATUS_HEX_COLOR (src/lib/status.ts)
// porque esse par falha separação CVD; esse aqui passa.
const COR_TESTADO = "#0ca30c";
const COR_NAO_TESTADO = "#fab219";

type AcompanhamentoJogosChartsProps = {
  relatorio: AcompanhamentoJogosRelatorio;
};

function StatTile({ label, valor }: { label: string; valor: string | number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{valor}</p>
    </div>
  );
}

export default function AcompanhamentoJogosCharts({ relatorio }: AcompanhamentoJogosChartsProps) {
  const {
    totalJogos,
    totalRegistros,
    percentualValidado,
    totalForaDoPortfolio,
    totalComIncidencia,
    porCampeonato,
    porCanal,
    porAnalista,
    delayPorCanal,
    incidencias,
  } = relatorio;

  if (totalRegistros === 0) {
    return (
      <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-yellow-900/40 dark:text-yellow-300">
        Nenhum acompanhamento de jogo registrado ainda. Os dados aparecem aqui conforme os analistas preenchem o
        checklist no painel &quot;Jogos de Hoje&quot;.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Jogos Acompanhados" valor={totalJogos} />
        <StatTile label="Canais Testados e Validados" valor={`${percentualValidado}%`} />
        <StatTile label="Canais Fora do Portfólio" valor={totalForaDoPortfolio} />
        <StatTile label="Relatos com Incidência" valor={totalComIncidencia} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Jogos por Campeonato</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={porCampeonato}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="campeonato" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="jogos" name="Jogos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Canal Testado e Validado 30min Antes
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={porCanal}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="canal" tick={{ fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={70} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="testados" name="Testado" stackId="canal" fill={COR_TESTADO} />
              <Bar dataKey="naoTestados" name="Não testado" stackId="canal" fill={COR_NAO_TESTADO} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <h3 className="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300">
            Registros por Analista
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 dark:text-gray-500">
                <th className="px-4 py-2 font-medium">Analista</th>
                <th className="px-4 py-2 font-medium">Registros</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {porAnalista.map((a) => (
                <tr key={a.nome}>
                  <td className="px-4 py-1.5 text-gray-700 dark:text-gray-300">{a.nome}</td>
                  <td className="px-4 py-1.5 text-gray-700 dark:text-gray-300">{a.registros}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <h3 className="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300">
            Delay Médio em Relação à Claro, por Canal
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 dark:text-gray-500">
                <th className="px-4 py-2 font-medium">Canal</th>
                <th className="px-4 py-2 font-medium">Média</th>
                <th className="px-4 py-2 font-medium">Amostras</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {delayPorCanal.map((d) => (
                <tr key={d.canal}>
                  <td className="px-4 py-1.5 text-gray-700 dark:text-gray-300">{d.canal}</td>
                  <td className="px-4 py-1.5 text-gray-700 dark:text-gray-300">
                    {d.mediaSegundos !== null ? `${d.mediaSegundos}s` : "—"}
                  </td>
                  <td className="px-4 py-1.5 text-gray-400 dark:text-gray-500">
                    {d.amostras}/{d.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-4 py-2 text-xs text-gray-400 dark:text-gray-500">
            Média calculada só sobre os textos de que foi possível extrair um número de segundos — &quot;Amostras&quot; é
            quanto disso em relação ao total de registros daquele canal.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <h3 className="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300">
          Relatórios Pós Jogo com Incidência ({incidencias.length})
        </h3>
        {incidencias.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
            Nenhum relatório fora do padrão &quot;sem incidência&quot; até agora.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 dark:text-gray-500">
                  <th className="px-4 py-2 font-medium">Data</th>
                  <th className="px-4 py-2 font-medium">Jogo</th>
                  <th className="px-4 py-2 font-medium">Canal</th>
                  <th className="px-4 py-2 font-medium">Relatório</th>
                  <th className="px-4 py-2 font-medium">Analista</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {incidencias.map((i) => (
                  <tr key={i.id}>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-300">
                      {formatarDataBRCurta(i.dataBR)}
                    </td>
                    <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                      {i.mandante} x {i.visitante}
                    </td>
                    <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{i.canal}</td>
                    <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{i.relatorio}</td>
                    <td className="px-4 py-2 text-gray-400 dark:text-gray-500">{i.registradoPor ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
