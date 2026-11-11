import { revalidatePath } from "next/cache";

// As Ocorrências ficam divididas em duas homes (Ongoing em "/" e Qualidade
// App em "/ocorrencias-qualidade-app", ver src/app/page.tsx e
// src/app/ocorrencias-qualidade-app/page.tsx) sobre a mesma tabela — uma
// ação (ocorrência, evento, evidência ou aviso) não sabe de qual das duas
// telas ela partiu, então invalida as duas sempre.
export function revalidarHomesOcorrencias() {
  revalidatePath("/");
  revalidatePath("/ocorrencias-qualidade-app");
}
