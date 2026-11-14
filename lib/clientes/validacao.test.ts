import { describe, expect, it } from 'vitest'
import type { Cliente } from '@/lib/dados/tipos'
import { lerDadosCliente, MENSAGENS_CLIENTE, validarCliente, type DadosCliente } from './validacao'

const vertice: Cliente = {
  id: 'cli-vertice',
  razaoSocial: 'Vértice Manutenção Industrial Ltda',
  nomeFantasia: 'Vértice Manutenção',
  cnpj: '21.473.509/0001-21',
  status: 'Ativo',
  ehCadastroElo: false,
}
const fortec: Cliente = { ...vertice, id: 'cli-fortec', razaoSocial: 'Fortec Energia Ltda', cnpj: '89.231.746/0001-10', status: 'Inativo' }

const valido: DadosCliente = {
  razaoSocial: 'Nova Empresa Ltda',
  nomeFantasia: '',
  cnpj: '11.222.333/0001-81',
  segmento: '',
  cidade: '',
  uf: '',
  status: 'Prospect',
  justificativa: '',
  contatoPrincipal: '',
  cargo: '',
  telefone: '',
  email: '',
  observacoes: '',
}

const novo = (d: Partial<DadosCliente>, comMesmoCnpj: Cliente | null = null) =>
  validarCliente({ ...valido, ...d }, { atual: null, comMesmoCnpj })
const edicao = (atual: Cliente, d: Partial<DadosCliente>, comMesmoCnpj: Cliente | null = null) =>
  validarCliente({ ...valido, ...d }, { atual, comMesmoCnpj })

describe('validarCliente (CA-02.1, CA-02.2, DF-05, RN-22)', () => {
  it('um cadastro completo não tem erro', () => {
    expect(novo({})).toEqual({})
  })

  it('exige a razão social', () => {
    expect(novo({ razaoSocial: '   ' })).toEqual({ razaoSocial: 'Informe a razão social.' })
  })

  it('exige o CNPJ e recusa o inválido ou com dígitos repetidos', () => {
    expect(novo({ cnpj: '' }).cnpj).toBe('Informe o CNPJ.')
    expect(novo({ cnpj: '21.473.509/0001-22' }).cnpj).toBe('CNPJ inválido. Confira os números.')
    expect(novo({ cnpj: '11.111.111/1111-11' }).cnpj).toBe('CNPJ inválido. Confira os números.')
  })

  it('recusa o CNPJ de outro cliente, dizendo qual', () => {
    expect(novo({ cnpj: '21473509000121' }, vertice).cnpj).toBe('Já existe um cliente com este CNPJ: Vértice Manutenção.')
  })

  it('na edição, o próprio CNPJ vale', () => {
    expect(edicao(vertice, { cnpj: '21.473.509/0001-21', status: 'Ativo' }, vertice)).toEqual({})
  })

  it('o e-mail é opcional, mas tem de ser válido quando preenchido', () => {
    expect(novo({ email: 'contato@' }).email).toBe('Informe um e-mail válido.')
    expect(novo({ email: 'contato @empresa.com' }).email).toBe('Informe um e-mail válido.')
    expect(novo({ email: 'contato@empresa.com.br' })).toEqual({})
  })

  it('o status do formulário é Prospect ou Ativo', () => {
    expect(novo({ status: '' }).status).toBe('Escolha o status.')
    expect(novo({ status: 'Inativo' }).status).toBe('Escolha o status.')
    expect(novo({ status: 'Ativo' })).toEqual({})
  })

  it('no cliente Inativo, o status não muda pelo formulário', () => {
    expect(edicao(fortec, { status: 'Ativo', cnpj: fortec.cnpj }, fortec).status).toBe(MENSAGENS_CLIENTE.statusInativo)
    expect(edicao(fortec, { status: 'Inativo', cnpj: fortec.cnpj }, fortec)).toEqual({})
  })

  it('Ativo para Prospect pede justificativa; Prospect para Ativo, não', () => {
    expect(edicao(vertice, { status: 'Prospect', cnpj: vertice.cnpj }, vertice).justificativa).toBe(
      'Escreva a justificativa da mudança.',
    )
    expect(edicao(vertice, { status: 'Prospect', cnpj: vertice.cnpj, justificativa: 'Contrato não fechou' }, vertice)).toEqual({})
    expect(edicao({ ...vertice, status: 'Prospect' }, { status: 'Ativo', cnpj: vertice.cnpj }, vertice)).toEqual({})
  })
})

describe('lerDadosCliente', () => {
  it('lê os campos sem espaços nas pontas, e o que falta vira texto vazio', () => {
    const fd = new FormData()
    fd.set('razaoSocial', '  Nova Empresa Ltda ')
    fd.set('cnpj', ' 11.222.333/0001-81')
    expect(lerDadosCliente(fd)).toMatchObject({ razaoSocial: 'Nova Empresa Ltda', cnpj: '11.222.333/0001-81', email: '' })
  })
})
