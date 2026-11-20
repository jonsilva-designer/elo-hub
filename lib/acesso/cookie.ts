// Cookie da sessão simulada do protótipo (parte 1, 5.2). Guarda só o id do usuário.
// Sem data de validade: vale até o navegador fechar ou até a pessoa clicar em Sair.
// Na Etapa 3, o Supabase Auth passa a cuidar da sessão.
export const NOME_DO_COOKIE = 'elo_sessao'

/** O cabeçalho em que o proxy passa adiante o endereço pedido, para o login voltar a ele se o cookie não valer mais. */
export const CABECALHO_DO_CAMINHO = 'x-elo-caminho'

export const OPCOES_DO_COOKIE = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
} as const
