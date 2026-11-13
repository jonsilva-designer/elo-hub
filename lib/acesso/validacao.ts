// Textos e validações das telas de acesso (parte 1, 5.6 a 5.8). Os textos são provisórios (DT-03).

export const MENSAGENS = {
  emailVazio: 'Informe o e-mail.',
  emailInvalido: 'Informe um e-mail válido.',
  senhaVazia: 'Informe a senha.',
  credenciaisIncorretas: 'E-mail ou senha incorretos.',
  usuarioInativo: 'Acesso negado: este usuário está inativo. Fale com o Administrador da ELO.',
  senhaCurta: 'A senha precisa ter pelo menos 8 caracteres.',
  senhasDiferentes: 'As senhas não são iguais.',
} as const

const FORMATO_DE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** A mensagem de erro do e-mail, ou undefined se estiver certo. Os espaços nas pontas não contam. */
export function validarEmail(email: string): string | undefined {
  const limpo = email.trim()
  if (!limpo) return MENSAGENS.emailVazio
  if (!FORMATO_DE_EMAIL.test(limpo)) return MENSAGENS.emailInvalido
  return undefined
}

/** Os erros por campo do login. Qualquer senha não vazia serve no protótipo. */
export function validarEntrada(email: string, senha: string): { email?: string; senha?: string } {
  const erros: { email?: string; senha?: string } = {}
  const erroDoEmail = validarEmail(email)
  if (erroDoEmail) erros.email = erroDoEmail
  if (!senha) erros.senha = MENSAGENS.senhaVazia
  return erros
}

/** O mínimo de 8 caracteres vem da arquitetura (seção 6). Os dois erros podem vir juntos. */
export function validarNovaSenha(senha: string, confirmacao: string): { senha?: string; confirmacao?: string } {
  const erros: { senha?: string; confirmacao?: string } = {}
  if (senha.length < 8) erros.senha = MENSAGENS.senhaCurta
  if (confirmacao !== senha) erros.confirmacao = MENSAGENS.senhasDiferentes
  return erros
}
