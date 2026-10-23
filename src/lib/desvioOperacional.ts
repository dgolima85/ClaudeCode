import { prisma } from "@/lib/prisma";
import { dataBR, inicioDoDiaBR } from "@/lib/dataHoraBR";

export const DESVIO_OPERACIONAL_ID = "singleton";

export type DesvioOperacionalInfo = {
  dias: number;
  recorde: number;
  ultimoDesvioEm: string;
};

/**
 * Diferença em dias de calendário (Brasília) entre duas datas — não é uma
 * diferença de 24h corridas, por isso o indicador "incrementa" sozinho
 * exatamente na virada do dia, sem precisar de nenhuma rotina agendada.
 */
export function diasEntreCalendario(dataAntiga: Date, dataNova: Date): number {
  const inicioAntiga = inicioDoDiaBR(dataBR(dataAntiga)).getTime();
  const inicioNova = inicioDoDiaBR(dataBR(dataNova)).getTime();
  return Math.round((inicioNova - inicioAntiga) / (24 * 60 * 60 * 1000));
}

/**
 * Lê o indicador "dias sem Desvio Operacional" — cria a linha singleton na
 * primeira leitura (com "agora" como último desvio) se ela ainda não
 * existir, já que não há como saber retroativamente quando foi o último
 * desvio antes desse recurso existir.
 */
export async function buscarDesvioOperacional(): Promise<DesvioOperacionalInfo> {
  const agora = new Date();
  const registro = await prisma.desvioOperacional.upsert({
    where: { id: DESVIO_OPERACIONAL_ID },
    create: { id: DESVIO_OPERACIONAL_ID, ultimoDesvioEm: agora, recordeDias: 0 },
    update: {},
  });

  const dias = diasEntreCalendario(registro.ultimoDesvioEm, agora);
  return {
    dias,
    // O recorde exibido já reflete o streak corrente, mesmo antes de um
    // reset "travar" ele como recorde salvo.
    recorde: Math.max(registro.recordeDias, dias),
    ultimoDesvioEm: registro.ultimoDesvioEm.toISOString(),
  };
}
