import type { Criticidade } from '@/lib/design/status'
import { CRITICIDADES } from '@/lib/escopos/regras'

// Alertas internos (F15). Calculados a cada leitura, nunca gravados: somem sozinhos quando a condição deixa de existir
// (CA-15.2, arquitetura 3.3). No MVP, aparecem no painel e nas listas; avisos externos ficam para evolução.

export type TipoAlerta =
  | 'Contrato próximo do vencimento'
  | 'Contrato vencido'
  | 'Atividade atrasada'
  | 'Atividade próxima do prazo'
  | 'Escopo crítico'
  | 'Demanda crítica'
  | 'Demanda vencida'
  | 'Especialista inativo'

export type Alerta = {
  /** Única na lista: o tipo e o registro. */
  chave: string
  tipo: TipoAlerta
  /** O registro como a lista mostra: código e contratante, nome, número e assunto. */
  registro: string
  cliente: string
  /** A do escopo, a da demanda ou, na atividade, a do escopo do plano (DF-15). Null quando não existe. */
  criticidade: Criticidade | null
  /** O término, o prazo ou null. AAAA-MM-DD. */
  data: string | null
  /** O registro que originou o alerta (CA-15.1). */
  href: string
  tom: 'atencao' | 'problema'
}

const peso = (a: Alerta) => (a.criticidade ? CRITICIDADES.indexOf(a.criticidade) : -1)

/**
 * Da maior para a menor criticidade, sem criticidade por último (DF-15, CA-15.5); depois, a data mais antiga primeiro,
 * sem data por último; por fim, o registro.
 */
export function ordenarAlertas(alertas: readonly Alerta[]): Alerta[] {
  return [...alertas].sort(
    (a, b) =>
      peso(b) - peso(a) ||
      (a.data ?? '9999-12-31').localeCompare(b.data ?? '9999-12-31') ||
      a.registro.localeCompare(b.registro, 'pt-BR'),
  )
}
