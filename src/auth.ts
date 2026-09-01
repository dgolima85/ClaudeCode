import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { prisma } from "@/lib/prisma";

// Vincula a conta Microsoft ao Analista já cadastrado pelo mesmo e-mail
// (comparação sem diferenciar maiúsculas/minúsculas, já que o e-mail do
// Entra ID nem sempre bate no mesmo case do que foi digitado em
// Administração → Analistas). Não cria Analista novo: se ninguém tiver
// esse e-mail cadastrado (ou estiver inativo), o login é recusado.
async function buscarAnalistaAtivoPorEmail(email: string) {
  return prisma.analista.findFirst({
    where: { email: { equals: email, mode: "insensitive" }, ativo: true },
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [MicrosoftEntraID],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const analista = await buscarAnalistaAtivoPorEmail(user.email);
      return Boolean(analista);
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const analista = await buscarAnalistaAtivoPorEmail(user.email);
        if (analista) token.analistaId = analista.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (typeof token.analistaId === "string") {
        session.analistaId = token.analistaId;
      }
      return session;
    },
  },
});

declare module "next-auth" {
  interface Session {
    analistaId?: string;
  }
}
