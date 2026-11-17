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

describe('listarHistorico de contrato', () => {
  it('traz a suspensão do contrato da Atlântica', async () => {
    entrarComo('usr-helena')
    const entradas = await listarHistorico('contrato', 'ctr-atlantica-ssma')
    expect(entradas[0]).toMatchObject({ descricao: 'Status do contrato', valorAnterior: 'Ativo', valorNovo: 'Suspenso' })
    expect(entradas.at(-1)).toMatchObject({ descricao: 'Contrato criado' })
  })

  it('a passagem de Proposta para Ativo da mobilização fica no histórico (DF-07)', async () => {
    entrarComo('usr-rafael')
    const entradas = await listarHistorico('contrato', 'ctr-vertice-mobilizacao')
    expect(entradas.find((e) => e.descricao === 'Status do contrato')).toMatchObject({
      valorAnterior: 'Proposta',
      valorNovo: 'Ativo',
    })
  })

  it('a Equipe recebe lista vazia fora do vínculo', async () => {
    entrarComo('usr-rafael')
    expect(await listarHistorico('contrato', 'ctr-montareal-montagem')).toEqual([])
  })
})

describe('listarHistorico de escopo', () => {
  it('a reclassificação da criticidade guarda a justificativa (CA-05.2)', async () => {
    entrarComo('usr-helena')
    const entradas = await listarHistorico('escopo', 'esc-vertice-documental')
    expect(entradas.find((e) => e.descricao === 'Criticidade')).toMatchObject({
      usuario: 'Helena Prado',
      valorAnterior: 'Moderada',
      valorNovo: 'Alta',
      justificativa: 'Três certidões vencem antes da próxima medição, e o contratante pode reter o pagamento sem elas.',
    })
    expect(entradas.at(-1)).toMatchObject({ descricao: 'Escopo criado', usuario: 'Helena Prado' })
  })

  it('o escopo movido de contrato fica no histórico (DF-45)', async () => {
    entrarComo('usr-rafael')
    const entradas = await listarHistorico('escopo', 'esc-vertice-mobilizacao')
    expect(entradas.find((e) => e.descricao === 'Contrato')).toMatchObject({
      valorAnterior: 'CT-2025-031',
      valorNovo: 'CT-2026-044',
    })
  })

  it('entrada sem justificativa não traz o campo', async () => {
    entrarComo('usr-helena')
    const entradas = await listarHistorico('escopo', 'esc-atlantica-ssma')
    expect(entradas[0]).toMatchObject({ descricao: 'Status do escopo', valorAnterior: 'Em andamento', valorNovo: 'Cancelado' })
    expect(entradas[0]).not.toHaveProperty('justificativa')
  })

  it('a Equipe recebe lista vazia fora do vínculo', async () => {
    entrarComo('usr-rafael')
    expect(await listarHistorico('escopo', 'esc-montareal-montagem')).toEqual([])
  })
})

describe('listarHistorico de plano (parte 4, 5.2)', () => {
  it('junta as entradas do plano e as das atividades, com o nome da atividade na frente', async () => {
    entrarComo('usr-rafael')
    const entradas = await listarHistorico('plano', 'pla-vertice-licencas')
    const descricoes = entradas.map((e) => e.descricao)
    expect(descricoes).toContain('Plano criado')
    expect(descricoes).toContain('Status do plano')
    expect(descricoes).toContain('Levantar as licenças vencidas · Status da atividade')
    expect(entradas.find((e) => e.justificativa)).toMatchObject({
      descricao: 'Levantar as licenças vencidas · Status da atividade',
      valorAnterior: 'Concluída',
      valorNovo: 'Em andamento',
    })
  })

  it('a Equipe recebe lista vazia fora do vínculo', async () => {
    entrarComo('usr-rafael')
    expect(await listarHistorico('plano', 'pla-montareal-estruturas')).toEqual([])
  })
})
