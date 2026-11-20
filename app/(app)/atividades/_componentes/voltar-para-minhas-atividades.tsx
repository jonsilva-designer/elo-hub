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

/** A lista com os filtros guardados, para voltar a ela depois de uma ação (salvar, excluir). */
export function enderecoDasMinhasAtividades(): string {
  const filtros = filtrosGuardados()
  return filtros ? `/minhas-atividades?${filtros}` : '/minhas-atividades'
}

/** O mesmo endereço, para um link: no servidor, a lista sem filtros. */
export function useEnderecoDasMinhasAtividades(): string {
  const filtros = useSyncExternalStore(semAssinatura, filtrosGuardados, () => '')
  return filtros ? `/minhas-atividades?${filtros}` : '/minhas-atividades'
}

/**
 * Caminho de volta para Minhas atividades, com os filtros que estavam aplicados (parte 4, 5.7). Funciona pelo link, e
 * não só pelo botão de voltar do navegador. No servidor, o link vai para a lista sem filtros.
 */
export function VoltarParaMinhasAtividades() {
  const filtros = useSyncExternalStore(semAssinatura, filtrosGuardados, () => '')
  return <LinkVoltar href={filtros ? `/minhas-atividades?${filtros}` : '/minhas-atividades'} rotulo="Minhas atividades" />
}
