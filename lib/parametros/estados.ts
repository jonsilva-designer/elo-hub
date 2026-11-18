import type { DadosParametros, ErrosParametros } from './validacao'

// O estado da ação de salvar os parâmetros. Fica fora de acoes.ts porque um arquivo 'use server' só pode exportar
// funções assíncronas.

export type EstadoParametros = {
  erros: ErrosParametros
  valores: DadosParametros | null
  erroGeral?: string
  /** A mensagem de salvo; a tela continua aberta. */
  sucesso?: string
}

export const ESTADO_INICIAL_PARAMETROS: EstadoParametros = { erros: {}, valores: null }
