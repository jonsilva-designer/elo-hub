import { describe, expect, it } from 'vitest'
import { validarEmail, validarEntrada } from './validacao'

describe('validarEmail', () => {
  it('pede o e-mail quando vazio ou só com espaços', () => {
    expect(validarEmail('')).toBe('Informe o e-mail.')
    expect(validarEmail('   ')).toBe('Informe o e-mail.')
  })

  it('recusa o formato inválido', () => {
    expect(validarEmail('helena')).toBe('Informe um e-mail válido.')
    expect(validarEmail('helena@elogovernance')).toBe('Informe um e-mail válido.')
  })

  it('aceita o e-mail com espaços nas pontas', () => {
    expect(validarEmail(' helena.prado@elogovernance.com.br ')).toBeUndefined()
  })
})

describe('validarEntrada', () => {
  it('dá os dois erros com os campos vazios', () => {
    expect(validarEntrada('', '')).toEqual({ email: 'Informe o e-mail.', senha: 'Informe a senha.' })
  })

  it('não dá erro com e-mail e senha preenchidos', () => {
    expect(validarEntrada('helena.prado@elogovernance.com.br', 'qualquer')).toEqual({})
  })
})
