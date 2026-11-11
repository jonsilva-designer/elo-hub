import { describe, expect, it } from 'vitest'
import { normalizarHex } from './valor-da-cor'

describe('normalizarHex', () => {
  it('expande 3 dígitos e põe em maiúsculas', () => {
    expect(normalizarHex('#fff')).toBe('#FFFFFF')
  })
  it('apara espaços e põe em maiúsculas', () => {
    expect(normalizarHex(' #182f4f ')).toBe('#182F4F')
  })
  it('vazio continua vazio', () => {
    expect(normalizarHex('')).toBe('')
  })
  it('o que não é hex volta aparado e igual', () => {
    expect(normalizarHex('rgb(0 0 0)')).toBe('rgb(0 0 0)')
    expect(normalizarHex(' rgb(0 0 0) ')).toBe('rgb(0 0 0)')
  })
})
