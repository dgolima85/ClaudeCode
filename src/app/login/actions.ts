"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { limparSessao, setAnalistaLogado } from "@/lib/session";
import { signIn, signOut } from "@/auth";

export async function login(formData: FormData) {
  const analistaId = formData.get("analistaId");
  const redirectTo = formData.get("redirect");

  if (typeof analistaId !== "string" || !analistaId) {
    throw new Error("Selecione um analista para continuar.");
  }

  const analista = await prisma.analista.findUnique({ where: { id: analistaId } });
  if (!analista || !analista.ativo) {
    throw new Error("Analista inválido ou inativo.");
  }

  await setAnalistaLogado(analista.id);
  redirect(typeof redirectTo === "string" && redirectTo ? redirectTo : "/");
}

export async function entrarComMicrosoft(formData: FormData) {
  const redirectTo = formData.get("redirect");
  await signIn("microsoft-entra-id", {
    redirectTo: typeof redirectTo === "string" && redirectTo ? redirectTo : "/",
  });
}

export async function sair() {
  await limparSessao();
  await signOut({ redirectTo: "/login" });
}
