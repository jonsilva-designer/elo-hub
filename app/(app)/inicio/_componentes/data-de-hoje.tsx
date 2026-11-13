import { connection } from 'next/server'
import { Num } from '@/components/elo/num'
import { formatarData } from '@/lib/formato'

/**
 * A data de hoje no horário de Brasília. Com o cacheComponents, a hora atual só pode ser lida na
 * requisição: o connection() adia a leitura, e quem usa fica dentro de um Suspense.
 */
export async function DataDeHoje() {
  await connection()
  return <Num>{formatarData(new Date())}</Num>
}
