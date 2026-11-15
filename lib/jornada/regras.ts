import type { EtapaJornada, LinhaEtapa } from '@/lib/dados/tipos'

// Jornada ELO (F06, RN-08, DF-28): a etapa atual e o progresso são calculados e não são editáveis (CA-06.6).

export const ETAPAS: EtapaJornada[] = ['Diagnosticar', 'Estruturar', 'Implementar', 'Monitorar', 'Evoluir']

const posicao = (l: LinhaEtapa) => ETAPAS.indexOf(l.etapa)

/** A mais avançada entre as etapas com o status dado, ou undefined. */
const maisAvancada = (etapas: LinhaEtapa[], status: LinhaEtapa['status']) =>
  etapas.filter((l) => l.status === status).sort((a, b) => posicao(b) - posicao(a))[0]

/** A etapa Em andamento mais avançada; sem nenhuma, a última Concluída; sem nenhuma iniciada, "Não iniciada". */
export function etapaAtual(etapas: LinhaEtapa[]): EtapaJornada | 'Não iniciada' {
  return (maisAvancada(etapas, 'Em andamento') ?? maisAvancada(etapas, 'Concluída'))?.etapa ?? 'Não iniciada'
}

/** Etapas Concluídas sobre etapas aplicáveis: Não aplicável não conta (DF-28, CA-06.10). */
export function progressoDaJornada(etapas: LinhaEtapa[]): { concluidas: number; aplicaveis: number } {
  return {
    concluidas: etapas.filter((l) => l.status === 'Concluída').length,
    aplicaveis: etapas.filter((l) => l.status !== 'Não aplicável').length,
  }
}
