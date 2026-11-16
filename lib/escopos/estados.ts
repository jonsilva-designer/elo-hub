import type { DadosEscopo, ErrosEscopo } from './validacao'

// Tipos e estados iniciais das ações do escopo. Ficam fora de acoes.ts porque um arquivo
// 'use server' só pode exportar funções assíncronas.

/** O que a ação de salvar devolve ao formulário (useActionState). */
export type EstadoSalvarEscopo = {
  erros: ErrosEscopo
  /** O que foi digitado, para os campos não ficarem vazios depois de um erro ou do aviso. */
  valores: DadosEscopo | null
  /** Erro que não é de um campo, como a falta de permissão ou o contrato fechado. */
  erroGeral?: string
  /** O aviso da RN-21: tudo certo, mas a conclusão prevista passa do término do contrato. Nada foi salvo. */
  aviso?: string
  /** Deu certo: o formulário mostra o aviso e vai para o destino. */
  sucesso?: { mensagem: string; destino: string }
}

export const ESTADO_INICIAL_SALVAR_ESCOPO: EstadoSalvarEscopo = { erros: {}, valores: null }
