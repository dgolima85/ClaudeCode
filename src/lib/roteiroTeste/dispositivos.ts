export const DISPOSITIVOS_TESTE = ["LG", "Toshiba", "Samsung", "Roku", "Fire TV", "ZTE"] as const;

export type DispositivoTeste = (typeof DISPOSITIVOS_TESTE)[number];

export function isDispositivoTeste(value: string): value is DispositivoTeste {
  return (DISPOSITIVOS_TESTE as readonly string[]).includes(value);
}
