import { isStatusOcorrencia, type StatusOcorrencia } from "@/lib/status";
import { isTurno } from "@/lib/turno";
import { inicioDoDiaBR, fimDoDiaBR } from "@/lib/dataHoraBR";

export type SearchParamsRelatorio = Record<string, string | string[] | undefined>;

export type FiltrosRelatorio = {
  de?: string;
  ate?: string;
  analistaId?: string;
  turno?: string;
  status: StatusOcorrencia[];
  tipoId?: string;
  parceriaId?: string;
};

function pick(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export function parseFiltros(sp: SearchParamsRelatorio): FiltrosRelatorio {
  const statusRaw = sp.status;
  const status = (Array.isArray(statusRaw) ? statusRaw : statusRaw ? [statusRaw] : []).filter(
    isStatusOcorrencia,
  );
  const turno = pick(sp.turno);

  return {
    de: pick(sp.de) || undefined,
    ate: pick(sp.ate) || undefined,
    analistaId: pick(sp.analistaId) || undefined,
    turno: turno && isTurno(turno) ? turno : undefined,
    status,
    tipoId: pick(sp.tipoId) || undefined,
    parceriaId: pick(sp.parceriaId) || undefined,
  };
}

const IDADE_MAXIMA_PADRAO_DIAS = 7;

export function temAlgumFiltro(filtros: FiltrosRelatorio): boolean {
  return Boolean(
    filtros.de ||
      filtros.ate ||
      filtros.analistaId ||
      filtros.turno ||
      filtros.status.length > 0 ||
      filtros.tipoId ||
      filtros.parceriaId,
  );
}

function haDiasAtras(dias: number): Date {
  return new Date(new Date().getTime() - dias * 24 * 60 * 60 * 1000);
}

// Sem nenhum filtro escolhido, limita a listagem às ocorrências mais
// recentes (últimos 7 dias) para manter os relatórios enxutos por padrão.
// Assim que qualquer filtro é aplicado (inclusive um período específico),
// esse limite deixa de valer e ocorrências mais antigas voltam a aparecer.
export function montarWhereOcorrencia(filtros: FiltrosRelatorio) {
  return {
    ...(filtros.de || filtros.ate
      ? {
          createdAt: {
            ...(filtros.de ? { gte: inicioDoDiaBR(filtros.de) } : {}),
            ...(filtros.ate ? { lte: fimDoDiaBR(filtros.ate) } : {}),
          },
        }
      : !temAlgumFiltro(filtros)
        ? { createdAt: { gte: haDiasAtras(IDADE_MAXIMA_PADRAO_DIAS) } }
        : {}),
    ...(filtros.analistaId ? { analistaId: filtros.analistaId } : {}),
    ...(filtros.turno ? { analista: { turno: filtros.turno } } : {}),
    ...(filtros.status.length > 0 ? { status: { in: filtros.status } } : {}),
    ...(filtros.tipoId ? { tipoId: filtros.tipoId } : {}),
    ...(filtros.parceriaId ? { parcerias: { some: { id: filtros.parceriaId } } } : {}),
  };
}

export function buildQueryString(sp: SearchParamsRelatorio): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (Array.isArray(value)) {
      for (const v of value) if (v) qs.append(key, v);
    } else if (value) {
      qs.append(key, value);
    }
  }
  return qs.toString();
}
