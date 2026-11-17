import type { DemandaDetalhada } from '@/lib/dados/tipos'
import { CRITICIDADES } from '@/lib/escopos/regras'
import { demandaFechada } from './regras'

// Ordem e filtros da fila de demandas (parte 5, 5.8; CA-09.7). A fila, a aba do cliente, o painel do escopo e a
// exportação usam a mesma ordem.

/**
 * A ordem inicial: as abertas antes das Encerradas; em cada grupo, das mais críticas para as menos (sem criticidade
 * por último) e pela abertura, da mais antiga para a mais recente; por fim, o número.
 */
export function ordenarDemandas(demandas: readonly DemandaDetalhada[]): DemandaDetalhada[] {
  const peso = (d: DemandaDetalhada) => (d.criticidade ? CRITICIDADES.indexOf(d.criticidade) : -1)
  return [...demandas].sort(
    (a, b) =>
      Number(demandaFechada(a.status)) - Number(demandaFechada(b.status)) ||
      peso(b) - peso(a) ||
      a.abertaEm.localeCompare(b.abertaEm) ||
      a.numero.localeCompare(b.numero),
  )
}
