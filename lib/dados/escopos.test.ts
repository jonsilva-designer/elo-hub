import { connection } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { escoposQueImpedemFechar, listarEscoposDoContrato } from './escopos'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

describe('listarEscoposDoContrato', () => {
  it('traz os escopos com a etapa atual, o progresso e os nomes (RN-08, DF-28)', async () => {
    entrarComo('usr-helena')
    const escopos = await listarEscoposDoContrato('ctr-vertice-manutencao')
    expect(escopos.map((e) => e.id)).toEqual(['esc-vertice-documental', 'esc-vertice-qualidade'])
    expect(escopos[0]).toMatchObject({
      etapaAtual: 'Estruturar',
      progresso: { concluidas: 1, aplicaveis: 5 },
      planejamento: false,
      nomeResponsavel: 'Rafael Souza',
      codigoContrato: 'CT-2025-031',
      nomeCliente: 'Vértice Manutenção',
    })
  })

  it('o escopo de contrato em Proposta é planejamento (DF-48)', async () => {
    entrarComo('usr-helena')
    const [escopo] = await listarEscoposDoContrato('ctr-vertice-proposta')
    expect(escopo).toMatchObject({ id: 'esc-vertice-diagnostico', planejamento: true })
  })

  it('a mobilização começa em Implementar, e a conclusão prevista vem 50 dias depois de hoje', async () => {
    entrarComo('usr-helena')
    const [escopo] = await listarEscoposDoContrato('ctr-vertice-mobilizacao')
    expect(escopo).toMatchObject({ etapaAtual: 'Implementar', progresso: { concluidas: 0, aplicaveis: 3 } })
    expect(escopo.conclusaoPrevista).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(escopo).not.toHaveProperty('conclusaoPrevistaEmDias')
  })

  it('fora do vínculo, lista vazia', async () => {
    entrarComo('usr-rafael')
    expect(await listarEscoposDoContrato('ctr-montareal-montagem')).toEqual([])
  })
})

describe('escoposQueImpedemFechar (RN-18)', () => {
  it('lista os escopos abertos do contrato', async () => {
    entrarComo('usr-helena')
    expect(await escoposQueImpedemFechar('ctr-vertice-manutencao')).toEqual([
      {
        tipo: 'Escopo',
        descricao: 'Regularização documental',
        status: 'Em andamento',
        responsavel: 'Rafael Souza',
        href: '/escopos/esc-vertice-documental',
      },
      {
        tipo: 'Escopo',
        descricao: 'Programa de qualidade',
        status: 'Planejado',
        responsavel: 'Helena Prado',
        href: '/escopos/esc-vertice-qualidade',
      },
    ])
  })

  it('o contrato Suspenso da Atlântica só tem escopo Cancelado: nada impede', async () => {
    entrarComo('usr-helena')
    expect(await escoposQueImpedemFechar('ctr-atlantica-ssma')).toEqual([])
  })
})

describe('data de hoje na requisição (cacheComponents)', () => {
  it('listarEscoposDoContrato espera o connection() antes de ler a data', async () => {
    entrarComo('usr-helena')
    vi.mocked(connection).mockClear()
    await listarEscoposDoContrato('ctr-vertice-manutencao')
    expect(connection).toHaveBeenCalled()
  })
})
