import { describe, expect, it } from 'vitest'
import type { PlanoDetalhado, StatusPlano } from '@/lib/dados/tipos'
import { lerDadosPlano, MENSAGENS_PLANO, validarPlano, type DadosPlano } from './validacao'

const NOVO: DadosPlano = {
  escopoId: 'esc-x',
  nome: 'Plano novo',
  descricao: '',
  responsavelId: 'usr-rafael',
  prazo: '',
  status: 'Aberto',
  avaliacaoId: '',
  observacoes: '',
}

const PERMITIDOS = ['usr-helena', 'usr-rafael']

const atual = (status: StatusPlano) => ({ id: 'pla-x', status }) as PlanoDetalhado

const validar = (dados: Partial<DadosPlano>, plano: PlanoDetalhado | null = null) =>
  validarPlano({ ...NOVO, ...dados }, { atual: plano, responsaveisPermitidos: PERMITIDOS })

describe('validarPlano (F07; parte 4, 5.6)', () => {
  it('o plano válido não tem erro', () => {
    expect(validar({})).toEqual({})
    expect(validar({ status: 'Em andamento', prazo: '2027-03-31' })).toEqual({})
  })

  it('nome, responsável e status são obrigatórios', () => {
    expect(validar({ nome: '  ', responsavelId: '', status: '' })).toEqual({
      nome: MENSAGENS_PLANO.nome,
      responsavelId: MENSAGENS_PLANO.responsavel,
      status: MENSAGENS_PLANO.status,
    })
  })

  it('responsável sem vínculo com o cliente (RN-19)', () => {
    expect(validar({ responsavelId: 'usr-marcos' })).toEqual({ responsavelId: MENSAGENS_PLANO.responsavelSemVinculo })
  })

  it('o plano nasce e fica aberto pelo formulário: Concluído e Cancelado são ações da página', () => {
    expect(validar({ status: 'Concluído' })).toEqual({ status: MENSAGENS_PLANO.status })
    expect(validar({ status: 'Aberto' }, atual('Em andamento'))).toEqual({})
  })

  it('no plano fechado, o status não muda pelo formulário (RN-17)', () => {
    expect(validar({ status: 'Concluído' }, atual('Concluído'))).toEqual({})
    expect(validar({ status: 'Aberto' }, atual('Concluído'))).toEqual({ status: MENSAGENS_PLANO.fechado })
  })

  it('prazo que não existe no calendário', () => {
    expect(validar({ prazo: '2027-02-30' })).toEqual({ prazo: MENSAGENS_PLANO.data })
  })
})

describe('lerDadosPlano', () => {
  it('lê os campos sem espaços nas pontas', () => {
    const fd = new FormData()
    fd.set('escopoId', ' esc-x ')
    fd.set('nome', '  Plano  ')
    fd.set('prazo', '2027-03-31')
    expect(lerDadosPlano(fd)).toMatchObject({ escopoId: 'esc-x', nome: 'Plano', prazo: '2027-03-31', descricao: '' })
  })
})
