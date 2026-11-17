import { describe, expect, it } from 'vitest'
import { compararPlanos, planoFechado, STATUS_PLANO, STATUS_PLANO_ABERTOS } from './regras'

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

describe('compararPlanos (parte 4, 5.4)', () => {
  it('abertos antes dos fechados; pelo prazo, sem prazo no fim; depois pelo nome', () => {
    const planos = [
      { nome: 'Fechado', prazo: '2026-01-01', status: 'Concluído' as const },
      { nome: 'Sem prazo', prazo: null, status: 'Aberto' as const },
      { nome: 'Depois', prazo: '2026-09-01', status: 'Em andamento' as const },
      { nome: 'Antes B', prazo: '2026-03-01', status: 'Aberto' as const },
      { nome: 'Antes A', prazo: '2026-03-01', status: 'Aberto' as const },
    ]
    expect([...planos].sort(compararPlanos).map((p) => p.nome)).toEqual(['Antes A', 'Antes B', 'Depois', 'Sem prazo', 'Fechado'])
  })
})
