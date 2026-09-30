export const BRANDS_TESTE = [
  "Watch TV",
  "Vero Video",
  "Giga+",
  "Ligga Play",
  "Alares Play",
  "Graça Play",
  "Evangelizar",
  "Desktop Play",
] as const;

export type BrandTeste = (typeof BRANDS_TESTE)[number];

export function isBrandTeste(value: string): value is BrandTeste {
  return (BRANDS_TESTE as readonly string[]).includes(value);
}
