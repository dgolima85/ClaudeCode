function escapeCsvField(value: string): string {
  if (/["\n;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Delimitador ";" e BOM UTF-8 para abrir corretamente no Excel em pt-BR.
export function toCsv(headers: string[], rows: string[][]): string {
  const linhas = [headers, ...rows].map((linha) => linha.map(escapeCsvField).join(";"));
  return "﻿" + linhas.join("\r\n");
}
