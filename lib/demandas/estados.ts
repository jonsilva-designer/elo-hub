import type { DadosDemanda, DadosNovaDemanda, ErrosDemanda } from './validacao'

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

/** O que a ação de salvar a edição devolve ao formulário (useActionState). */
export type EstadoSalvarDemanda = {
  erros: ErrosDemanda
  valores: DadosDemanda | null
  erroGeral?: string
  sucesso?: { mensagem: string; destino: string }
}

export const ESTADO_INICIAL_SALVAR_DEMANDA: EstadoSalvarDemanda = { erros: {}, valores: null }

/** O que a ação de comentar devolve ao formulário de comentário (useActionState). */
export type EstadoComentario = {
  erros: Partial<Record<'texto' | 'especialistaId' | 'dataContato', string>>
  erroGeral?: string
  /** A mensagem de registrado; a cada sucesso, o formulário volta vazio. */
  sucesso?: string
}

export const ESTADO_INICIAL_COMENTARIO: EstadoComentario = { erros: {} }
