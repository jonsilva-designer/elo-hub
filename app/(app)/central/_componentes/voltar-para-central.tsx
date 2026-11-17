'use client'

import { useSyncExternalStore } from 'react'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { CHAVE_FILTROS_DAS_DEMANDAS } from '@/lib/demandas/filtros'

const semAssinatura = () => () => {}

/** Os filtros que a fila guardou na aba do navegador. Sem armazenamento, nenhum. */
function filtrosGuardados(): string {
  try {
    return sessionStorage.getItem(CHAVE_FILTROS_DAS_DEMANDAS) ?? ''
  } catch {
    return ''
  }
}

/** Caminho de volta para a fila da Central, com os filtros que estavam aplicados (parte 5, 5.8). */
export function VoltarParaCentral() {
  const filtros = useSyncExternalStore(semAssinatura, filtrosGuardados, () => '')
  return <LinkVoltar href={filtros ? `/central?${filtros}` : '/central'} rotulo="Central ELO" />
}
