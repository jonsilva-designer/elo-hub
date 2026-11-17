'use client'

import { useSyncExternalStore } from 'react'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { CHAVE_FILTROS_DOS_ESPECIALISTAS } from '@/lib/especialistas/filtros'

const semAssinatura = () => () => {}

/** Os filtros que a lista guardou na aba do navegador. Sem armazenamento, nenhum. */
function filtrosGuardados(): string {
  try {
    return sessionStorage.getItem(CHAVE_FILTROS_DOS_ESPECIALISTAS) ?? ''
  } catch {
    return ''
  }
}

/**
 * Caminho de volta para a lista de especialistas, com os filtros que estavam aplicados (parte 5, 5.4). No servidor,
 * o link vai para a lista sem filtros.
 */
export function VoltarParaEspecialistas() {
  const filtros = useSyncExternalStore(semAssinatura, filtrosGuardados, () => '')
  return <LinkVoltar href={filtros ? `/especialistas?${filtros}` : '/especialistas'} rotulo="Especialistas" />
}
