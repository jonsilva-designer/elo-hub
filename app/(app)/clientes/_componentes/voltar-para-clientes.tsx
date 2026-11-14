'use client'

import { useSyncExternalStore } from 'react'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { CHAVE_FILTROS_DA_LISTA } from '@/lib/clientes/filtros'

const semAssinatura = () => () => {}

/** Os filtros que a lista guardou na aba do navegador. Sem armazenamento, nenhum. */
function filtrosGuardados(): string {
  try {
    return sessionStorage.getItem(CHAVE_FILTROS_DA_LISTA) ?? ''
  } catch {
    return ''
  }
}

/**
 * Caminho de volta para a lista de clientes, com os filtros que estavam aplicados (CA-16.2). Funciona pelo
 * link, e não só pelo botão de voltar do navegador. No servidor, o link vai para a lista sem filtros.
 */
export function VoltarParaClientes() {
  const filtros = useSyncExternalStore(semAssinatura, filtrosGuardados, () => '')
  return <LinkVoltar href={filtros ? `/clientes?${filtros}` : '/clientes'} rotulo="Clientes" />
}
