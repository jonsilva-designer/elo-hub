import type { StatusPlano } from '@/lib/dados/tipos'

// Regras do plano de ação (F07; PRD 6.1). Concluir, cancelar e reabrir são ações da página, como no escopo.

export const STATUS_PLANO: StatusPlano[] = ['Aberto', 'Em andamento', 'Concluído', 'Cancelado']

export const STATUS_PLANO_ABERTOS: StatusPlano[] = ['Aberto', 'Em andamento']

/** Concluído e Cancelado são finais: só o Administrador reabre (RN-17). */
export function planoFechado(status: StatusPlano): boolean {
  return status === 'Concluído' || status === 'Cancelado'
}

/** A ordem das tabelas de planos: os abertos antes dos fechados; em cada grupo, pelo prazo (sem prazo no fim) e pelo nome. */
export function compararPlanos(
  a: { nome: string; prazo: string | null; status: StatusPlano },
  b: { nome: string; prazo: string | null; status: StatusPlano },
): number {
  return (
    Number(planoFechado(a.status)) - Number(planoFechado(b.status)) ||
    Number(a.prazo === null) - Number(b.prazo === null) ||
    (a.prazo ?? '').localeCompare(b.prazo ?? '') ||
    a.nome.localeCompare(b.nome, 'pt-BR')
  )
}
