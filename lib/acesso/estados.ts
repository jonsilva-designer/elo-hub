// Tipos e estados iniciais das ações de acesso. Ficam fora de acoes.ts porque um arquivo
// 'use server' só pode exportar funções assíncronas.

/** O que a ação de entrar devolve ao formulário (useActionState). */
export type EstadoEntrar = {
  /** O e-mail digitado, para o campo não ficar vazio depois de um erro. */
  email: string
  erros: { email?: string; senha?: string }
  /** Erro que não é de um campo: e-mail ou senha incorretos, ou usuário inativo. */
  erroGeral?: string
}

export const ESTADO_INICIAL_ENTRAR: EstadoEntrar = { email: '', erros: {} }

/** O que a ação de recuperar a senha devolve ao formulário. */
export type EstadoRecuperacao = { email: string; erro?: string; enviado: boolean }

export const ESTADO_INICIAL_RECUPERACAO: EstadoRecuperacao = { email: '', enviado: false }

/** O que a ação de definir a senha devolve ao formulário. */
export type EstadoDefinirSenha = { erros: { senha?: string; confirmacao?: string } }

export const ESTADO_INICIAL_DEFINIR_SENHA: EstadoDefinirSenha = { erros: {} }
