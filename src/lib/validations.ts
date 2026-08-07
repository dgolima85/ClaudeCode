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

export const novaOcorrenciaSchema = z.object({
  tipoId: z.string().trim().min(1, "Selecione um tipo"),
  titulo: z.string().trim().min(1, "Descreva a ocorrência").max(500),
  ticket: z.string().trim().max(120).optional().or(z.literal("")),
});

export const comentarioEventoSchema = z
  .string()
  .trim()
  .min(1, "Comentário é obrigatório")
  .max(4000, "Comentário muito longo");
