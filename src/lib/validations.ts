import { z } from "zod";
import { TURNOS } from "@/lib/turno";
import { STATUS_OCORRENCIA } from "@/lib/status";

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

export const dataHoraLocalSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Informe data e hora válidas")
  .refine((v) => !Number.isNaN(new Date(`${v}:00-03:00`).getTime()), "Informe data e hora válidas");

export const novaOcorrenciaSchema = z.object({
  tipoId: z.string().trim().min(1, "Selecione um tipo"),
  titulo: z.string().trim().min(1, "Descreva a ocorrência").max(500),
  ticket: z.string().trim().max(120).optional().or(z.literal("")),
  inicio: dataHoraLocalSchema,
});

export const comentarioEventoSchema = z
  .string()
  .trim()
  .min(1, "Comentário é obrigatório")
  .max(4000, "Comentário muito longo");

export const normalizacaoOcorrenciaSchema = z
  .object({
    causaId: z.string().trim().nullable(),
    causaOutra: z.string().trim().max(300, "Descrição da causa muito longa"),
    solucaoId: z.string().trim().nullable(),
    solucaoOutra: z.string().trim().max(300, "Descrição da solução muito longa"),
    fim: dataHoraLocalSchema,
  })
  .refine((d) => Boolean(d.causaId) || d.causaOutra.length > 0, {
    message: "Informe a causa da ocorrência.",
    path: ["causaId"],
  })
  .refine((d) => Boolean(d.solucaoId) || d.solucaoOutra.length > 0, {
    message: "Informe a solução da ocorrência.",
    path: ["solucaoId"],
  });
