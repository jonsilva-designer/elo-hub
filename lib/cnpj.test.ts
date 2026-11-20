import { describe, expect, it } from 'vitest'
import { cnpjValido, formatarCnpj, normalizarCnpj } from './cnpj'

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

describe('formatarCnpj', () => {
  it('põe a máscara num CNPJ de 14 dígitos, com ou sem pontuação', () => {
    expect(formatarCnpj('21473509000121')).toBe('21.473.509/0001-21')
    expect(formatarCnpj(' 21.473.509/0001-21 ')).toBe('21.473.509/0001-21')
  })

  it('devolve sem mudar o que não tem 14 dígitos', () => {
    expect(formatarCnpj('123')).toBe('123')
    expect(formatarCnpj('')).toBe('')
  })
})

describe('CNPJ alfanumérico (Receita Federal, desde julho de 2026)', () => {
  it('aceita letras nas 12 primeiras posições, com os dígitos verificadores pela tabela ASCII', () => {
    expect(cnpjValido('12.ABC.345/01DE-35')).toBe(true)
    expect(cnpjValido('12ABC34501DE35')).toBe(true)
    expect(cnpjValido('12.abc.345/01de-35')).toBe(true)
    expect(cnpjValido('12.ABC.345/01DE-36')).toBe(false)
  })

  it('espaço nas pontas não torna o CNPJ inválido', () => {
    expect(cnpjValido(' 68.308.773/0001-73 ')).toBe(true)
  })

  it('a máscara mantém as letras, em maiúsculas', () => {
    expect(formatarCnpj('12abc34501de35')).toBe('12.ABC.345/01DE-35')
  })

  it('normalizarCnpj deixa só letras e números, em maiúsculas, para comparar', () => {
    expect(normalizarCnpj(' 12.abc.345/01de-35 ')).toBe('12ABC34501DE35')
    expect(normalizarCnpj('68.308.773/0001-73')).toBe('68308773000173')
  })
})
