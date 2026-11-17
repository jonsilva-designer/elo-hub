import { describe, expect, it } from 'vitest'
import { planoFechado, STATUS_PLANO, STATUS_PLANO_ABERTOS } from './regras'

describe('regras do plano (PRD 6.1, RN-17)', () => {
  it('as listas na ordem do PRD', () => {
    expect(STATUS_PLANO).toEqual(['Aberto', 'Em andamento', 'Concluído', 'Cancelado'])
    expect(STATUS_PLANO_ABERTOS).toEqual(['Aberto', 'Em andamento'])
  })

  it('Concluído e Cancelado são finais', () => {
    expect(planoFechado('Concluído')).toBe(true)
    expect(planoFechado('Cancelado')).toBe(true)
    expect(planoFechado('Aberto')).toBe(false)
    expect(planoFechado('Em andamento')).toBe(false)
  })
})
