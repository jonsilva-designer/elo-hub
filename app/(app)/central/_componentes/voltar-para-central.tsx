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

/** A lista com os filtros guardados, para voltar a ela depois de uma ação (salvar, excluir). */
export function enderecoDaCentral(): string {
  const filtros = filtrosGuardados()
  return filtros ? `/central?${filtros}` : '/central'
}

/** O mesmo endereço, para um link: no servidor, a lista sem filtros. */
export function useEnderecoDaCentral(): string {
  const filtros = useSyncExternalStore(semAssinatura, filtrosGuardados, () => '')
  return filtros ? `/central?${filtros}` : '/central'
}

/** Caminho de volta para a fila da Central, com os filtros que estavam aplicados (parte 5, 5.8). */
export function VoltarParaCentral() {
  const filtros = useSyncExternalStore(semAssinatura, filtrosGuardados, () => '')
  return <LinkVoltar href={filtros ? `/central?${filtros}` : '/central'} rotulo="Central ELO" />
}
