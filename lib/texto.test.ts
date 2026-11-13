import { describe, expect, it } from 'vitest'
import { normalizarBusca } from './texto'

describe('normalizarBusca', () => {
  it('tira acento e caixa, para "sao lucas" achar "Clínica São Lucas"', () => {
    expect(normalizarBusca('Clínica São Lucas')).toBe('clinica sao lucas')
    expect(normalizarBusca('sao lucas')).toBe('sao lucas')
  })

  it('cedilha, til e circunflexo', () => {
    expect(normalizarBusca('AÇÃO Êxito')).toBe('acao exito')
  })

  it('texto vazio continua vazio', () => {
    expect(normalizarBusca('')).toBe('')
  })
})
