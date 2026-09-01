import NextAuth from "next-auth";
import MicrosoftEntraID, {
  type MicrosoftEntraIDProfile,
} from "next-auth/providers/microsoft-entra-id";
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
  providers: [
    MicrosoftEntraID({
      // App Registration do tipo "cliente público" (SPA), sem client secret:
      // autentica só com PKCE. Sem isso, o Auth.js tentaria enviar um
      // client_secret que não existe e o Entra ID recusaria a troca do code
      // por token.
      client: { token_endpoint_auth_method: "none" },
      // Só identidade (claims do id_token: nome, e-mail): sem "User.Read",
      // que é o que faz o provider por padrão chamar o Microsoft Graph para
      // buscar a foto de perfil — não é o combinado com o Azure (acesso
      // restrito, sem nada de Microsoft 365).
      authorization: { params: { scope: "openid profile email" } },
      profile(profile: MicrosoftEntraIDProfile) {
        return { id: profile.sub, name: profile.name, email: profile.email, image: null };
      },
    }),
  ],
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
