# Integração com Entra ID (Azure AD) — passo a passo para o administrador

Este documento é para o **administrador do Microsoft 365 / Entra ID** da empresa. Ele descreve exatamente o que precisa ser feito no Azure para que o sistema de Passagem de Turno consiga confirmar a identidade do usuário logado no Microsoft 365 antes de liberar o acesso — sem senha própria, apenas validando o login corporativo.

## O que esse pedido NÃO exige

Para deixar claro o escopo antes de aprovar:

- **Não precisa de client secret** — o app é do tipo "cliente público" (SPA), autentica com PKCE, não guarda segredo nenhum.
- **Não precisa de permissão de aplicativo (app-only / API sem usuário logado)** — só permissões delegadas básicas, agindo em nome de quem está logado.
- **Não precisa de conta de serviço.**
- **Não acessa e-mail, arquivos, Teams, calendário nem nada do Microsoft 365** — o único uso é confirmar "esse usuário está autenticado no Entra ID da empresa" e ler nome/e-mail (UPN) para casar com o cadastro de analista já existente no sistema.
- **Não precisa de nada no lado de rede/firewall** — é só um redirect de navegador para `login.microsoftonline.com` e volta.

Ou seja, é o registro mais restrito possível: um "crachá" de identidade, não uma integração de dados.

## Passo a passo no Azure

### 1. Acessar o Entra admin center

[entra.microsoft.com](https://entra.microsoft.com) (ou pelo portal do Azure, em **Microsoft Entra ID**).

### 2. Criar o registro do aplicativo

**Identity → Applications → App registrations → New registration**

- **Name**: `Passagem de Turno - NOC/VOC` (ou outro nome que identifique o sistema)
- **Supported account types**: `Accounts in this organizational directory only (Single tenant)` — o sistema é só para uso interno da empresa, não precisa aceitar contas de outras organizações nem pessoais.
- **Redirect URI**: deixe em branco por enquanto (configuramos no passo 3, com o tipo certo de plataforma).
- Clique em **Register**.

### 3. Configurar o Redirect URI como SPA

Dentro do app criado: **Authentication → Add a platform → Single-page application**.

Adicione as URLs abaixo (pode adicionar mais de uma, uma por linha):

- Ambiente de desenvolvimento: `http://localhost:3000/login/entra/callback`
- Ambiente de produção: `https://<domínio-final-do-sistema>/login/entra/callback`

> A URL de produção depende de onde o sistema será hospedado (ainda não está fixada — pode ser algo como `https://passagem-turno.vercel.app` ou um domínio próprio da empresa). Se ainda não tiver certeza, cadastre só a de `localhost` por agora; adicionar a de produção depois é rápido e não exige recriar o app.

Nessa mesma tela, em **Implicit grant and hybrid flows**, **deixe as duas caixas desmarcadas** (Access tokens e ID tokens) — o fluxo usado é Authorization Code + PKCE, não precisa do fluxo implícito (mais antigo e menos seguro).

Clique em **Save**.

### 4. Confirmar que nenhum client secret foi criado

Em **Certificates & secrets**, essa lista deve continuar **vazia**. Se alguém criar um secret por engano, apague — não será usado (e não deveria existir em um app 100% client-side).

### 5. Permissões de API

Em **API permissions**, o app já vem por padrão com:

- `Microsoft Graph → User.Read` (delegada)

Adicione também, se não estiverem lá (**Add a permission → Microsoft Graph → Delegated permissions**):

- `openid`
- `profile`
- `email`

Essas três costumam já vir habilitadas automaticameante para qualquer app. Não é necessário nenhum escopo além desses quatro.

**Consentimento**: se o tenant estiver configurado para exigir aprovação de administrador em permissões delegadas (política comum em empresas), clique em **Grant admin consent for `<nome da organização>`** nessa mesma tela. Sem isso, cada usuário veria uma tela de consentimento no primeiro login — funciona, mas o admin consent deixa a experiência mais limpa.

### 6. Anotar os dados para nos enviar de volta

Em **Overview** do app registrado, anote e envie para a equipe de desenvolvimento:

- **Application (client) ID** — identificador do app (não é segredo, pode compartilhar por e-mail/chat normalmente)
- **Directory (tenant) ID** — identificador da organização no Entra
- Confirmação de que o(s) Redirect URI(s) do passo 3 foram cadastrados
- Confirmação de que o admin consent foi concedido (se aplicável no passo 5)

## Depois da aprovação

Assim que tivermos esses dados, o fluxo do lado do sistema fica assim:

1. Usuário clica em "Entrar" na home do sistema de Passagem de Turno.
2. É redirecionado para a tela de login do Microsoft/Entra ID (a mesma que ele já usa para e-mail, Teams etc.).
3. Faz login normalmente (com MFA, se a empresa exigir — isso é controlado pelas políticas do tenant, não por nós).
4. O Entra devolve o navegador para o sistema com a confirmação de identidade.
5. O sistema valida essa confirmação e libera a Passagem de Turno, casando o e-mail retornado com o cadastro de analista já existente.

Nenhuma senha do sistema é armazenada nem trafega por fora do login oficial da Microsoft.
