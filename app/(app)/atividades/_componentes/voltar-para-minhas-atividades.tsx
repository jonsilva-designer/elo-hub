'use client'

import { useSyncExternalStore } from 'react'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { CHAVE_FILTROS_DAS_ATIVIDADES } from '@/lib/atividades/filtros'

const semAssinatura = () => () => {}

/** Os filtros que a lista guardou na aba do navegador. Sem armazenamento, nenhum. */
function filtrosGuardados(): string {
  try {
    return sessionStorage.getItem(CHAVE_FILTROS_DAS_ATIVIDADES) ?? ''
  } catch {
    return ''
  }
}

/**
 * Caminho de volta para Minhas atividades, com os filtros que estavam aplicados (parte 4, 5.7). Funciona pelo link, e
 * não só pelo botão de voltar do navegador. No servidor, o link vai para a lista sem filtros.
 */
export function VoltarParaMinhasAtividades() {
  const filtros = useSyncExternalStore(semAssinatura, filtrosGuardados, () => '')
  return <LinkVoltar href={filtros ? `/minhas-atividades?${filtros}` : '/minhas-atividades'} rotulo="Minhas atividades" />
}
