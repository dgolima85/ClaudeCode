"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from "recharts";
import { STATUS_HEX_COLOR, type StatusOcorrencia } from "@/lib/status";

type Item = { nome: string; total: number };
type StatusItem = { status: string; label: string; total: number };
type DiaItem = { dia: string; total: number };

type DashboardChartsProps = {
  porTipo: Item[];
  porStatus: StatusItem[];
  porAnalista: Item[];
  porDia: DiaItem[];
  totalOcorrencias: number;
  tempoMedioResolucaoMinutos: number | null;
};

function formatarMinutos(min: number) {
  if (min < 60) return `${min} min`;
  const horas = Math.floor(min / 60);
  const minutos = min % 60;
  return `${horas}h${minutos > 0 ? ` ${minutos}min` : ""}`;
}

export default function DashboardCharts({
  porTipo,
  porStatus,
  porAnalista,
  porDia,
  totalOcorrencias,
  tempoMedioResolucaoMinutos,
}: DashboardChartsProps) {
  const resolvidas = porStatus.find((s) => s.status === "RESOLVIDO")?.total ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Total de Ocorrências</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{totalOcorrencias}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Tempo Médio de Resolução</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {tempoMedioResolucaoMinutos !== null ? formatarMinutos(tempoMedioResolucaoMinutos) : "—"}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Ocorrências Resolvidas</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{resolvidas}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Por Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={porStatus}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {porStatus.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={STATUS_HEX_COLOR[entry.status as StatusOcorrencia] ?? "#3b82f6"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Por Tipo</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={porTipo}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="nome" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Por Analista</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={porAnalista}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="nome" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Volume ao Longo do Tempo</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={porDia}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {totalOcorrencias === 0 && (
        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-yellow-900/40 dark:text-yellow-300">
          Nenhuma ocorrência registrada ainda. Os gráficos aparecerão conforme os dados forem inseridos.
        </p>
      )}
    </div>
  );
}
