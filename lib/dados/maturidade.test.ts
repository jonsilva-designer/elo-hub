import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { listarAvaliacoesDoCliente, listarAvaliadores, listarDimensoes, obterAvaliacao } from './maturidade'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const ids = (lista: { id: string }[]) => lista.map((x) => x.id)

describe('listarDimensoes (DF-70)', () => {
  it('traz as 8 dimensões, numa cópia', async () => {
    entrarComo('usr-helena')
    const dimensoes = await listarDimensoes()
    expect(dimensoes).toHaveLength(8)
    dimensoes.pop()
    expect(await listarDimensoes()).toHaveLength(8)
  })
})

describe('listarAvaliacoesDoCliente', () => {
  it('da mais recente para a mais antiga, com o nome do avaliador', async () => {
    entrarComo('usr-helena')
    const avaliacoes = await listarAvaliacoesDoCliente('cli-vertice')
    expect(ids(avaliacoes)).toEqual(['ava-vertice-3', 'ava-vertice-2', 'ava-vertice-1'])
    expect(avaliacoes.map((a) => a.nomeAvaliador)).toEqual(['Rafael Souza', 'Rafael Souza', 'Helena Prado'])
  })

  it('a Equipe recebe lista vazia para um cliente fora do vínculo (RN-01)', async () => {
    entrarComo('usr-rafael')
    expect(await listarAvaliacoesDoCliente('cli-montareal')).toEqual([])
  })

  it('cliente sem avaliação dá lista vazia', async () => {
    entrarComo('usr-rafael')
    expect(await listarAvaliacoesDoCliente('cli-rede-norte')).toEqual([])
  })
})

describe('obterAvaliacao (RN-01, link direto)', () => {
  it('a Equipe recebe null para avaliação de cliente fora do vínculo, igual a uma que não existe', async () => {
    entrarComo('usr-rafael')
    expect(await obterAvaliacao('ava-montareal-1')).toBeNull()
    expect(await obterAvaliacao('ava-nao-existe')).toBeNull()
  })

  it('a Equipe recebe a avaliação do cliente vinculado', async () => {
    entrarComo('usr-rafael')
    expect(await obterAvaliacao('ava-vertice-3')).toMatchObject({
      id: 'ava-vertice-3',
      status: 'Em elaboração',
      nomeAvaliador: 'Rafael Souza',
    })
  })
})

describe('listarAvaliadores (RN-19)', () => {
  it('na Montareal, só a Helena: o Marcos está inativo e o Rafael não tem vínculo', async () => {
    entrarComo('usr-helena')
    expect(ids(await listarAvaliadores('cli-montareal'))).toEqual(['usr-helena'])
  })

  it('na Vértice, a Helena e o Rafael, Administradores primeiro', async () => {
    entrarComo('usr-helena')
    expect(ids(await listarAvaliadores('cli-vertice'))).toEqual(['usr-helena', 'usr-rafael'])
  })

  it('a Equipe recebe lista vazia para um cliente fora do vínculo', async () => {
    entrarComo('usr-rafael')
    expect(await listarAvaliadores('cli-montareal')).toEqual([])
  })
})
