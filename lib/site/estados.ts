import type { ErrosSite } from './validacao'

// O estado das ações dos formulários do site. Fica fora de acoes.ts porque um arquivo 'use server' só pode exportar
// funções assíncronas. Não diz se o CNPJ ou o e-mail já existiam (DF-56, DF-50).

export type EstadoSite = {
  erros: ErrosSite
  valores: Record<string, string> | null
  erroGeral?: string
  /** O texto de confirmação do Apêndice E, no lugar do formulário. */
  confirmacao?: string
  /** O aceite como seria gravado: a versão do texto e a data e a hora (RNF-05, CA-19.2). */
  consentimento?: { versao: number; aceitoEm: string }
}

export const ESTADO_INICIAL_SITE: EstadoSite = { erros: {}, valores: null }
