import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listarDemandas } from '@/lib/dados/demandas'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import {
  CHAVE_FILTROS_DAS_DEMANDAS,
  escreverFiltrosDemandas,
  filtrarDemandas,
  lerFiltrosDemandas,
  opcoesDasDemandas,
  type FiltrosDemandas,
} from './filtros'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const SEM_FILTRO: FiltrosDemandas = {
  busca: '',
  cliente: null,
  contrato: null,
  escopo: null,
  responsavel: null,
  status: [],
  criticidade: [],
  de: null,
  ate: null,
}

async function daHelena() {
  entrarComo('usr-helena')
  return listarDemandas()
}

const numeros = (lista: { numero: string }[]) => lista.map((d) => d.numero)

describe('filtros da fila de demandas (CA-09.7, CA-16.2)', () => {
  it('guarda os filtros com uma chave própria', () => {
    expect(CHAVE_FILTROS_DAS_DEMANDAS).toBe('elo:filtros-demandas')
  })

  it('lê e escreve o endereço, ida e volta; o que não está nas opções, ou a data que não existe, é ignorado', async () => {
    const opcoes = opcoesDasDemandas(await daHelena())
    const filtros: FiltrosDemandas = {
      busca: 'certidão',
      cliente: 'cli-vertice',
      contrato: 'ctr-vertice-manutencao',
      escopo: 'esc-vertice-documental',
      responsavel: 'usr-rafael',
      status: ['Em atendimento', 'Em triagem'],
      criticidade: ['Alta'],
      de: '2026-04-01',
      ate: '2026-11-30',
    }
    const ids = {
      clientes: opcoes.clientes.map((o) => o.valor),
      contratos: opcoes.contratos.map((o) => o.valor),
      escopos: opcoes.escopos.map((o) => o.valor),
      responsaveis: opcoes.responsaveis.map((o) => o.valor),
    }
    expect(lerFiltrosDemandas(new URLSearchParams(escreverFiltrosDemandas(filtros)), ids)).toEqual(filtros)
    expect(escreverFiltrosDemandas(SEM_FILTRO)).toBe('')
    expect(lerFiltrosDemandas(new URLSearchParams('cliente=cli-x&status=Arquivada&de=2026-02-30'), ids)).toEqual(SEM_FILTRO)
  })

  it('ordem: as abertas das mais críticas para as menos e pela abertura; as Encerradas no fim', async () => {
    expect(numeros(filtrarDemandas(await daHelena(), SEM_FILTRO))).toEqual([
      'ELO-2026-0008',
      'ELO-2026-0003',
      'ELO-2026-0006',
      'ELO-2026-0005',
      'ELO-2026-0004',
      'ELO-2026-0007',
      'ELO-2026-0009',
      'ELO-2026-0010',
      'ELO-2026-0011',
      'ELO-2026-0001',
      'ELO-2026-0002',
    ])
  })

  it('pelo responsável da triagem ou do atendimento, pelo status e pela criticidade', async () => {
    const demandas = await daHelena()
    expect(numeros(filtrarDemandas(demandas, { ...SEM_FILTRO, responsavel: 'usr-helena' }))).toEqual([
      'ELO-2026-0008',
      'ELO-2026-0006',
      'ELO-2026-0004',
      'ELO-2026-0007',
      'ELO-2026-0011',
    ])
    expect(numeros(filtrarDemandas(demandas, { ...SEM_FILTRO, status: ['Resolvida'] }))).toEqual(['ELO-2026-0005'])
    expect(numeros(filtrarDemandas(demandas, { ...SEM_FILTRO, criticidade: ['Crítica'] }))).toEqual(['ELO-2026-0008'])
  })

  it('pelo período de abertura, inclusive, e pelo escopo', async () => {
    const demandas = await daHelena()
    expect(numeros(filtrarDemandas(demandas, { ...SEM_FILTRO, de: '2026-11-10', ate: '2026-11-14' }))).toEqual([
      'ELO-2026-0009',
      'ELO-2026-0010',
    ])
    expect(numeros(filtrarDemandas(demandas, { ...SEM_FILTRO, escopo: 'esc-vertice-documental' }))).toEqual([
      'ELO-2026-0003',
      'ELO-2026-0009',
    ])
  })

  it('a busca acha pelo número e pelo assunto, sem acento nem maiúsculas', async () => {
    const demandas = await daHelena()
    expect(numeros(filtrarDemandas(demandas, { ...SEM_FILTRO, busca: 'elo-2026-0005' }))).toEqual(['ELO-2026-0005'])
    expect(numeros(filtrarDemandas(demandas, { ...SEM_FILTRO, busca: 'CERTIDOES' }))).toEqual(['ELO-2026-0003', 'ELO-2026-0002'])
  })
})

describe('filtrarDemandas, revisão do código', () => {
  it('com "Aberta de" depois de "Aberta até", o período é lido na ordem certa, e não esvazia a lista', async () => {
    const demandas = await daHelena()
    const certa = filtrarDemandas(demandas, { ...SEM_FILTRO, de: '2026-01-01', ate: '2026-12-31' })
    const invertida = filtrarDemandas(demandas, { ...SEM_FILTRO, de: '2026-12-31', ate: '2026-01-01' })
    expect(certa.length).toBeGreaterThan(0)
    expect(numeros(invertida)).toEqual(numeros(certa))
  })
})
