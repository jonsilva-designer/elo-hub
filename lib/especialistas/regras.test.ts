import { describe, expect, it } from 'vitest'
import { mesmoEmail, ORIGENS_ESPECIALISTA, STATUS_ESPECIALISTA } from './regras'

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
