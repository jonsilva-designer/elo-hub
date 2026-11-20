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

/** A lista com os filtros guardados, para voltar a ela depois de uma ação (excluir, cadastrar). */
export function enderecoDosEspecialistas(): string {
  const filtros = filtrosGuardados()
  return filtros ? `/especialistas?${filtros}` : '/especialistas'
}

/** O mesmo endereço, para um link: no servidor, a lista sem filtros. */
export function useEnderecoDosEspecialistas(): string {
  const filtros = useSyncExternalStore(semAssinatura, filtrosGuardados, () => '')
  return filtros ? `/especialistas?${filtros}` : '/especialistas'
}

/**
 * Caminho de volta para a lista de especialistas, com os filtros que estavam aplicados (parte 5, 5.4). No servidor,
 * o link vai para a lista sem filtros.
 */
export function VoltarParaEspecialistas() {
  const filtros = useSyncExternalStore(semAssinatura, filtrosGuardados, () => '')
  return <LinkVoltar href={filtros ? `/especialistas?${filtros}` : '/especialistas'} rotulo="Especialistas" />
}
