import { describe, expect, it } from 'vitest'
import { lerDadosParametros, MENSAGENS_PARAMETROS, validarParametros } from './validacao'

describe('validarParametros, revisão do código', () => {
  it('a referência de prazo com um número grande demais para ser inteiro é recusada', () => {
    const fd = new FormData()
    fd.set('referenciaCritica', '1' + '0'.repeat(400))
    expect(validarParametros(lerDadosParametros(fd)).referenciaCritica).toBe(MENSAGENS_PARAMETROS.referencia)
  })
})
