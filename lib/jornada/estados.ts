import type { DadosEtapa, ErrosEtapa } from './validacao'

// Tipos e estados iniciais da atualização da etapa. Ficam fora de acoes.ts porque um arquivo
// 'use server' só pode exportar funções assíncronas.

/** O que a ação devolve à janela da etapa (useActionState). */
export type EstadoAtualizarEtapa = {
  erros: ErrosEtapa
  /** O que foi enviado, para os campos não ficarem vazios depois de um erro. */
  valores?: DadosEtapa
  /** Erro que não é de um campo, como a falta de permissão ou o escopo fechado. */
  erroGeral?: string
  /** Deu certo: a janela mostra o aviso e fecha. */
  sucesso?: { mensagem: string }
}

export const ESTADO_INICIAL_ATUALIZAR_ETAPA: EstadoAtualizarEtapa = { erros: {} }
