import { describe, expect, it } from 'vitest'
import type { StatusContrato } from '@/lib/dados/tipos'
import { contratoFechado, ehPlanejamento, STATUS_ABERTOS, STATUS_CONTRATO, STATUS_DO_CADASTRO, transicaoListada } from './regras'

describe('status do contrato (PRD 6.1)', () => {
  it('as listas seguem a ordem do tipo', () => {
    expect(STATUS_CONTRATO).toEqual(['Proposta', 'Em contratação', 'Ativo', 'Suspenso', 'Encerrado', 'Cancelado'])
    expect(STATUS_ABERTOS).toEqual(['Proposta', 'Em contratação', 'Ativo', 'Suspenso'])
    expect(STATUS_DO_CADASTRO).toEqual(['Proposta', 'Em contratação', 'Ativo'])
  })

  it('Encerrado e Cancelado são fechados; Proposta e Em contratação são planejamento (DF-48)', () => {
    const fechados = STATUS_CONTRATO.filter(contratoFechado)
    const planejamento = STATUS_CONTRATO.filter(ehPlanejamento)
    expect(fechados).toEqual(['Encerrado', 'Cancelado'])
    expect(planejamento).toEqual(['Proposta', 'Em contratação'])
  })

  it('as transições listadas da 6.1 e o mesmo status não pedem justificativa', () => {
    const listadas: [StatusContrato, StatusContrato][] = [
      ['Proposta', 'Em contratação'],
      ['Proposta', 'Ativo'],
      ['Em contratação', 'Ativo'],
      ['Ativo', 'Suspenso'],
      ['Suspenso', 'Ativo'],
      ['Ativo', 'Ativo'],
    ]
    for (const [de, para] of listadas) expect(transicaoListada(de, para), `${de} → ${para}`).toBe(true)
  })

  it('as outras mudanças entre abertos são correção do Administrador (RN-22)', () => {
    const correcoes: [StatusContrato, StatusContrato][] = [
      ['Ativo', 'Proposta'],
      ['Suspenso', 'Em contratação'],
      ['Em contratação', 'Proposta'],
    ]
    for (const [de, para] of correcoes) expect(transicaoListada(de, para), `${de} → ${para}`).toBe(false)
  })
})
