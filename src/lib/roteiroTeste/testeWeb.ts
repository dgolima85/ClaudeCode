import type { PassoRoteiroTeste } from "./definicoes";

// Passos copiados do formulário atual (Microsoft Lists) "Teste Web", pra
// manter o roteiro "as-is" nessa primeira versão — ver AGENTS do time de
// Monitoria Contínua para qualquer alteração de conteúdo dos passos.
export const PASSOS_TESTE_WEB: PassoRoteiroTeste[] = [
  {
    codigo: "AUTH-WEB-001",
    descricao:
      'Na página de login, clique na opção "Esqueceu sua senha?" Acesse a caixa de e-mail onde foi recebida a mensagem de recuperação da Watch, abra a mensagem e clique em "Redefinir dados". Na tela de alteração de senhas, insira uma nova senha válida nos campos disponíveis e clique em "Alterar". Na tela de confirmação de "Senha alterada com sucesso", clique em "Entrar". Insira o e-mail e a nova senha de acesso.',
  },
  {
    codigo: "AUTH-WEB-002",
    descricao:
      'Acesse a plataforma e clique em "Entrar" ou "Login". Insira um e-mail e senha inválidos e clique no botão "Entrar". Acesse a plataforma novamente, clique em "Entrar" ou "Login", insira um e-mail e senha válidos e clique no botão "Entrar".',
  },
  {
    codigo: "AUTH-WEB-003",
    descricao:
      'Acesse a plataforma e clique em "Entrar" ou "Login". Insira um e-mail e senha válidos e clique no botão "Entrar". Acesse a plataforma novamente, clique em "Entrar" ou "Login", insira um e-mail e senha válidos e clique no botão "Entrar".',
  },
  {
    codigo: "PROFILE-WEB-004",
    descricao:
      'Na tela "Gerenciar Perfis", clique em "Novo Perfil". Na tela de criação de perfil, ative a opção "Tornar este perfil infantil" e salve o perfil criado. Acesse o perfil criado.',
  },
  {
    codigo: "PROFILE-WEB-005",
    descricao:
      'Na tela de gerenciamento de perfis, clique no botão "Editar perfil" e selecione um perfil para editar. Realize alterações no nome ou cadastre uma senha (PIN). Clique em "Salvar". Na tela de gerenciamento de perfis, clique no perfil que possui senha definida e insira a senha do perfil.',
  },
  {
    codigo: "GEN-WEB-006",
    descricao:
      'Na tela "Gerenciar Perfis", edite o perfil "KIDS" criado. Na seção "Restrições de Visualização", altere a classificação etária para 12, 14 ou 16 anos e salve as alterações no perfil. Acesse o perfil editado.',
  },
  {
    codigo: "PROFILE-WEB-007",
    descricao:
      'Na tela de gerenciamento de perfis, clique no botão "Editar perfil" e selecione um perfil para editar. Na tela de edição de perfil, clique no botão "Excluir perfil".',
  },
  {
    codigo: "GEN-WEB-008",
    descricao: "Navegue pela home logada",
  },
  {
    codigo: "PROFILE-WEB-009",
    descricao:
      'Selecione a aba de filmes. Escolha um filme, verifique as informações disponíveis (sinopse, classificação indicativa, duração do filme) e clique no botão "Assistir".',
  },
  {
    codigo: "CONTENT-WEB-010",
    descricao:
      'Em seguida, selecione a aba de séries e escolha uma série. Verifique as informações disponíveis (sinopse, classificação indicativa, temporadas) e clique no botão "Assistir".',
  },
  {
    codigo: "NAV-WEB-011",
    descricao:
      "Na home logada, navegue até o carrossel de canais ao vivo. Selecione três canais aleatórios para reprodução.",
  },
  {
    codigo: "GEN-WEB-012",
    descricao:
      'Na aba "Ao vivo", clique no menu suspenso ao lado de "Grade de programação" (se disponível) e verifique o retorno de cada categoria.',
  },
  {
    codigo: "NAV-WEB-013",
    descricao: "Na aba de canais ao vivo, selecione três canais aleatórios para reprodução.",
  },
  {
    codigo: "GEN-WEB-014",
    descricao:
      'Clique no botão "Adicionar à minha lista" ao lado do botão "Assistir" no banner Hero ou carrossel. Alternativamente, clique em um filme/série e depois no botão "Adicionar à minha lista".',
  },
  {
    codigo: "CONTENT-WEB-015",
    descricao:
      'Na home logada, clique na opção "Minha área" no cabeçalho. Em "Minha área", passe o mouse sobre um filme e clique no botão "Remover da lista".',
  },
  {
    codigo: "CONTENT-WEB-016",
    descricao:
      'Na home logada, navegue até o carrossel de "Continuar assistindo" e selecione um conteúdo presente no carrossel.',
  },
  {
    codigo: "CONTENT-WEB-017",
    descricao: "Selecione um filme/série pelo banner Hero ou carrossel e navegue até o final da página.",
  },
  {
    codigo: "NAV-WEB-018",
    descricao:
      "Reproduza um conteúdo com mais de um idioma disponível, alterne entre as opções de legendas e idiomas.",
  },
  {
    codigo: "GEN-WEB-019",
    descricao: 'Reproduza um conteúdo, clique no botão "Pausar", depois em "Retroceder 10s" e em "Avançar 10s".',
  },
  {
    codigo: "CONTENT-WEB-020",
    descricao:
      'Reproduza o episódio de uma série, clique no botão "Reiniciar" e em "Próximo episódio". Como alternativa, avance até os últimos 10 segundos do episódio e clique no card de "Próximo episódio".',
  },
  {
    codigo: "CONTENT-WEB-021",
    descricao: "Na home logada, clique no ícone de busca e digite o termo desejado na caixa de busca.",
  },
  {
    codigo: "GEN-WEB-022",
    descricao:
      "Acesse a plataforma em outros navegadores (Edge, Chrome ou Firefox) e execute os testes de login, navegação, reprodução de conteúdos e reprodução de três canais ao vivo.",
  },
];

// No formulário original os três navegadores vinham depois da "Nota". Na
// nossa versão a anotação é sempre o último campo (pedido do usuário), mas
// os navegadores continuam sendo o mesmo tipo de passo (Validado/Falha/Em
// Observação) que os demais — só ficam destacados visualmente por virem
// numa seção própria.
export const NAVEGADORES_TESTE_WEB: PassoRoteiroTeste[] = [
  { codigo: "CHROME", descricao: "Chrome" },
  { codigo: "EDGE", descricao: "Edge" },
  { codigo: "FIREFOX", descricao: "Firefox" },
];
