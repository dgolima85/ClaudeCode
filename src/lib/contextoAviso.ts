// Os dois quadros de Avisos (home "Ocorrências Ongoing" em "/" e home
// "Ocorrências Qualidade App" em "/ocorrencias-qualidade-app") funcionam de
// forma independente: um aviso criado em um dos quadros só aparece — e só
// pode ser editado/excluído — nesse mesmo quadro.
export const CONTEXTOS_AVISO = ["OCORRENCIAS_ONGOING", "OCORRENCIAS_QUALIDADE_APP"] as const;

export type ContextoAviso = (typeof CONTEXTOS_AVISO)[number];

export const CONTEXTO_AVISO_LABELS: Record<ContextoAviso, string> = {
  OCORRENCIAS_ONGOING: "Ocorrências Ongoing",
  OCORRENCIAS_QUALIDADE_APP: "Ocorrências Qualidade App",
};

export function isContextoAviso(value: string): value is ContextoAviso {
  return (CONTEXTOS_AVISO as readonly string[]).includes(value);
}
