import { describe, expect, it } from 'vitest'
import { STATUS_POR_TOM, tomDoStatus, type TomDeStatus } from './status'

describe('STATUS_POR_TOM', () => {
  it('lista os sete tons, com o neutro', () => {
    expect(Object.keys(STATUS_POR_TOM).sort()).toEqual(
      ['atencao', 'concluido', 'em-curso', 'fechado', 'neutro', 'problema', 'suspenso'],
    )
  })

  it('cada status da tabela cai no seu tom', () => {
    for (const [tom, lista] of Object.entries(STATUS_POR_TOM) as [TomDeStatus, readonly string[]][]) {
      expect(lista.length).toBeGreaterThan(0)
      for (const s of lista) expect(tomDoStatus(s)).toBe(tom)
    }
  })
})
