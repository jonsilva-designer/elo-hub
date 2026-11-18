import type { ItemAberto } from '@/lib/dados/usuarios-configuracao'
import type { DadosUsuario, ErrosUsuario } from './validacao'

// Tipos e estados iniciais das ações do usuário. Ficam fora de acoes.ts porque um arquivo 'use server' só pode
// exportar funções assíncronas.

/** O que a ação de salvar devolve ao formulário (useActionState). */
export type EstadoUsuario = {
  erros: ErrosUsuario
  valores: DadosUsuario | null
  erroGeral?: string
  /** Os itens abertos que impedem tirar o vínculo (DF-36, CA-01.7). */
  impedimentos?: ItemAberto[]
  sucesso?: { mensagem: string; destino: string }
}

export const ESTADO_INICIAL_USUARIO: EstadoUsuario = { erros: {}, valores: null }
