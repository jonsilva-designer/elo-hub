import type { DadosDocumento, ErrosDocumento } from './validacao'

// Tipos e estados iniciais das ações do documento. Ficam fora de acoes.ts porque um arquivo 'use server' só pode
// exportar funções assíncronas.

/** O que a inclusão e a edição devolvem ao formulário (useActionState). */
export type EstadoDocumento = {
  erros: ErrosDocumento
  valores: DadosDocumento | null
  erroGeral?: string
  sucesso?: { mensagem: string; destino: string }
}

export const ESTADO_INICIAL_DOCUMENTO: EstadoDocumento = { erros: {}, valores: null }
