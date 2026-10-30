import type { RotinaTeste } from "./rotinas";
import { PASSOS_TESTE_WEB, NAVEGADORES_TESTE_WEB } from "./testeWeb";
import { PASSOS_TESTE_TV } from "./testeTv";
import { PASSOS_TESTE_MOBILE } from "./testeMobile";
import { BRANDS_TESTE, BRANDS_TESTE_MOBILE } from "./brand";
import { DISPOSITIVOS_TESTE_TV, DISPOSITIVOS_TESTE_MOBILE } from "./dispositivos";

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
  // Opções do campo Brand — cada rotina tem a sua própria lista (ex.: Teste
  // Mobile V4 tem uma marca a mais, "Awdio", que Web/TV não têm).
  brands: readonly string[];
  // Campo "Dispositivos" (multi-escolha) — presente e com sua própria lista
  // de opções só nas rotinas que têm esse campo (Teste TV, Teste Mobile).
  // Ausente (undefined) nas rotinas sem esse campo (ex.: Teste Web).
  dispositivos?: readonly string[];
  // Campo "Data" (opcional, data em que o teste foi executado) — distinto
  // de quando a execução foi salva no sistema (createdAt).
  usaData?: boolean;
};

// Só "TESTE_WEB", "TESTE_TV" e "TESTE_MOBILE_V4" têm roteiro definido por
// enquanto.
export const DEFINICOES_ROTEIRO_TESTE: Partial<Record<RotinaTeste, DefinicaoRoteiroTeste>> = {
  TESTE_WEB: {
    titulo: "Teste Web",
    subtitulo: "Realização dos testes em Chrome, Edge e Firefox.",
    passos: PASSOS_TESTE_WEB,
    secaoExtra: { titulo: "Navegadores", passos: NAVEGADORES_TESTE_WEB },
    brands: BRANDS_TESTE,
  },
  TESTE_TV: {
    titulo: "Teste TV V4",
    subtitulo:
      "Formulário para validação do roteiro de testes de TV. Objetivo: garantir que todas as funcionalidades principais do aplicativo estão funcionando conforme descrito em cada teste.",
    passos: PASSOS_TESTE_TV,
    brands: BRANDS_TESTE,
    dispositivos: DISPOSITIVOS_TESTE_TV,
    usaData: true,
  },
  TESTE_MOBILE_V4: {
    titulo: "Teste Mobile V4",
    subtitulo: "Realização dos testes em Mobile Android e iOS.",
    passos: PASSOS_TESTE_MOBILE,
    brands: BRANDS_TESTE_MOBILE,
    dispositivos: DISPOSITIVOS_TESTE_MOBILE,
  },
};

export function todosPassos(definicao: DefinicaoRoteiroTeste): PassoRoteiroTeste[] {
  return [...definicao.passos, ...(definicao.secaoExtra?.passos ?? [])];
}
