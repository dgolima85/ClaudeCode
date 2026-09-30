import type { RotinaTeste } from "./rotinas";
import { PASSOS_TESTE_WEB, NAVEGADORES_TESTE_WEB } from "./testeWeb";

export type PassoRoteiroTeste = {
  codigo: string;
  descricao: string;
};

export type DefinicaoRoteiroTeste = {
  titulo: string;
  subtitulo: string;
  // Passos numerados do roteiro (AUTH-WEB-001, ...).
  passos: PassoRoteiroTeste[];
  // Mesma natureza de campo dos passos (Validado/Falha/Em Observação),
  // só exibidos numa seção própria — ex.: os três navegadores do Teste Web.
  navegadores: PassoRoteiroTeste[];
};

// Só "TESTE_WEB" tem roteiro definido por enquanto — as demais rotinas
// (ver rotinas.ts) aparecem no seletor da Home mas ainda não têm um roteiro
// implementado.
export const DEFINICOES_ROTEIRO_TESTE: Partial<Record<RotinaTeste, DefinicaoRoteiroTeste>> = {
  TESTE_WEB: {
    titulo: "Teste Web",
    subtitulo: "Realização dos testes em Chrome, Edge e Firefox.",
    passos: PASSOS_TESTE_WEB,
    navegadores: NAVEGADORES_TESTE_WEB,
  },
};

export function todosPassos(definicao: DefinicaoRoteiroTeste): PassoRoteiroTeste[] {
  return [...definicao.passos, ...definicao.navegadores];
}
