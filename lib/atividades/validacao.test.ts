import { describe, expect, it } from 'vitest'
import type { AtividadeDetalhada, Perfil, StatusAtividade } from '@/lib/dados/tipos'
import { lerDadosAtividade, MENSAGENS_ATIVIDADE, validarAtividade, type DadosAtividade } from './validacao'

const NOVA: DadosAtividade = {
  planoId: 'pla-x',
  nome: 'Atividade nova',
  descricao: '',
  responsavelId: 'usr-rafael',
  executor: '',
  prazo: '2027-03-10',
  prioridade: 'Média',
  status: 'Não iniciada',
  justificativa: '',
  observacoes: '',
  confirmarAviso: false,
}

const PERMITIDOS = ['usr-helena', 'usr-rafael']

const atual = (status: StatusAtividade) => ({ id: 'atv-x', status }) as AtividadeDetalhada

const validar = (dados: Partial<DadosAtividade>, a: AtividadeDetalhada | null = null, perfil: Perfil = 'Equipe') =>
  validarAtividade({ ...NOVA, ...dados }, { atual: a, perfil, responsaveisPermitidos: PERMITIDOS })

describe('validarAtividade (F08; parte 4, 5.7)', () => {
  it('a atividade válida não tem erro; o executor é opcional (DF-71)', () => {
    expect(validar({})).toEqual({})
    expect(validar({ executor: 'RH do cliente' })).toEqual({})
  })

  it('nome, responsável, prazo e prioridade são obrigatórios (DF-10)', () => {
    expect(validar({ nome: ' ', responsavelId: '', prazo: '', prioridade: '' })).toEqual({
      nome: MENSAGENS_ATIVIDADE.nome,
      responsavelId: MENSAGENS_ATIVIDADE.responsavel,
      prazo: MENSAGENS_ATIVIDADE.prazo,
      prioridade: MENSAGENS_ATIVIDADE.prioridade,
    })
  })

  it('prazo que não existe e responsável sem vínculo (RN-19)', () => {
    expect(validar({ prazo: '2027-02-30', responsavelId: 'usr-marcos' })).toEqual({
      prazo: MENSAGENS_ATIVIDADE.data,
      responsavelId: MENSAGENS_ATIVIDADE.responsavelSemVinculo,
    })
  })

  it('prazo no passado é aceito: a atividade nasce Atrasada (EC-31)', () => {
    expect(validar({ prazo: '2020-01-01' })).toEqual({})
  })

  it('no cadastro, só Não iniciada ou Em andamento (6.1)', () => {
    expect(validar({ status: 'Em andamento' })).toEqual({})
    expect(validar({ status: 'Concluída' })).toEqual({ status: MENSAGENS_ATIVIDADE.status })
  })

  it('aberta: a Equipe conclui e cancela', () => {
    expect(validar({ status: 'Concluída' }, atual('Em andamento'))).toEqual({})
    expect(validar({ status: 'Cancelada' }, atual('Não iniciada'))).toEqual({})
  })

  it('fechada: a Equipe não reabre; o Administrador reabre com justificativa (RN-17, RN-22)', () => {
    expect(validar({ status: 'Em andamento' }, atual('Concluída'))).toEqual({ status: MENSAGENS_ATIVIDADE.status })
    expect(validar({ status: 'Em andamento' }, atual('Concluída'), 'Administrador')).toEqual({
      justificativa: MENSAGENS_ATIVIDADE.justificativa,
    })
    expect(validar({ status: 'Em andamento', justificativa: 'Faltou um item.' }, atual('Concluída'), 'Administrador')).toEqual({})
    expect(validar({ status: 'Cancelada' }, atual('Concluída'), 'Administrador')).toEqual({ status: MENSAGENS_ATIVIDADE.status })
  })
})

describe('lerDadosAtividade', () => {
  it('lê os campos sem espaços nas pontas e a confirmação do aviso', () => {
    const fd = new FormData()
    fd.set('planoId', ' pla-x ')
    fd.set('executor', '  RH do cliente ')
    fd.set('confirmarAviso', 'sim')
    expect(lerDadosAtividade(fd)).toMatchObject({ planoId: 'pla-x', executor: 'RH do cliente', nome: '', confirmarAviso: true })
  })
})
