import type { Contrato, Vigencia } from '@/lib/dados/tipos'
import { contratoFechado, ehPlanejamento } from './regras'

// Status da vigência (F04, RN-04), calculado a cada consulta com a data de hoje no horário de Brasília (RN-20).
// O vencimento não muda o status do contrato: ele segue Ativo, com vigência Vencido (DF-25).

const UM_DIA = 86_400_000

const emUtc = (data: string) => {
  const [ano, mes, dia] = data.split('-').map(Number)
  return Date.UTC(ano, mes - 1, dia)
}

/** Dias de calendário de `de` até `ate` (datas `AAAA-MM-DD`). Negativo quando `ate` vem antes. */
export function diasEntre(de: string, ate: string): number {
  return Math.round((emUtc(ate) - emUtc(de)) / UM_DIA)
}

/**
 * - Proposta e Em contratação: sem vigência (`null`).
 * - Encerrado e Cancelado: Encerrado.
 * - Prazo indeterminado: Vigente, sem dias restantes (DF-68).
 * - Depois do término: Vencido. O término de hoje ainda está no prazo (RN-20).
 * - Faltando `diasDoAlerta` dias ou menos: Próximo do vencimento (DF-81).
 * Suspenso conta como Ativo (DF-54).
 */
export function vigenciaDoContrato(
  c: Pick<Contrato, 'status' | 'tipoVigencia' | 'termino'>,
  hoje: string,
  diasDoAlerta: number,
): Vigencia | null {
  if (contratoFechado(c.status)) return { status: 'Encerrado', diasRestantes: null }
  if (ehPlanejamento(c.status)) return null
  if (c.tipoVigencia === 'Prazo indeterminado' || !c.termino) return { status: 'Vigente', diasRestantes: null }
  const dias = diasEntre(hoje, c.termino)
  if (dias < 0) return { status: 'Vencido', diasRestantes: dias }
  if (dias <= diasDoAlerta) return { status: 'Próximo do vencimento', diasRestantes: dias }
  return { status: 'Vigente', diasRestantes: dias }
}

/** "Vence hoje", "1 dia restante", "20 dias restantes", "Vencido há 1 dia", "Vencido há 75 dias". */
export function textoDosDias(dias: number): string {
  if (dias === 0) return 'Vence hoje'
  const n = Math.abs(dias)
  const unidade = n === 1 ? 'dia' : 'dias'
  return dias > 0 ? `${n} ${unidade} ${n === 1 ? 'restante' : 'restantes'}` : `Vencido há ${n} ${unidade}`
}
