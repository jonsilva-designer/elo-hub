import type { StatusContrato, TipoVigencia } from '@/lib/dados/tipos'

// Ciclo de vida do contrato ou proposta (PRD 6.1). Só o Administrador muda o status.

export const STATUS_CONTRATO: StatusContrato[] = ['Proposta', 'Em contratação', 'Ativo', 'Suspenso', 'Encerrado', 'Cancelado']

export const STATUS_ABERTOS: StatusContrato[] = ['Proposta', 'Em contratação', 'Ativo', 'Suspenso']

/** O contrato nasce em Proposta, Em contratação ou Ativo (6.1). */
export const STATUS_DO_CADASTRO: StatusContrato[] = ['Proposta', 'Em contratação', 'Ativo']

export const TIPOS_VIGENCIA: TipoVigencia[] = ['Prazo determinado', 'Prazo indeterminado', 'Renovação automática']

/** Status finais (DF-58): só o Administrador reabre (RN-17). */
export function contratoFechado(status: StatusContrato): boolean {
  return status === 'Encerrado' || status === 'Cancelado'
}

/** Escopos e planos de contrato em Proposta ou Em contratação aparecem como planejamento (DF-48). */
export function ehPlanejamento(status: StatusContrato): boolean {
  return status === 'Proposta' || status === 'Em contratação'
}

const LISTADAS: ReadonlySet<string> = new Set([
  'Proposta>Em contratação',
  'Proposta>Ativo',
  'Em contratação>Ativo',
  'Ativo>Suspenso',
  'Suspenso>Ativo',
])

/**
 * Transição entre status abertos que está na tabela da 6.1, ou o mesmo status. As outras mudanças entre abertos
 * são correção do Administrador e pedem justificativa (RN-22).
 */
export function transicaoListada(de: StatusContrato, para: StatusContrato): boolean {
  return de === para || LISTADAS.has(`${de}>${para}`)
}
