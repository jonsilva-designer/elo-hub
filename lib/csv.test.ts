import { describe, expect, it } from 'vitest'
import { campoCsv, montarCsv } from './csv'

describe('campoCsv', () => {
  it('não deixa um texto virar fórmula no Excel', () => {
    expect(campoCsv('=HIPERLINK("x")')).toBe(`"'=HIPERLINK(""x"")"`)
    expect(campoCsv('+55 22 2765-4310')).toBe("'+55 22 2765-4310")
  })

  it('põe entre aspas o que tem ponto e vírgula, aspas ou quebra de linha; vazio fica vazio', () => {
    expect(campoCsv('Alfa; Beta')).toBe('"Alfa; Beta"')
    expect(campoCsv(undefined)).toBe('')
    expect(campoCsv('simples')).toBe('simples')
  })
})

describe('montarCsv', () => {
  it('começa com o BOM, separa por ponto e vírgula e as linhas por CRLF', () => {
    const csv = montarCsv(['A', 'B'], [['1', 'x;y'], ['2', '']])
    expect(csv).toBe('﻿A;B\r\n1;"x;y"\r\n2;')
  })
})
