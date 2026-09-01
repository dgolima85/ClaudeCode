import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const COOKIE_NAME = "analistaId";

export async function setAnalistaLogado(analistaId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, analistaId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function limparSessao() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAnalistaLogado() {
  const sessaoMicrosoft = await auth();
  if (sessaoMicrosoft?.analistaId) {
    const analista = await prisma.analista.findUnique({
      where: { id: sessaoMicrosoft.analistaId },
    });
    if (analista?.ativo) return analista;
  }

  const cookieStore = await cookies();
  const id = cookieStore.get(COOKIE_NAME)?.value;
  if (!id) return null;

  const analista = await prisma.analista.findUnique({ where: { id } });
  if (!analista || !analista.ativo) return null;
  return analista;
}

export async function exigirAnalistaLogado() {
  const analista = await getAnalistaLogado();
  if (!analista) {
    throw new Error("Analista não identificado. Faça login novamente.");
  }
  return analista;
}
