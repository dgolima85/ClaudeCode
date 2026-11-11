// Rotinas de teste disponíveis no menu "Roteiro de Testes". Só "TESTE_WEB"
// tem um roteiro definido por enquanto (ver definicoes.ts) — as outras duas
// já aparecem no seletor, mas mostram "em breve" ao selecionar "Iniciar".
export const ROTINAS_TESTE = ["TESTE_WEB", "TESTE_TV", "TESTE_MOBILE_V4"] as const;

export type RotinaTeste = (typeof ROTINAS_TESTE)[number];

export const ROTINA_TESTE_LABELS: Record<RotinaTeste, string> = {
  TESTE_WEB: "Teste Web",
  TESTE_TV: "Teste TV",
  TESTE_MOBILE_V4: "Teste Mobile V4",
};

export function isRotinaTeste(value: string): value is RotinaTeste {
  return (ROTINAS_TESTE as readonly string[]).includes(value);
}
