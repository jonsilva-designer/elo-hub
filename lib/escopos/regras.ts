import type { LinhaEtapa, StatusEscopo } from '@/lib/dados/tipos'
import type { Criticidade, Prioridade } from '@/lib/design/status'

// Ciclo de vida do escopo (PRD 6.1). Concluído e Cancelado são finais: só o Administrador reabre (RN-17).

export const STATUS_ESCOPO: StatusEscopo[] = ['Planejado', 'Em andamento', 'Em espera', 'Concluído', 'Cancelado']

export const STATUS_ESCOPO_ABERTOS: StatusEscopo[] = ['Planejado', 'Em andamento', 'Em espera']

export const CRITICIDADES: Criticidade[] = ['Baixa', 'Moderada', 'Alta', 'Crítica']

export const PRIORIDADES: Prioridade[] = ['Baixa', 'Média', 'Alta']

/** Concluído e Cancelado (RN-17). */
export function escopoFechado(status: StatusEscopo): boolean {
  return status === 'Concluído' || status === 'Cancelado'
}

const LISTADAS: ReadonlySet<string> = new Set(['Planejado>Em andamento', 'Em andamento>Em espera', 'Em espera>Em andamento'])

/**
 * Transição entre status abertos que está na tabela da 6.1, ou o mesmo status. As outras mudanças entre abertos
 * são correção e pedem justificativa (RN-22).
 */
export function transicaoListadaEscopo(de: StatusEscopo, para: StatusEscopo): boolean {
  return de === para || LISTADAS.has(`${de}>${para}`)
}

/**
 * Alguém mexeu na Jornada: alguma etapa fora de Não iniciada, ou com responsável, datas ou observações. As 5 etapas
 * que o sistema cria com o escopo não contam como item ligado enquanto ninguém mexeu nelas (parte 3, 5.9).
 */
export function jornadaMexida(etapas: LinhaEtapa[]): boolean {
  return etapas.some(
    (l) => l.status !== 'Não iniciada' || l.responsavelId !== null || l.inicio !== null || l.conclusao !== null || l.observacoes !== '',
  )
}
