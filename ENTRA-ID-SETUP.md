# Integração com Entra ID (Azure AD) — passo a passo para o administrador

Este documento é para o **administrador do Microsoft 365 / Entra ID** da empresa. Ele descreve exatamente o que precisa ser feito no Azure para que o sistema de Passagem de Turno consiga confirmar a identidade do usuário logado no Microsoft 365 antes de liberar o acesso — sem senha própria, apenas validando o login corporativo.

> Configuração validada em produção. Se você recebeu uma versão anterior deste documento mencionando plataforma "SPA" ou permissão "User.Read", desconsidere — a configuração abaixo é a que realmente funciona.

## O que esse pedido NÃO exige

Para deixar claro o escopo antes de aprovar:

- **Não precisa de client secret** — o app é do tipo "cliente público", autentica com PKCE, não guarda segredo nenhum.
- **Não precisa de permissão de aplicativo (app-only / API sem usuário logado)** — só permissões delegadas básicas (`openid`, `profile`, `email`), agindo em nome de quem está logado.
- **Não precisa de conta de serviço.**
- **Não acessa e-mail, arquivos, Teams, calendário nem nada do Microsoft 365** — o único uso é confirmar "esse usuário está autenticado no Entra ID da empresa" e ler nome/e-mail para casar com o cadastro de analista já existente no sistema. Não pedimos a permissão `User.Read` do Microsoft Graph — não é necessária para isso.

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

### 3. Configurar o Redirect URI como "Mobile and desktop applications"

Dentro do app criado: **Authentication → Add a platform → Mobile and desktop applications**.

> Importante: não use "Single-page application (SPA)" nem "Web". A troca do código de autorização por token é feita pelo nosso servidor (não por JavaScript rodando no navegador do usuário), e o tipo SPA aplica uma restrição de CORS no token endpoint que rejeita essa troca. "Web" exigiria um client secret, que não usamos.

Adicione em **Redirect URIs** (custom):

- Ambiente de desenvolvimento: `http://localhost:3000/api/auth/callback/microsoft-entra-id`
- Ambiente de produção: `https://<domínio-final-do-sistema>/api/auth/callback/microsoft-entra-id`

> A URL de produção depende de onde o sistema será hospedado. Se ainda não tiver certeza, cadastre só a de `localhost` por agora; adicionar a de produção depois é rápido e não exige recriar o app.

Clique em **Save**.

### 4. Habilitar "Allow public client flows"

Na mesma página (**Authentication**), role até **Advanced settings** no final e mude **"Allow public client flows"** para **Yes**. Salve.

Sem isso, o Entra ID recusa a troca do código de autorização por token (o app não tem client secret, então precisa dessa permissão explícita para autenticar só com PKCE).

### 5. Confirmar que nenhum client secret foi criado

Em **Certificates & secrets**, essa lista deve continuar **vazia**. Se alguém criar um secret por engano, apague — não será usado.

### 6. Permissões de API

Em **API permissions**, confirme que o app tem apenas (**Microsoft Graph → Delegated permissions**):

- `openid`
- `profile`
- `email`

Essas três costumam já vir habilitadas automaticamente para qualquer app registrado. **Não é necessário adicionar `User.Read`** nem nenhuma outra permissão do Microsoft Graph.

**Consentimento**: se o tenant estiver configurado para exigir aprovação de administrador em permissões delegadas (política comum em empresas), clique em **Grant admin consent for `<nome da organização>`** nessa mesma tela.

### 7. Anotar os dados para nos enviar de volta

Em **Overview** do app registrado, anote e envie para a equipe de desenvolvimento:

- **Application (client) ID** — identificador do app (não é segredo, pode compartilhar por e-mail/chat normalmente)
- **Directory (tenant) ID** — identificador da organização no Entra
- Confirmação de que o(s) Redirect URI(s) do passo 3 foram cadastrados
- Confirmação de que "Allow public client flows" foi habilitado (passo 4)
- Confirmação de que o admin consent foi concedido (se aplicável no passo 6)

## Se a empresa restringe login por IP/país (Conditional Access)

Se o Entra ID tiver uma política de Conditional Access bloqueando login fora de um país específico, o login pode falhar mesmo com tudo acima configurado corretamente — o sintoma é a autenticação e o MFA completarem normalmente (visíveis nos logs de sign-in), mas o sistema mostrar erro na volta. Isso acontece porque a chamada que troca o código por token é feita pelo nosso servidor de hospedagem, que por padrão pode rodar numa região diferente da exigida pela política. Isso é resolvido do nosso lado (fixando a região do servidor), sem precisar afrouxar a política do Conditional Access — se isso acontecer, nos avise.

## Depois da aprovação

Assim que tivermos esses dados, o fluxo do lado do sistema fica assim:

1. Usuário clica em "Entrar com Microsoft" na tela de login do sistema de Passagem de Turno.
2. É redirecionado para a tela de login do Microsoft/Entra ID (a mesma que ele já usa para e-mail, Teams etc.).
3. Faz login normalmente (com MFA, se a empresa exigir — isso é controlado pelas políticas do tenant, não por nós).
4. O Entra devolve o navegador para o sistema com a confirmação de identidade.
5. O sistema valida essa confirmação e libera a Passagem de Turno, casando o e-mail retornado com o cadastro de analista já existente (cadastrado previamente em Administração → Analistas).

Nenhuma senha do sistema é armazenada nem trafega por fora do login oficial da Microsoft.
