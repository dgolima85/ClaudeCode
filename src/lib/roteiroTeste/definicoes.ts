import type { RotinaTeste } from "./rotinas";
import { PASSOS_TESTE_WEB, NAVEGADORES_TESTE_WEB } from "./testeWeb";
import { PASSOS_TESTE_TV } from "./testeTv";

export type PassoRoteiroTeste = {
  codigo: string;
  descricao: string;
};

// Seção secundária de passos, exibida com um título próprio (ex.: os três
// navegadores do Teste Web) — mesma natureza de campo dos passos normais,
// só agrupados à parte visualmente.
export type SecaoExtraRoteiroTeste = {
  titulo: string;
  passos: PassoRoteiroTeste[];
};

export type DefinicaoRoteiroTeste = {
  titulo: string;
  subtitulo: string;
  // Passos numerados do roteiro (AUTH-WEB-001, TV-001, ...).
  passos: PassoRoteiroTeste[];
  secaoExtra?: SecaoExtraRoteiroTeste;
  // Campo "Dispositivos" (multi-escolha) — só o Teste TV tem, por enquanto.
  usaDispositivos?: boolean;
  // Campo "Data" (opcional, data em que o teste foi executado) — distinto
  // de quando a execução foi salva no sistema (createdAt).
  usaData?: boolean;
};

// Só "TESTE_WEB" e "TESTE_TV" têm roteiro definido por enquanto — "Teste
// Mobile V4" (ver rotinas.ts) aparece no seletor da Home mas ainda não tem
// um roteiro implementado.
export const DEFINICOES_ROTEIRO_TESTE: Partial<Record<RotinaTeste, DefinicaoRoteiroTeste>> = {
  TESTE_WEB: {
    titulo: "Teste Web",
    subtitulo: "Realização dos testes em Chrome, Edge e Firefox.",
    passos: PASSOS_TESTE_WEB,
    secaoExtra: { titulo: "Navegadores", passos: NAVEGADORES_TESTE_WEB },
  },
  TESTE_TV: {
    titulo: "Teste TV V4",
    subtitulo:
      "Formulário para validação do roteiro de testes de TV. Objetivo: garantir que todas as funcionalidades principais do aplicativo estão funcionando conforme descrito em cada teste.",
    passos: PASSOS_TESTE_TV,
    usaDispositivos: true,
    usaData: true,
  },
};

export function todosPassos(definicao: DefinicaoRoteiroTeste): PassoRoteiroTeste[] {
  return [...definicao.passos, ...(definicao.secaoExtra?.passos ?? [])];
}
