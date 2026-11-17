import type { StatusPlano } from '@/lib/dados/tipos'

// Regras do plano de ação (F07; PRD 6.1). Concluir, cancelar e reabrir são ações da página, como no escopo.

export const STATUS_PLANO: StatusPlano[] = ['Aberto', 'Em andamento', 'Concluído', 'Cancelado']

export const STATUS_PLANO_ABERTOS: StatusPlano[] = ['Aberto', 'Em andamento']

/** Concluído e Cancelado são finais: só o Administrador reabre (RN-17). */
export function planoFechado(status: StatusPlano): boolean {
  return status === 'Concluído' || status === 'Cancelado'
}
