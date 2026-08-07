import { isStatusOcorrencia, type StatusOcorrencia } from "@/lib/status";
import { isTurno } from "@/lib/turno";

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

export function montarWhereOcorrencia(filtros: FiltrosRelatorio) {
  return {
    ...(filtros.de || filtros.ate
      ? {
          createdAt: {
            ...(filtros.de ? { gte: new Date(`${filtros.de}T00:00:00`) } : {}),
            ...(filtros.ate ? { lte: new Date(`${filtros.ate}T23:59:59`) } : {}),
          },
        }
      : {}),
    ...(filtros.analistaId ? { analistaId: filtros.analistaId } : {}),
    ...(filtros.turno ? { analista: { turno: filtros.turno } } : {}),
    ...(filtros.status.length > 0 ? { status: { in: filtros.status } } : {}),
    ...(filtros.tipoId ? { tipoId: filtros.tipoId } : {}),
    ...(filtros.parceriaId ? { parceriaId: filtros.parceriaId } : {}),
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
