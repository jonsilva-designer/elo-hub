'use client'

import { useSyncExternalStore } from 'react'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { CHAVE_FILTROS_DOS_DOCUMENTOS } from '@/lib/documentos/filtros'

const semAssinatura = () => () => {}

/** Os filtros que a lista guardou na aba do navegador. Sem armazenamento, nenhum. */
function filtrosGuardados(): string {
  try {
    return sessionStorage.getItem(CHAVE_FILTROS_DOS_DOCUMENTOS) ?? ''
  } catch {
    return ''
  }
}

/** A lista com os filtros guardados, para voltar a ela depois de uma ação (excluir, por exemplo). */
export function enderecoDosDocumentos(): string {
  const filtros = filtrosGuardados()
  return filtros ? `/documentos?${filtros}` : '/documentos'
}

/** Caminho de volta para a lista de documentos, com os filtros que estavam aplicados (CA-16.2). */
export function VoltarParaDocumentos() {
  const filtros = useSyncExternalStore(semAssinatura, filtrosGuardados, () => '')
  return <LinkVoltar href={filtros ? `/documentos?${filtros}` : '/documentos'} rotulo="Documentos" />
}
