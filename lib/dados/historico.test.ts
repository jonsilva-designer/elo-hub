import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { listarHistorico } from './historico'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

describe('listarHistorico (F17, CA-17.1, CA-17.3)', () => {
  it('lista da mais recente para a mais antiga, com o nome do usuário', async () => {
    entrarComo('usr-helena')
    const entradas = await listarHistorico('cliente', 'cli-vertice')
    expect(entradas[0]).toMatchObject({ descricao: 'Telefone', usuario: 'Helena Prado', valorNovo: '(22) 2765-4310' })
    expect(entradas.at(-1)).toMatchObject({ descricao: 'Cadastro criado', usuario: 'Helena Prado' })
    const tempos = entradas.map((e) => Date.parse(e.dataHora))
    expect(tempos).toEqual([...tempos].sort((a, b) => b - a))
  })

  it('traz o valor anterior e o novo', async () => {
    entrarComo('usr-helena')
    const entradas = await listarHistorico('avaliacao', 'ava-vertice-2')
    expect(entradas.find((e) => e.descricao === 'Avaliador')).toMatchObject({
      valorAnterior: 'Helena Prado',
      valorNovo: 'Rafael Souza',
    })
  })

  it('a Equipe recebe lista vazia para registros fora do vínculo', async () => {
    entrarComo('usr-rafael')
    expect(await listarHistorico('cliente', 'cli-montareal')).toEqual([])
    expect(await listarHistorico('avaliacao', 'ava-montareal-1')).toEqual([])
    expect(await listarHistorico('avaliacao', 'ava-nao-existe')).toEqual([])
  })

  it('a Equipe vê o histórico da avaliação do cliente vinculado', async () => {
    entrarComo('usr-rafael')
    expect((await listarHistorico('avaliacao', 'ava-vertice-3')).map((e) => e.descricao)).toEqual(['Avaliação criada'])
  })
})
