import type { PassoRoteiroTeste } from "./definicoes";

// Extraído do PDF "Teste Mobile V4". Dois códigos do PDF original aparecem
// duplicados com conteúdos diferentes (Mobile-005 e Mobile-0024) — aqui
// desambiguados com sufixo "a"/"b", já que "codigo" precisa ser único (chave
// no banco, key do React e nome de campo no FormData).
export const PASSOS_TESTE_MOBILE: PassoRoteiroTeste[] = [
  {
    codigo: "Mobile-001",
    descricao:
      "Tela de login: Validar Fluxo de login do usuário com credenciais corretas. Dado que o usuário esteja na tela de login, E digite credenciais validas nos campos de e-mail e senha, E clique no botão Entrar, Então o usuário é logado com sucesso, E é redirecionado para página de seleção de perfil.",
  },
  {
    codigo: "Mobile-002",
    descricao:
      "Tela de login: Validar Fluxo de login do usuário com credenciais invalidas. Dado que o usuário esteja na tela de login, E digite credenciais validas nos campos de e-mail e senha, E clique no botão Entrar, Então o usuário não consegue logar na aplicação, E é exibido mensagem de erro E-mail e senhas incorretas.",
  },
  {
    codigo: "Mobile-003",
    descricao:
      "Validar fluxo de recuperação de senha. Dado que o usuário esteja na tela de login, Quando clicar no campo de recuperação de senha, E digitar o email para recuperação de senha, Então é exibido email com o botão para recuperar senha, E realizar a troca de nova senha, Então usuário consegue realizar autenticação com a nova senha.",
  },
  {
    codigo: "Mobile-004",
    descricao:
      "Tela Home: Validar a exibição dos elementos (banner hero, carrosséis, canais ao vivo, continuar assistindo). Dado que o usuário selecione um perfil de usuário, E esteja na tela Home, Então deve ser exibido para ele os elementos da página sem intermitência.",
  },
  {
    codigo: "Mobile-005a",
    descricao:
      "Tela Home: Validar acesso a conteúdo via banner hero. Dado que o usuário esteja na página home, E visualizar o banner hero, Quando clicar no botão ver detalhes, Então ele é redirecionado para página do conteúdo acessado.",
  },
  {
    codigo: "Mobile-005b",
    descricao:
      "Tela Home: Validar exibição do fluxo do carrossel Continuar assistindo. Dado que o usuário esteja na tela Home, E visualizar carrossel de continuar assistindo, Então é exibido todos os conteúdos assistidos que não foram concluídos por ele.",
  },
  {
    codigo: "Mobile-006",
    descricao:
      "Tela Filmes: Validar exibição de conteúdos VOD Filmes. Dado que o usuário esteja logado na plataforma, Quando ele clicar na aba Filmes, Então o sistema deve exibir a lista de conteúdos disponíveis, E os conteúdos devem estar carregados corretamente.",
  },
  {
    codigo: "Mobile-007",
    descricao:
      "Tela Filmes: Validar informações e reprodução de conteúdos VOD Filmes. Dado que o usuário esteja na aba, Quando clicar no conteúdo, Então a tela é carregada com os elementos do VOD, Quando clicar na opção assistir, Então conteúdo é reproduzido na aplicação, E usuário consegue visualizar opções do player.",
  },
  {
    codigo: "Mobile-008",
    descricao:
      "Tela Series: Validar exibição de conteúdos VOD Series. Dado que o usuário esteja logado na plataforma, Quando clicar na aba Series, Então é redirecionado para página de conteúdo de series, E conteúdos são carregados corretamente sem erro.",
  },
  {
    codigo: "Mobile-009",
    descricao:
      "Tela Series: Validar informações e reprodução de conteúdos VOD Series. Dado que o usuário esteja na aba series, Quando clicar no conteúdo, Então página é carregada com os elementos do VOD, Quando clicar na opção assistir, Então conteúdo é reproduzido na aplicação, E usuário consegue visualizar opções do player.",
  },
  {
    codigo: "Mobile-0010",
    descricao:
      "Tela Ao vivo: Validar navegação de categorias da aba Ao vivo. Dado que o usuário esteja na aba Ao vivo, Quando navegar pelos filtros, Então são exibidas todas as categorias de canais ao vivo corretamente.",
  },
  {
    codigo: "Mobile-0011",
    descricao:
      "Tela Ao vivo: Validar verificação da programação do EPG. Dado que eu esteja na aba Ao vivo, E visualize o EPG dos canais, Então a programação dos canais é exibida no horário atual e com o nome transmissão atual/programação indisponível.",
  },
  {
    codigo: "Mobile-0012",
    descricao:
      "Tela Ao vivo: Validar fluxo de reprodução de canal ao vivo. Dado que eu esteja na aba Ao vivo, Quando clicar em um canal ao vivo, Então o canal é reproduzido corretamente, E é exibida a barra e configurações do player.",
  },
  {
    codigo: "Mobile-0013",
    descricao:
      "Tela de player VOD: Validar fluxo de reprodução de canal ao vivo. Dado que eu esteja na aba Ao vivo, Quando clicar em um canal ao vivo, Então o pre-roll é exibido, E transmissão de canal é iniciada.",
  },
  {
    codigo: "Mobile-0014",
    descricao:
      "Tela de player VOD: Validar exibição de informações durante a reprodução de VOD. Dado que esteja na tela de player de canal Ao vivo, Quando realizar alguma ação durante a reprodução, Então título e configurações do canal são exibidos normalmente.",
  },
  {
    codigo: "Mobile-0015",
    descricao:
      "Tela de player VOD: Validar avanço e retrocesso do vídeo manualmente. Dado que esteja na tela de player de canal Ao vivo, Quando realizar ação de avançar e retroceder manualmente, Então canal retrocede e avança conforme definido.",
  },
  {
    codigo: "Mobile-0016",
    descricao:
      "Tela de player VOD: Validar reprodução da ação de alterar idioma e legenda. Dado que esteja na tela de player de canal Ao vivo, Quando clicar no botão de áudio e legendas do player, E alterar idioma e legenda atuais, Então ocorre a ação de troca de idioma e legendas.",
  },
  {
    codigo: "Mobile-0017",
    descricao:
      "Tela de player VOD series: Validar avanço para próximo episódio via botão. Dado que esteja na tela de player de canal Ao vivo, Quando clicar no ícone de botão próximo episódio, Então o usuário é redirecionado para o episódio seguinte, E é exibido configurações do player.",
  },
  {
    codigo: "Mobile-0018",
    descricao:
      "Tela de VOD: Validar exibição de elementos do VOD. Dado que o usuário esteja na tela de filmes/series, Quando clicar em um conteúdo, E clicar no ícone de informação de conteúdo, Então é exibida tela com informações de VOD.",
  },
  {
    codigo: "Mobile-0019",
    descricao:
      "Tela de VOD: Validar ação de adicionar e remover conteúdo da aba minha lista. Dado que o usuário esteja na tela de conteúdo, Quando clicar no ícone adicionar/remover da Minha Lista, E usuário acessar a aba minha lista, Então é exibida lista de conteúdos adicionados ou mensagem de lista vazia caso esteja sem conteúdos adicionados.",
  },
  {
    codigo: "Mobile-0020",
    descricao:
      "Tela de VOD: Validar exibição de conteúdo pós visualizar sugestões para você. Dado que o usuário esteja na aba home/conteúdos, E visualize o carrossel/a opção sugestões para você, Então é exibida lista de conteúdos sugeridos para o usuário.",
  },
  {
    codigo: "Mobile-0021",
    descricao:
      "Tela de busca: Validar exibição de elementos na tela de pesquisar. Dado que o usuário esteja na aba de pesquisar, Então é exibido campo de pesquisa, lista de conteúdos e teclado para busca de conteúdo.",
  },
  {
    codigo: "Mobile-0022",
    descricao:
      "Tela de busca: Validar execução da ação de busca de conteúdo. Dado que o usuário esteja na aba de pesquisar, Quando digitar um nome de conteúdo válido, Então é exibido conteúdo pesquisado.",
  },
  {
    codigo: "Mobile-0023",
    descricao:
      "Tela de busca: Validar exibição de mensagem de conteúdo não encontrado. Dado que o usuário esteja na aba de pesquisar, Quando digitar um nome de conteúdo inválido, Então é exibida mensagem de conteúdo não encontrado.",
  },
  {
    codigo: "Mobile-0024a",
    descricao:
      'Tela Minha lista: Validar exibição de conteúdos pós adicionar a minha lista. Dado que o usuário tenha adicionado um conteúdo a "minha lista", Quando clicar na aba "Minha lista", Então todos os conteúdos adicionados são exibidos.',
  },
  {
    codigo: "Mobile-0024b",
    descricao:
      'Tela Minha lista: Validar exibição de mensagem com lista estando vazia. Dado que o usuário não tenha adicionado um conteúdo a "minha lista", Quando clicar na aba "Minha lista", Então é exibida mensagem "sua lista está vazia".',
  },
  {
    codigo: "Mobile-0025",
    descricao:
      "Tela Meu perfil: Validar ação de deslogar pós selecionar a opção Sair da conta. Dado que o usuário esteja logado, E acesse a aba Minha conta, Quando clicar na opção Sair, E continuar o fluxo de sair da plataforma, Então usuário é deslogado da plataforma, E é redirecionado à tela inicial.",
  },
  {
    codigo: "Mobile-0026",
    descricao:
      "Tela de perfil de usuário: Validar fluxo de criação de perfil. Dado que o usuário esteja na aba home, Quando clicar no ícone de perfil de usuário, Clicar na opção editar perfil, E clicar na opção Adicionar perfil, Quando digitar o nome/tipo de perfil, Então usuário é redirecionado para página de seleção de perfil, E exibe perfil novo e mensagem Perfil novo criado.",
  },
  {
    codigo: "Mobile-0027",
    descricao:
      "Tela de perfil de usuário: Validar reprodução de conteúdo perfil Kids. Dado que o usuário esteja logado em um perfil kids, Quando clicar para reproduzir um conteúdo, Então conteúdo Kids é reproduzido com sucesso, E é exibido configurações padrão do player.",
  },
  {
    codigo: "Mobile-0028",
    descricao:
      "Tela de perfil de usuário: Validar fluxo de troca de classificação indicativa do perfil de usuário (12 anos, 14 anos, 16 anos, 18 anos). Dado que o usuário esteja logado na aplicação no perfil de usuário principal, E acesse a página web, Quando clicar na opção Gerenciar perfis, E clicar na opção editar perfil, E alterar classificação indicativa do perfil secundário, E selecionar o perfil, Então é alterada a classificação indicativa com sucesso, E conteúdos exibidos são referentes à classificação indicativa atual.",
  },
  {
    codigo: "Mobile-0029",
    descricao:
      'Tela Home: Validar fluxo da aba "Continuar assistindo". Dado que o usuário esteja na aba home, E visualize o carrossel continuar assistindo, Quando clicar em um conteúdo listado, Então conteúdo é reproduzido do ponto aonde foi encerrado.',
  },
  {
    codigo: "Mobile-0030",
    descricao:
      'Tela de perfil de usuário: Validar fluxo de exclusão de perfil de usuário. Dado que o usuário esteja na aba de edição de perfil de usuário, Quando selecionar o perfil desejado, E clicar no botão excluir perfil, Então é exibida mensagem "perfil excluído com sucesso".',
  },
];
