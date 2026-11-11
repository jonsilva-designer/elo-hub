'use client'

import { useSyncExternalStore } from 'react'
import { Num } from '@/components/elo/num'
import { VAZIO } from '@/lib/formato'

/** Cor hexadecimal em 6 dígitos e maiúsculas, como na especificação. Outro valor volta aparado. */
export function normalizarHex(valor: string): string {
  const v = valor.trim()
  const curto = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(v)
  if (curto) return `#${curto[1]}${curto[1]}${curto[2]}${curto[2]}${curto[3]}${curto[3]}`.toUpperCase()
  return /^#[0-9a-f]{6}$/i.test(v) ? v.toUpperCase() : v
}

const semAssinatura = () => () => {}

/** Mostra o valor que o CSS tem para o token, lido do navegador, sem cópia. */
export function ValorDaCor({ token }: { token: string }) {
  const valor = useSyncExternalStore(
    semAssinatura,
    () => getComputedStyle(document.documentElement).getPropertyValue(token).trim(),
    () => '',
  )
  return <Num>{normalizarHex(valor) || VAZIO}</Num>
}
