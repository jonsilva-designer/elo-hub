import { connection } from 'next/server'
import { describe, expect, it, vi } from 'vitest'
import { hojeEmBrasilia } from '@/lib/formato'
import { hojeDaRequisicao } from './hoje'

describe('hojeDaRequisicao (RN-20, cacheComponents)', () => {
  it('dá a data de hoje em Brasília', async () => {
    expect(await hojeDaRequisicao()).toBe(hojeEmBrasilia(new Date()))
  })

  it('só lê o relógio depois do connection(): pendurado, como na pré-renderização, não termina', async () => {
    vi.mocked(connection).mockReturnValueOnce(new Promise(() => {}))
    const resultado = await Promise.race([
      hojeDaRequisicao().then(() => 'leu a data'),
      new Promise((resolve) => setTimeout(() => resolve('esperou'), 20)),
    ])
    expect(resultado).toBe('esperou')
  })
})
