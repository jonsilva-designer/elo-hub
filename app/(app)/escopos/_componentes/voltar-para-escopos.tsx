'use client'

import { useSyncExternalStore } from 'react'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { CHAVE_FILTROS_DOS_ESCOPOS } from '@/lib/escopos/filtros'

const semAssinatura = () => () => {}

/** Os filtros que a lista guardou na aba do navegador. Sem armazenamento, nenhum. */
function filtrosGuardados(): string {
  try {
    return sessionStorage.getItem(CHAVE_FILTROS_DOS_ESCOPOS) ?? ''
  } catch {
    return ''
  }
}

/**
 * Caminho de volta para a lista de escopos, com os filtros que estavam aplicados (parte 3, 5.7). Funciona pelo
 * link, e não só pelo botão de voltar do navegador. No servidor, o link vai para a lista sem filtros.
 */
export function VoltarParaEscopos() {
  const filtros = useSyncExternalStore(semAssinatura, filtrosGuardados, () => '')
  return <LinkVoltar href={filtros ? `/escopos?${filtros}` : '/escopos'} rotulo="Escopos" />
}
