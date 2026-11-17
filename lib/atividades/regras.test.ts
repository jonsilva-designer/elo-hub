import { describe, expect, it } from 'vitest'
import type { StatusAtividade } from '@/lib/dados/tipos'
import {
  atividadeFechada,
  avisoDoPrazo,
  compararAtividades,
  destinosDaAtividade,
  reaberturaDaAtividade,
  resumoDasAtividades,
  situacaoDoPrazo,
  STATUS_ATIVIDADE,
  STATUS_ATIVIDADE_ABERTOS,
} from './regras'

// Os cenários do Apêndice D usam março de 2027.
const HOJE = '2027-03-10'
const a = (prazo: string, status: StatusAtividade = 'Em andamento') => ({ prazo, status })

describe('regras da atividade (PRD 6.1, RN-17)', () => {
  it('as listas na ordem do PRD', () => {
    expect(STATUS_ATIVIDADE).toEqual(['Não iniciada', 'Em andamento', 'Concluída', 'Cancelada'])
    expect(STATUS_ATIVIDADE_ABERTOS).toEqual(['Não iniciada', 'Em andamento'])
    expect(atividadeFechada('Concluída')).toBe(true)
    expect(atividadeFechada('Cancelada')).toBe(true)
    expect(atividadeFechada('Não iniciada')).toBe(false)
  })

  it('no cadastro, Não iniciada ou Em andamento, para os dois perfis', () => {
    expect(destinosDaAtividade(null, 'Equipe')).toEqual(['Não iniciada', 'Em andamento'])
    expect(destinosDaAtividade(null, 'Administrador')).toEqual(['Não iniciada', 'Em andamento'])
  })

  it('aberta: os quatro status, para os dois perfis', () => {
    expect(destinosDaAtividade('Não iniciada', 'Equipe')).toEqual(STATUS_ATIVIDADE)
    expect(destinosDaAtividade('Em andamento', 'Administrador')).toEqual(STATUS_ATIVIDADE)
  })

  it('fechada: a Equipe não muda; o Administrador reabre (RN-17, RN-22)', () => {
    expect(destinosDaAtividade('Concluída', 'Equipe')).toEqual(['Concluída'])
    expect(destinosDaAtividade('Cancelada', 'Equipe')).toEqual(['Cancelada'])
    expect(destinosDaAtividade('Concluída', 'Administrador')).toEqual(['Não iniciada', 'Em andamento', 'Concluída'])
    expect(destinosDaAtividade('Cancelada', 'Administrador')).toEqual(['Não iniciada', 'Em andamento', 'Cancelada'])
  })

  it('reabertura é sair de um status final para um aberto', () => {
    expect(reaberturaDaAtividade('Concluída', 'Em andamento')).toBe(true)
    expect(reaberturaDaAtividade('Cancelada', 'Não iniciada')).toBe(true)
    expect(reaberturaDaAtividade('Não iniciada', 'Em andamento')).toBe(false)
    expect(reaberturaDaAtividade('Concluída', 'Concluída')).toBe(false)
  })
})

describe('situacaoDoPrazo (RN-09, RN-10, RN-20; CN-09, CN-10)', () => {
  it('prazo ontem é Atrasada; prazo hoje ainda não (CN-09.1, CN-09.2, CA-15.4)', () => {
    expect(situacaoDoPrazo(a('2027-03-09'), HOJE, 5)).toBe('Atrasada')
    expect(situacaoDoPrazo(a('2027-03-10'), HOJE, 5)).toBe('Próxima do prazo')
  })

  it('próxima do prazo até hoje + N, inclusive (CN-10.1)', () => {
    expect(situacaoDoPrazo(a('2027-03-15'), HOJE, 5)).toBe('Próxima do prazo')
    expect(situacaoDoPrazo(a('2027-03-16'), HOJE, 5)).toBeNull()
  })

  it('com 7 dias, o prazo de 16/03 passa a ser próximo (CN-10.2)', () => {
    expect(situacaoDoPrazo(a('2027-03-16'), HOJE, 7)).toBe('Próxima do prazo')
  })

  it('Concluída e Cancelada não têm situação (CN-09.3, CA-08.2)', () => {
    expect(situacaoDoPrazo(a('2027-03-09', 'Concluída'), HOJE, 5)).toBeNull()
    expect(situacaoDoPrazo(a('2027-03-09', 'Cancelada'), HOJE, 5)).toBeNull()
    expect(situacaoDoPrazo(a('2027-03-12', 'Concluída'), HOJE, 5)).toBeNull()
  })

  it('Não iniciada também atrasa', () => {
    expect(situacaoDoPrazo(a('2027-03-05', 'Não iniciada'), HOJE, 5)).toBe('Atrasada')
  })
})

describe('resumoDasAtividades (CA-07.2)', () => {
  it('total de todas, concluídas e atrasadas', () => {
    const atividades = [
      a('2027-03-01', 'Concluída'),
      a('2027-03-01', 'Cancelada'),
      a('2027-03-01'),
      a('2027-04-01', 'Não iniciada'),
    ]
    expect(resumoDasAtividades(atividades, HOJE, 5)).toEqual({ total: 4, concluidas: 1, atrasadas: 1 })
  })

  it('sem atividades, tudo zero', () => {
    expect(resumoDasAtividades([], HOJE, 5)).toEqual({ total: 0, concluidas: 0, atrasadas: 0 })
  })
})

describe('avisoDoPrazo (RN-21, CA-08.7, CN-21.1)', () => {
  it('prazo depois do prazo do plano', () => {
    expect(avisoDoPrazo('2027-04-15', { prazoDoPlano: '2027-03-31', terminoDoContrato: null })).toBe(
      'O prazo é depois do prazo do plano (31/03/2027). Salvar mesmo assim?',
    )
  })

  it('prazo depois do término da vigência', () => {
    expect(avisoDoPrazo('2027-04-15', { prazoDoPlano: null, terminoDoContrato: '2027-04-01' })).toBe(
      'O prazo é depois do término da vigência do contrato (01/04/2027). Salvar mesmo assim?',
    )
  })

  it('os dois motivos juntos', () => {
    expect(avisoDoPrazo('2027-04-15', { prazoDoPlano: '2027-03-31', terminoDoContrato: '2027-04-01' })).toBe(
      'O prazo é depois do prazo do plano (31/03/2027). O prazo é depois do término da vigência do contrato (01/04/2027). Salvar mesmo assim?',
    )
  })

  it('no próprio dia, ou sem limite, não avisa', () => {
    expect(avisoDoPrazo('2027-03-31', { prazoDoPlano: '2027-03-31', terminoDoContrato: '2027-03-31' })).toBeNull()
    expect(avisoDoPrazo('2027-12-31', { prazoDoPlano: null, terminoDoContrato: null })).toBeNull()
  })
})

describe('compararAtividades (CA-08.4)', () => {
  it('abertas pelo prazo, do mais antigo ao mais novo; fechadas no fim', () => {
    const fechadaAntiga = { nome: 'fechada', ...a('2027-01-01', 'Concluída') }
    const futura = { nome: 'futura', ...a('2027-05-01', 'Não iniciada') }
    const atrasada = { nome: 'atrasada', ...a('2027-03-01') }
    expect([fechadaAntiga, futura, atrasada].sort(compararAtividades).map((x) => x.nome)).toEqual([
      'atrasada',
      'futura',
      'fechada',
    ])
  })
})
