import { Num } from '@/components/elo/num'
import { hojeDaRequisicao } from '@/lib/dados/hoje'
import { formatarData } from '@/lib/formato'

/**
 * A data de hoje no horário de Brasília, da mesma leitura do relógio que o painel e os alertas usam (revisão do
 * código): perto da meia-noite, o cabeçalho não mostra um dia diferente do que os números calcularam.
 */
export async function DataDeHoje() {
  return <Num>{formatarData(await hojeDaRequisicao())}</Num>
}
