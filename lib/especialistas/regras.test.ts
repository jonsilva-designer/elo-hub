import { describe, expect, it } from 'vitest'
import { mesmoEmail, opcoesDeVinculo, ORIGENS_ESPECIALISTA, STATUS_ESPECIALISTA } from './regras'
import { cidadeUf } from './regras'

describe('regras do especialista (F11, PRD 6.1)', () => {
  it('as listas na ordem do PRD', () => {
    expect(STATUS_ESPECIALISTA).toEqual(['Em análise', 'Ativo', 'Inativo'])
    expect(ORIGENS_ESPECIALISTA).toEqual(['Site', 'Cadastro interno'])
  })

  it('o mesmo e-mail, sem diferenciar maiúsculas nem espaços nas pontas (DF-50)', () => {
    expect(mesmoEmail('Bruna.Lima@Exemplo.com.br', ' bruna.lima@exemplo.com.br ')).toBe(true)
    expect(mesmoEmail('bruna.lima@exemplo.com.br', 'bruna.lima2@exemplo.com.br')).toBe(false)
    expect(mesmoEmail('', '')).toBe(false)
  })
})

describe('opcoesDeVinculo (CA-11.2, DF-51)', () => {
  it('os Ativos e o já ligado Inativo, marcado, pelo nome', () => {
    const ativo = { id: 'a', nome: 'Zélia', especialidade: 'Financeiro', status: 'Ativo' as const }
    const inativo = { id: 'b', nome: 'Ana', especialidade: 'Jurídico', status: 'Inativo' as const }
    expect(opcoesDeVinculo([ativo], [inativo, ativo])).toEqual([
      { valor: 'b', rotulo: 'Ana · Jurídico (Inativo)' },
      { valor: 'a', rotulo: 'Zélia · Financeiro' },
    ])
  })
})

describe('cidadeUf, revisão do código', () => {
  it('mostra o que foi preenchido: a UF aparece mesmo sem a cidade', () => {
    expect(cidadeUf('Macaé', 'RJ')).toBe('Macaé/RJ')
    expect(cidadeUf('', 'RJ')).toBe('RJ')
    expect(cidadeUf('Macaé', '')).toBe('Macaé')
    expect(cidadeUf('', '')).toBe('')
  })
})
