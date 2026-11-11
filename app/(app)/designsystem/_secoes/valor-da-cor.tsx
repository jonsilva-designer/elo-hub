'use client'

import { useSyncExternalStore } from 'react'
import { Num } from '@/components/elo/num'
import { VAZIO } from '@/lib/formato'

const semAssinatura = () => () => {}

/** Mostra o valor que o CSS tem para o token, lido do navegador, sem cópia. */
export function ValorDaCor({ token }: { token: string }) {
  const valor = useSyncExternalStore(
    semAssinatura,
    () => getComputedStyle(document.documentElement).getPropertyValue(token).trim(),
    () => '',
  )
  return <Num>{valor || VAZIO}</Num>
}
