import type { DadosContrato, ErrosContrato } from './validacao'

// Tipos e estados iniciais das ações do contrato. Ficam fora de acoes.ts porque um arquivo
// 'use server' só pode exportar funções assíncronas.

/** O que a ação de salvar devolve ao formulário (useActionState). */
export type EstadoSalvarContrato = {
  erros: ErrosContrato
  /** O que foi digitado, para os campos não ficarem vazios depois de um erro. */
  valores: DadosContrato | null
  /** Erro que não é de um campo, como a falta de permissão. */
  erroGeral?: string
  /** Deu certo: o formulário mostra o aviso e vai para o destino. */
  sucesso?: { mensagem: string; destino: string }
}

export const ESTADO_INICIAL_SALVAR_CONTRATO: EstadoSalvarContrato = { erros: {}, valores: null }
