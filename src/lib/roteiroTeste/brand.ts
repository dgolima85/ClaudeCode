// Lista "base", reaproveitada pelo Teste Web e Teste TV. O Teste Mobile V4
// tem uma marca a mais (Awdio) — ver BRANDS_TESTE_MOBILE.
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

export const BRANDS_TESTE_MOBILE = [...BRANDS_TESTE, "Awdio"] as const;
