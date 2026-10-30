import type { PassoRoteiroTeste } from "./definicoes";

// Passos copiados do formulário atual (Microsoft Lists) "Testes TV V4", pra
// manter o roteiro "as-is" nessa primeira versão.
export const PASSOS_TESTE_TV: PassoRoteiroTeste[] = [
  {
    codigo: "TV-001",
    descricao:
      'Tela de ativação: Validar fluxo de ativar conta via web/QR code. Dado que o usuário acesse a aplicação na tela Login por código e a página web https://play.watch.tv.br/ativar, E esteja na página de QR Code, Quando digitar o código exibido na TV no campo de ativar conta, E clicar no botão ativar, Então o usuário recebe mensagem de dispositivo ativado com sucesso, E usuário é redirecionado para página home.',
  },
  {
    codigo: "TV-002",
    descricao:
      "Tela de login: Validar Fluxo de login do usuário com credenciais corretas. Dado que o usuário esteja na página de login, E digite credenciais validas nos campos de e-mail e senha, E clique no botão Entrar, Então o usuário é logado com sucesso, E é redirecionado para página de seleção de perfil.",
  },
  {
    codigo: "TV-003",
    descricao:
      "Tela de login: Validar Fluxo de login do usuário com credenciais invalidas. Dado que o usuário esteja na página de login, E digite credenciais validas nos campos de e-mail e senha, E clique no botão Entrar, Então o usuário não consegue logar na aplicação, E é exibido mensagem de erro E-mail e senhas incorretas.",
  },
  {
    codigo: "TV-004",
    descricao:
      'Tela de recuperação de senha: Validar fluxo de recuperação de senha. Dado que o usuário esteja na página de login, Quando clicar no campo de recuperação de senha, E copiar a url https://play.watch.tv.br/login/esqueci-minha-senha digitando o email e clicar em enviar, Quando clicar no botão para recuperar a senha.',
  },
  {
    codigo: "TV-005",
    descricao:
      "Tela Home: Validar a exibição dos elementos (banner hero, carrosséis, canais ao vivo, continuar assistindo). Dado que o usuário selecione um perfil de usuário, E esteja na página Home, Então deve ser exibido para ele os elementos da página sem intermitência.",
  },
  {
    codigo: "TV-006",
    descricao:
      "Tela Home: Validar acesso a conteúdo via banner hero. Dado que o usuário esteja na página home, E visualizar o banner hero, Quando clicar no botão ver detalhes, Então ele é redirecionado para página do conteúdo acessado.",
  },
  {
    codigo: "TV-007",
    descricao:
      "Tela Home: Validar exibição de canais favoritos. Dado que o usuário esteja na página home, E visualizar o carrossel de canais ao vivo, Quando clicar na opção favorito, Então é exibido os canais favoritados pelo usuário.",
  },
  {
    codigo: "TV-008",
    descricao:
      "Tela Home: Validar exibição do fluxo do carrossel Continuar assistindo. Dado que o usuário esteja na página Home, E visualizar carrossel de continuar assistindo, Então é exibido todos os conteúdos assistidos que não foram concluídos por ele.",
  },
  {
    codigo: "TV-009",
    descricao:
      "Tela Filmes: Validar exibição de conteúdos VOD Filmes. Dado que o usuário esteja logado na plataforma, Quando ele clicar na aba Filmes, Então o sistema deve exibir a lista de conteúdos disponíveis, E os conteúdos devem estar carregados corretamente.",
  },
  {
    codigo: "TV-0010",
    descricao:
      'Tela Filmes: Validar informações e reprodução de conteúdos VOD Filmes. Dado que o usuário esteja na aba, Quando clicar no conteúdo, Então página é carregada com os elementos do VOD, Quando clicar na opção assistir, Então conteúdo é reproduzido na aplicação, E usuário consegue visualizar opções do player.',
  },
  {
    codigo: "TV-0011",
    descricao:
      "Tela Series: Validar exibição de conteúdos VOD Series. Dado que o usuário esteja logado na plataforma, Quando clicar na aba Series, Então é redirecionado para página de conteúdo de series, E conteúdos são carregados corretamente sem erro.",
  },
  {
    codigo: "TV-0012",
    descricao:
      "Tela Series: Validar informações e reprodução de conteúdos VOD Series. Dado que o usuário esteja na aba series, Quando clicar no conteúdo, Então página é carregada com os elementos do VOD, Quando clicar na opção assistir, Então conteúdo é reproduzido na aplicação, E usuário consegue visualizar opções do player.",
  },
  {
    codigo: "TV-0013",
    descricao:
      "Tela Ao vivo: Validar navegação de categorias da aba Ao vivo. Dado que o usuário esteja na aba Ao vivo, Quando navegar pelos filtros, Então são exibidas todas as categorias de canais ao vivo corretamente.",
  },
  {
    codigo: "TV-0014",
    descricao:
      "Tela Ao vivo: Validar fluxo de favoritar canal. Dado que eu esteja na aba Ao vivo ou no player de canal ao vivo, Quando clicar no ícone de favoritar, E acesse a aba de favoritos, Então o canal é exibido na lista de favoritos por ele.",
  },
  {
    codigo: "TV-0015",
    descricao:
      "Tela Ao vivo: Validar verificação da programação do EPG. Dado que eu esteja na aba Ao vivo, E visualize o EPG dos canais, Então a programação dos canais é exibida no horário atual e com o nome transmissão atual/programação indisponível.",
  },
  {
    codigo: "TV-0016",
    descricao:
      "Tela Ao vivo: Validar fluxo de reprodução de canal ao vivo. Dado que eu esteja na aba Ao vivo, Quando clicar em um canal ao vivo, Então o canal é reproduzido corretamente, E é exibida a barra e configurações do player.",
  },
  {
    codigo: "TV-0017",
    descricao:
      "Tela de player VOD: Validar exibição de pre-roll pós iniciar reprodução de conteúdo. Dado que eu esteja na aba Ao vivo, Quando clicar em um canal ao vivo, Então o pre-roll é exibido, E transmissão de canal é iniciada.",
  },
  {
    codigo: "TV-0018",
    descricao:
      "Tela de player VOD: Validar exibição de informações durante a reprodução de VOD. Dado que esteja na tela de player de canal Ao vivo, Quando realizar alguma ação durante a reprodução, Então título e configurações do canal são exibidos normalmente.",
  },
  {
    codigo: "TV-0019",
    descricao:
      "Tela de player VOD: Validar avanço e retrocesso do vídeo via controle. Dado que esteja na tela de player de canal Ao vivo, Quando clicar nas setas esquerda e direita do controle remoto, Então canal retrocede e avança conforme definido pelo controle.",
  },
  {
    codigo: "TV-0020",
    descricao:
      "Tela de player VOD: Validar reprodução da ação de alterar idioma e legenda. Dado que esteja na tela de player de canal Ao vivo, Quando clicar no botão de áudio e legendas do player, E alterar idioma e legenda atuais, Então ocorre a ação de troca de idioma e legendas.",
  },
  {
    codigo: "TV-0021",
    descricao:
      "Tela de player VOD series: Validar avanço para próximo episódio via botão. Dado que esteja na tela de player de canal Ao vivo, Quando clicar no ícone de botão próximo episódio, Então o usuário é redirecionado para o episódio seguinte, E é exibido configurações do player.",
  },
  {
    codigo: "TV-0022",
    descricao:
      "Tela de player VOD series: Validar navegação entre episódios na tela de player. Dado que o usuário esteja na tela de player de VOD, Quando clicar na opção Lista de canais, Então usuário consegue navegar e selecionar episódios.",
  },
  {
    codigo: "TV-0023",
    descricao:
      "Tela de VOD: Validar exibição de elementos do VOD. Dado que o usuário esteja na tela de filmes/series, Quando clicar em um conteúdo, E clicar no ícone de informação de conteúdo, Então é exibida tela com informações de VOD.",
  },
  {
    codigo: "TV-0024",
    descricao:
      'Tela de VOD: Validar ação de adicionar e remover conteúdo da aba minha lista. Dado que o usuário esteja na tela de conteúdo, Quando clicar no ícone adicionar/remover da Minha Lista, E usuário acessar a aba minha lista, Então é exibida lista de conteúdos adicionados ou mensagem de lista vazia caso esteja sem conteúdos adicionados.',
  },
  {
    codigo: "TV-0025",
    descricao:
      "Tela de VOD: Validar exibição de conteúdo pós selecionar sugestões para você. Dado que o usuário esteja na aba home/conteúdos, E visualize o carrossel/clicar na opção sugestões para você, Então é exibida lista de conteúdos sugeridos para o usuário.",
  },
  {
    codigo: "TV-0026",
    descricao:
      "Tela de busca: Validar exibição de elementos na tela de pesquisar. Dado que o usuário esteja na aba de pesquisar, Então é exibido campo de pesquisa, lista de conteúdos e teclado para busca de conteúdo.",
  },
  {
    codigo: "TV-0027",
    descricao:
      "Tela de busca: Validar execução da ação de busca de conteúdo. Dado que o usuário esteja na aba de pesquisar, Quando digitar um nome de conteúdo válido, Então é exibido o conteúdo pesquisado.",
  },
  {
    codigo: "TV-0028",
    descricao:
      "Tela de busca: Validar exibição de mensagem de conteúdo não encontrado. Dado que o usuário esteja na aba de pesquisar, Quando digitar um nome de conteúdo inválido, Então é exibida mensagem de conteúdo não encontrado.",
  },
  {
    codigo: "TV-0029",
    descricao:
      'Tela Minha lista: Validar exibição de conteúdos pós adicionar a minha lista. Dado que o usuário tenha adicionado um conteúdo a "minha lista", Quando clicar na aba "Minha lista", Então todos os conteúdos adicionados são exibidos.',
  },
  {
    codigo: "TV-0030",
    descricao:
      'Tela Minha lista: Validar exibição de mensagem com lista estando vazia. Dado que o usuário não tenha adicionado um conteúdo a "minha lista", Quando clicar na aba "Minha lista", Então é exibida mensagem "sua lista está vazia".',
  },
  {
    codigo: "TV-0031",
    descricao:
      "Tela Minha conta: Validar ação de deslogar pós selecionar a opção Sair. Dado que o usuário esteja logado, E acesse a aba Minha conta, Quando clicar na opção Sair, E continuar o fluxo de sair da plataforma, Então usuário é deslogado da plataforma, E é redirecionado à tela de QR code.",
  },
  {
    codigo: "TV-0032",
    descricao:
      "Tela de perfil de usuário: Validar fluxo de criação de perfil. Dado que o usuário esteja na aba home, Quando clicar na tela de seleção de perfil, E clicar na opção Adicionar perfil, Quando digitar o nome/tipo de perfil, Então usuário é redirecionado para página de seleção de perfil, E exibe perfil novo e mensagem Perfil novo criado.",
  },
  {
    codigo: "TV-0033",
    descricao:
      "Tela de perfil de usuário: Validar reprodução de conteúdo perfil Kids. Dado que o usuário esteja logado em um perfil kids, Quando clicar para reproduzir um conteúdo, Então conteúdo Kids é reproduzido com sucesso, E é exibido configurações padrão do player.",
  },
  {
    codigo: "TV-0034",
    descricao:
      "Tela de perfil de usuário: Validar fluxo de troca de classificação indicativa do perfil de usuário (12 anos, 14 anos, 16 anos, 18 anos). Dado que o usuário esteja logado na aplicação no perfil de usuário principal, E acesse a página web, Quando clicar na opção Gerenciar perfis, E clicar na opção editar perfil, E alterar classificação indicativa do perfil secundário, E selecionar o perfil, Então é alterada a classificação indicativa com sucesso, E conteúdos exibidos são referentes à classificação indicativa atual.",
  },
  {
    codigo: "TV-0035",
    descricao:
      'Tela Home: Validar fluxo da aba "Continuar assistindo". Dado que o usuário esteja na aba home, E visualize o carrossel continuar assistindo, Quando clicar em um conteúdo listado, Então conteúdo é reproduzido do ponto aonde foi encerrado.',
  },
  {
    codigo: "TV-0036",
    descricao:
      "Tela Loja Apps: Validar fluxo de pesquisa de apps pela loja do dispositivo. Dado que o usuário esteja na tela inicial do dispositivo, E acesse/abra a opção de pesquisa da loja, E pesquisar o nome do aplicativo na loja, Então o aplicativo é exibido no dispositivo.",
  },
];
