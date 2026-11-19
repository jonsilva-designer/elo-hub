import type { CampoTexto } from '@/lib/dados/tipos'
import { somarDias } from '@/lib/formato'

// Regras da Visão Executiva (F14, DF-82). Entregas realizadas e próximos prazos usam uma janela de 30 dias a partir de
// hoje, com as pontas incluídas (arquitetura 3.5).

const JANELA_EM_DIAS = 30

/** Os três textos, na ordem da tela e do PDF (DF-73, DF-82). */
export const TEXTOS: { campo: CampoTexto; titulo: string }[] = [
  { campo: 'principaisResultados', titulo: 'Principais resultados' },
  { campo: 'observacoesExecutivas', titulo: 'Observações executivas' },
  { campo: 'proximosPassos', titulo: 'Próximos passos' },
]

/** A data está nos últimos 30 dias, hoje incluído. */
export function nosUltimosDias(data: string | null, hoje: string): data is string {
  return data !== null && data >= somarDias(hoje, -JANELA_EM_DIAS) && data <= hoje
}

/** A data está nos próximos 30 dias, hoje incluído. */
export function nosProximosDias(data: string | null, hoje: string): data is string {
  return data !== null && data >= hoje && data <= somarDias(hoje, JANELA_EM_DIAS)
}
