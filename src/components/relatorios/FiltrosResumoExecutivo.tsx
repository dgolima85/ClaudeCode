import { TURNOS, TURNO_LABELS } from "@/lib/turno";
import type { FiltrosRelatorio } from "@/lib/relatorios";

type Opcao = { id: string; nome: string };

type FiltrosResumoExecutivoProps = {
  analistas: Opcao[];
  tipos: Opcao[];
  parcerias: Opcao[];
  filtros: FiltrosRelatorio;
};

export default function FiltrosResumoExecutivo({
  analistas,
  tipos,
  parcerias,
  filtros,
}: FiltrosResumoExecutivoProps) {
  return (
    <form
      method="get"
      className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
    >
      <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
        De
        <input
          type="date"
          name="de"
          defaultValue={filtros.de ?? ""}
          className="rounded border border-gray-300 bg-transparent px-2 py-1 text-sm dark:border-gray-600 dark:text-gray-100"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
        Até
        <input
          type="date"
          name="ate"
          defaultValue={filtros.ate ?? ""}
          className="rounded border border-gray-300 bg-transparent px-2 py-1 text-sm dark:border-gray-600 dark:text-gray-100"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
        Analista
        <select
          name="analistaId"
          defaultValue={filtros.analistaId ?? ""}
          className="rounded border border-gray-300 bg-transparent px-2 py-1 text-sm dark:border-gray-600 dark:text-gray-100 dark:[color-scheme:dark]"
        >
          <option value="">Todos</option>
          {analistas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
        Turno
        <select
          name="turno"
          defaultValue={filtros.turno ?? ""}
          className="rounded border border-gray-300 bg-transparent px-2 py-1 text-sm dark:border-gray-600 dark:text-gray-100 dark:[color-scheme:dark]"
        >
          <option value="">Todos</option>
          {TURNOS.map((t) => (
            <option key={t} value={t}>
              {TURNO_LABELS[t]}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
        Origem
        <select
          name="tipoId"
          defaultValue={filtros.tipoId ?? ""}
          className="rounded border border-gray-300 bg-transparent px-2 py-1 text-sm dark:border-gray-600 dark:text-gray-100 dark:[color-scheme:dark]"
        >
          <option value="">Todos</option>
          {tipos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
        Parceria
        <select
          name="parceriaId"
          defaultValue={filtros.parceriaId ?? ""}
          className="rounded border border-gray-300 bg-transparent px-2 py-1 text-sm dark:border-gray-600 dark:text-gray-100 dark:[color-scheme:dark]"
        >
          <option value="">Todas</option>
          {parcerias.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </label>
      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Filtrar
        </button>
        <a
          href="/relatorios/executivo"
          className="flex items-center text-sm text-gray-400 hover:text-gray-600 hover:underline dark:text-gray-500 dark:hover:text-gray-400"
        >
          Limpar
        </a>
      </div>
    </form>
  );
}
