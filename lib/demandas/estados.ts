import type { DadosNovaDemanda, ErrosDemanda } from './validacao'

// Tipos e estados iniciais das ações da demanda. Ficam fora de acoes.ts porque um arquivo 'use server' só pode
// exportar funções assíncronas.

/** O que a ação de registrar devolve ao formulário (useActionState). */
export type EstadoRegistrarDemanda = {
  erros: ErrosDemanda
  valores: DadosNovaDemanda | null
  erroGeral?: string
  sucesso?: { mensagem: string; destino: string }
}

export const ESTADO_INICIAL_REGISTRAR_DEMANDA: EstadoRegistrarDemanda = { erros: {}, valores: null }
