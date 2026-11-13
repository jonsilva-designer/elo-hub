import { describe, expect, it } from 'vitest'
import { cnpjValido } from './cnpj'

describe('cnpjValido', () => {
  it('aceita o CNPJ com e sem pontuação', () => {
    expect(cnpjValido('68.308.773/0001-73')).toBe(true)
    expect(cnpjValido('68308773000173')).toBe(true)
  })

  it('recusa dígito verificador errado', () => {
    expect(cnpjValido('68.308.773/0001-74')).toBe(false)
  })

  it('recusa os 14 dígitos iguais, que passariam na conta', () => {
    expect(cnpjValido('11.111.111/1111-11')).toBe(false)
  })

  it('recusa o que não tem 14 dígitos', () => {
    expect(cnpjValido('123')).toBe(false)
    expect(cnpjValido('')).toBe(false)
  })
})
