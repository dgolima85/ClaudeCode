export const RESULTADOS_TESTE = ["VALIDADO", "FALHA", "EM_OBSERVACAO"] as const;

export type ResultadoTeste = (typeof RESULTADOS_TESTE)[number];

export const RESULTADO_TESTE_LABELS: Record<ResultadoTeste, string> = {
  VALIDADO: "Validado",
  FALHA: "Falha",
  EM_OBSERVACAO: "Em Observação",
};

export const RESULTADO_TESTE_TEXT_COLOR: Record<ResultadoTeste, string> = {
  VALIDADO: "text-green-600 dark:text-green-400",
  FALHA: "text-red-600 dark:text-red-400",
  EM_OBSERVACAO: "text-amber-600 dark:text-amber-400",
};

export const RESULTADO_TESTE_DOT_COLOR: Record<ResultadoTeste, string> = {
  VALIDADO: "bg-green-500",
  FALHA: "bg-red-500",
  EM_OBSERVACAO: "bg-amber-500",
};

export function isResultadoTeste(value: string): value is ResultadoTeste {
  return (RESULTADOS_TESTE as readonly string[]).includes(value);
}
