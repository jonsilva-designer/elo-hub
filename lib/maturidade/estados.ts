import type { DadosAvaliacao, ErrosAvaliacao } from './validacao'

// Tipos e estados iniciais das ações da avaliação. Ficam fora de acoes.ts porque um arquivo
// 'use server' só pode exportar funções assíncronas.

/** O que a ação de salvar devolve ao formulário (useActionState). */
export type EstadoSalvarAvaliacao = {
  erros: ErrosAvaliacao
  /** O que foi digitado, para os campos não ficarem vazios depois de um erro. */
  valores: DadosAvaliacao | null
  /** Erro que não é de um campo, como a falta de permissão ou a avaliação já concluída. */
  erroGeral?: string
  /** Deu certo: o formulário mostra o aviso e vai para o destino. */
  sucesso?: { mensagem: string; destino: string }
}

export const ESTADO_INICIAL_SALVAR_AVALIACAO: EstadoSalvarAvaliacao = { erros: {}, valores: null }
