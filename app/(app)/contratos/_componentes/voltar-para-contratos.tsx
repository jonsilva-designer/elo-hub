'use client'

import { useSyncExternalStore } from 'react'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { CHAVE_FILTROS_DOS_CONTRATOS } from '@/lib/contratos/filtros'

const semAssinatura = () => () => {}

/** Os filtros que a lista guardou na aba do navegador. Sem armazenamento, nenhum. */
function filtrosGuardados(): string {
  try {
    return sessionStorage.getItem(CHAVE_FILTROS_DOS_CONTRATOS) ?? ''
  } catch {
    return ''
  }
}

/**
 * Caminho de volta para a lista de contratos, com os filtros que estavam aplicados (parte 3, 5.6). Funciona pelo
 * link, e não só pelo botão de voltar do navegador. No servidor, o link vai para a lista sem filtros.
 */
export function VoltarParaContratos() {
  const filtros = useSyncExternalStore(semAssinatura, filtrosGuardados, () => '')
  return <LinkVoltar href={filtros ? `/contratos?${filtros}` : '/contratos'} rotulo="Contratos" />
}
