import { describe, expect, it } from 'vitest'
import type { Contrato } from '@/lib/dados/tipos'
import { diasEntre, textoDosDias, vigenciaDoContrato } from './vigencia'

// Datas dos cenários CN-04 e CN-05 do PRD (Apêndice D), com hoje em 10/03/2027 e alerta de 30 dias.
const HOJE = '2027-03-10'

const contrato = (
  status: Contrato['status'],
  termino: string | null,
  tipoVigencia: Contrato['tipoVigencia'] = 'Prazo determinado',
): Pick<Contrato, 'status' | 'tipoVigencia' | 'termino'> => ({ status, termino, tipoVigencia })

describe('diasEntre', () => {
  it('conta dias de calendário, também atravessando o mês', () => {
    expect(diasEntre('2027-03-10', '2027-04-09')).toBe(30)
    expect(diasEntre('2027-03-10', '2027-03-09')).toBe(-1)
    expect(diasEntre('2027-03-10', '2027-03-10')).toBe(0)
  })
})

describe('vigenciaDoContrato (RN-04, RN-20, critério 4)', () => {
  it('término ontem: Vencido, e o contrato segue Ativo (CN-04.1)', () => {
    expect(vigenciaDoContrato(contrato('Ativo', '2027-03-09'), HOJE, 30)).toEqual({ status: 'Vencido', diasRestantes: -1 })
  })

  it('a 30 dias está Próximo do vencimento; a 31, Vigente (CN-04.2)', () => {
    expect(vigenciaDoContrato(contrato('Ativo', '2027-04-09'), HOJE, 30)).toEqual({
      status: 'Próximo do vencimento',
      diasRestantes: 30,
    })
    expect(vigenciaDoContrato(contrato('Ativo', '2027-04-10'), HOJE, 30)).toEqual({ status: 'Vigente', diasRestantes: 31 })
  })

  it('término hoje ainda está no prazo (CN-04.3)', () => {
    expect(vigenciaDoContrato(contrato('Ativo', '2027-03-10'), HOJE, 30)).toEqual({
      status: 'Próximo do vencimento',
      diasRestantes: 0,
    })
  })

  it('Suspenso conta como Ativo (CN-04.4, DF-54)', () => {
    expect(vigenciaDoContrato(contrato('Suspenso', '2027-03-20'), HOJE, 30)).toEqual({
      status: 'Próximo do vencimento',
      diasRestantes: 10,
    })
  })

  it('Prazo indeterminado: Vigente, sem dias restantes (CN-04.5)', () => {
    expect(vigenciaDoContrato(contrato('Ativo', null, 'Prazo indeterminado'), HOJE, 30)).toEqual({
      status: 'Vigente',
      diasRestantes: null,
    })
  })

  it('Renovação automática segue o término como o prazo determinado', () => {
    expect(vigenciaDoContrato(contrato('Ativo', '2027-12-31', 'Renovação automática'), HOJE, 30)).toEqual({
      status: 'Vigente',
      diasRestantes: 296,
    })
  })

  it('Proposta e Em contratação não têm vigência; Encerrado e Cancelado ficam Encerrado (CN-04.6)', () => {
    expect(vigenciaDoContrato(contrato('Proposta', null), HOJE, 30)).toBeNull()
    expect(vigenciaDoContrato(contrato('Em contratação', null), HOJE, 30)).toBeNull()
    expect(vigenciaDoContrato(contrato('Encerrado', '2025-05-31'), HOJE, 30)).toEqual({
      status: 'Encerrado',
      diasRestantes: null,
    })
    expect(vigenciaDoContrato(contrato('Cancelado', null), HOJE, 30)).toEqual({ status: 'Encerrado', diasRestantes: null })
  })

  it('o prazo do alerta vem do parâmetro (CN-05.2)', () => {
    expect(vigenciaDoContrato(contrato('Ativo', '2027-04-19'), HOJE, 45)).toEqual({
      status: 'Próximo do vencimento',
      diasRestantes: 40,
    })
  })
})

describe('textoDosDias', () => {
  it('escreve os dias restantes e os vencidos', () => {
    expect(textoDosDias(0)).toBe('Vence hoje')
    expect(textoDosDias(1)).toBe('1 dia restante')
    expect(textoDosDias(20)).toBe('20 dias restantes')
    expect(textoDosDias(-1)).toBe('Vencido há 1 dia')
    expect(textoDosDias(-75)).toBe('Vencido há 75 dias')
  })
})
