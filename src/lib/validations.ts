import { z } from "zod";
import { TURNOS } from "@/lib/turno";
import { STATUS_OCORRENCIA } from "@/lib/status";
import { MODELOS_AVISO } from "@/lib/aviso";
import { CRITICIDADES } from "@/lib/criticidade";

export const nomeSchema = z
  .string()
  .trim()
  .min(1, "Nome é obrigatório")
  .max(120, "Nome muito longo");

export const emailSchema = z.string().trim().min(1, "Email é obrigatório").email("Email inválido");

export const turnoSchema = z.enum(TURNOS, { message: "Turno inválido" });

export const statusOcorrenciaSchema = z.enum(STATUS_OCORRENCIA, { message: "Status inválido" });

export const analistaSchema = z.object({
  nome: nomeSchema,
  email: emailSchema,
  turno: turnoSchema,
});

export const empresaSchema = z.object({
  nome: nomeSchema,
  parceriaId: z.string().trim().min(1, "Selecione uma parceria"),
});

export const recursoSchema = z.object({
  nome: nomeSchema,
  ambienteInfraId: z.string().trim().min(1, "Selecione um ambiente"),
});

export const dataHoraLocalSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Informe data e hora válidas")
  .refine((v) => !Number.isNaN(new Date(`${v}:00-03:00`).getTime()), "Informe data e hora válidas");

export const avisoSchema = z
  .object({
    modelo: z.enum(MODELOS_AVISO, { message: "Selecione um modelo válido" }),
    descricao: z.string().trim().min(1, "Descreva o aviso").max(2000, "Descrição muito longa"),
    expiraEm: dataHoraLocalSchema,
  })
  .refine((d) => new Date(`${d.expiraEm}:00-03:00`).getTime() > Date.now(), {
    message: "Escolha uma data e hora futura para o aviso expirar.",
    path: ["expiraEm"],
  });

export const criticidadeSchema = z.enum(CRITICIDADES, { message: "Selecione a criticidade" });

export const novaOcorrenciaSchema = z.object({
  tipoId: z.string().trim().min(1, "Selecione um tipo"),
  criticidade: criticidadeSchema,
  titulo: z.string().trim().min(1, "Descreva a ocorrência").max(500),
  ticket: z.string().trim().max(120).optional().or(z.literal("")),
  inicio: dataHoraLocalSchema,
});

export const comentarioEventoSchema = z
  .string()
  .trim()
  .min(1, "Comentário é obrigatório")
  .max(4000, "Comentário muito longo");

export const novaPassagemTurnoSchema = z.object({
  observacoes: z.string().trim().max(4000, "Observações muito longas").optional().or(z.literal("")),
});

export const normalizacaoOcorrenciaSchema = z.object({
  causa: z.string().trim().min(1, "Informe a causa da ocorrência.").max(300, "Descrição da causa muito longa"),
  solucao: z
    .string()
    .trim()
    .min(1, "Informe a solução da ocorrência.")
    .max(300, "Descrição da solução muito longa"),
  criticidade: criticidadeSchema,
  fim: dataHoraLocalSchema,
});
