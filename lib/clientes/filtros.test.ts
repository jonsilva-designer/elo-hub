import { describe, expect, it } from 'vitest'
import type { Cliente } from '@/lib/dados/tipos'
import { escreverFiltros, filtrarClientes, lerFiltros, nomeDoCliente, paramsDaBusca, type FiltrosClientes } from './filtros'

const base = { ehCadastroElo: false } as const
const vertice: Cliente = {
  ...base,
  id: 'v',
  razaoSocial: 'Vértice Manutenção Industrial Ltda',
  nomeFantasia: 'Vértice Manutenção',
  cnpj: '21.473.509/0001-21',
  segmento: 'Manutenção e serviços industriais',
  status: 'Ativo',
}
const redeNorte: Cliente = {
  ...base,
  id: 'r',
  razaoSocial: 'Rede Norte Tecnologia Ltda',
  nomeFantasia: 'Rede Norte TI',
  cnpj: '45.190.832/0001-56',
  segmento: 'Tecnologia',
  status: 'Ativo',
}
const limpar: Cliente = {
  ...base,
  id: 'l',
  razaoSocial: 'Limpar Serviços Gerais Ltda',
  nomeFantasia: 'Limpar Serviços',
  cnpj: '74.602.185/0001-40',
  segmento: 'Serviços gerais',
  status: 'Prospect',
}
const fortec: Cliente = {
  ...base,
  id: 'f',
  razaoSocial: 'Fortec Energia Ltda',
  nomeFantasia: 'Fortec Energia',
  cnpj: '89.231.746/0001-10',
  segmento: 'Energia',
  status: 'Inativo',
}
const semFantasia: Cliente = { ...base, id: 's', razaoSocial: 'Atlas Comércio S.A.', cnpj: '33.814.276/0001-62', status: 'Ativo' }

const TODOS = [vertice, redeNorte, limpar, fortec, semFantasia]
const SEGMENTOS = ['Energia', 'Manutenção e serviços industriais', 'Serviços gerais', 'Tecnologia']
const SEM_FILTRO: FiltrosClientes = { busca: '', status: [], segmento: null }
const ids = (lista: Cliente[]) => lista.map((c) => c.id)
const filtrar = (f: Partial<FiltrosClientes>) => ids(filtrarClientes(TODOS, { ...SEM_FILTRO, ...f }))

describe('nomeDoCliente', () => {
  it('é o nome fantasia ou, sem ele, a razão social', () => {
    expect(nomeDoCliente(vertice)).toBe('Vértice Manutenção')
    expect(nomeDoCliente(semFantasia)).toBe('Atlas Comércio S.A.')
  })
})

describe('filtrarClientes (CA-16.1, CA-18.2)', () => {
  it('sem filtro, mostra Prospect e Ativo, ordenados pelo nome', () => {
    expect(filtrar({})).toEqual(['s', 'l', 'r', 'v'])
  })

  it('com o filtro Inativo, mostra só o inativo', () => {
    expect(filtrar({ status: ['Inativo'] })).toEqual(['f'])
  })

  it('busca sem diferenciar maiúsculas e acentos, no nome fantasia e na razão social', () => {
    expect(filtrar({ busca: 'vertice' })).toEqual(['v'])
    expect(filtrar({ busca: 'VÉRTICE' })).toEqual(['v'])
    expect(filtrar({ busca: 'industrial ltda' })).toEqual(['v'])
  })

  it('busca pelo CNPJ, com ou sem pontuação', () => {
    expect(filtrar({ busca: '21.473' })).toEqual(['v'])
    expect(filtrar({ busca: '21473509000121' })).toEqual(['v'])
  })

  it('busca só com espaços ou pontuação conta como vazia', () => {
    expect(filtrar({ busca: '   ' })).toEqual(filtrar({}))
    expect(filtrar({ busca: '.' })).toEqual(filtrar({}))
  })

  it('busca, status e segmento se combinam', () => {
    expect(filtrar({ busca: 'ltda', segmento: 'Tecnologia' })).toEqual(['r'])
    expect(filtrar({ busca: 'ltda', status: ['Prospect', 'Inativo'] })).toEqual(['f', 'l'])
  })
})

describe('lerFiltros e escreverFiltros (CA-16.2)', () => {
  it('ignora status e segmento desconhecidos e segue com o resto', () => {
    expect(lerFiltros(new URLSearchParams('busca=vert&status=Ativo,Xyz&segmento=Nada'), SEGMENTOS)).toEqual({
      busca: 'vert',
      status: ['Ativo'],
      segmento: null,
    })
  })

  it('escreve só o que difere do padrão, com a vírgula legível', () => {
    const filtros: FiltrosClientes = { busca: 'vert', status: ['Ativo', 'Inativo'], segmento: 'Tecnologia' }
    expect(escreverFiltros(filtros)).toBe('busca=vert&status=Ativo,Inativo&segmento=Tecnologia')
    expect(escreverFiltros(SEM_FILTRO)).toBe('')
    expect(escreverFiltros({ ...SEM_FILTRO, busca: '   ' })).toBe('')
  })

  it('o que escreve, lê de volta igual', () => {
    const filtros: FiltrosClientes = { busca: 'são joão', status: ['Prospect'], segmento: 'Manutenção e serviços industriais' }
    expect(lerFiltros(new URLSearchParams(escreverFiltros(filtros)), SEGMENTOS)).toEqual(filtros)
  })

  it('paramsDaBusca usa o primeiro valor de um parâmetro repetido', () => {
    expect(paramsDaBusca({ busca: ['a', 'b'], status: 'Ativo', vazio: undefined }).toString()).toBe('busca=a&status=Ativo')
  })
})

describe('filtro da carteira (CA-13.4)', () => {
  const elo = { id: 'e', razaoSocial: 'ELO HUB', cnpj: '1', status: 'Ativo', ehCadastroElo: true } as const
  const vertice = { id: 'v', razaoSocial: 'Vértice', cnpj: '2', status: 'Ativo', ehCadastroElo: false } as const

  it('com carteira=sim, a lista tira o cadastro da ELO; sem ele, mostra', () => {
    const lidos = lerFiltros(new URLSearchParams('status=Ativo&carteira=sim'), [])
    expect(lidos).toEqual({ busca: '', status: ['Ativo'], segmento: null, carteira: true })
    expect(filtrarClientes([elo, vertice], lidos).map((c) => c.id)).toEqual(['v'])
    expect(filtrarClientes([elo, vertice], { ...lidos, carteira: false }).map((c) => c.id)).toEqual(['e', 'v'])
    expect(escreverFiltros(lidos)).toBe('status=Ativo&carteira=sim')
    expect(lerFiltros(new URLSearchParams('carteira=nao'), [])).toEqual({ busca: '', status: [], segmento: null })
  })
})
