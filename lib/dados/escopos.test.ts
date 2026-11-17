import { connection } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import {
  escopoTemItensLigados,
  escoposQueImpedemFechar,
  etapasQueImpedemFechar,
  listarEscopos,
  listarEscoposDoCliente,
  listarEscoposDoContrato,
  obterEscopo,
} from './escopos'

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

describe('listarEscopos e listarEscoposDoCliente (RN-01, critério 1)', () => {
  it('o Administrador vê os 10 escopos; a Equipe, só os dos clientes vinculados', async () => {
    entrarComo('usr-helena')
    expect(await listarEscopos()).toHaveLength(10)
    entrarComo('usr-rafael')
    const doRafael = await listarEscopos()
    expect(doRafael).toHaveLength(8)
    expect(doRafael.map((e) => e.id)).not.toContain('esc-montareal-montagem')
  })

  it('os escopos do cliente', async () => {
    entrarComo('usr-helena')
    expect((await listarEscoposDoCliente('cli-atlantica')).map((e) => e.id)).toEqual([
      'esc-atlantica-2025',
      'esc-atlantica-2026',
      'esc-atlantica-ssma',
    ])
    entrarComo('usr-rafael')
    expect(await listarEscoposDoCliente('cli-montareal')).toEqual([])
  })
})

describe('obterEscopo (critérios 10 e 20)', () => {
  it('fora do vínculo, null', async () => {
    entrarComo('usr-rafael')
    expect(await obterEscopo('esc-montareal-montagem')).toBeNull()
  })

  it('id que não existe, null', async () => {
    entrarComo('usr-helena')
    expect(await obterEscopo('esc-nao-existe')).toBeNull()
  })

  it('traz o status do contrato, quem classificou e o responsável de cada etapa', async () => {
    entrarComo('usr-helena')
    const escopo = await obterEscopo('esc-vertice-documental')
    expect(escopo).toMatchObject({ statusContrato: 'Ativo', nomeClassificadoPor: 'Helena Prado' })
    expect(escopo?.etapas[0]).toMatchObject({ etapa: 'Diagnosticar', nomeResponsavel: 'Rafael Souza' })
    expect(escopo?.etapas[3]).toMatchObject({ etapa: 'Monitorar', nomeResponsavel: '' })
  })

  it('liga os ciclos do contrato recorrente nos dois sentidos (DF-46)', async () => {
    entrarComo('usr-helena')
    const ciclo2026 = await obterEscopo('esc-atlantica-2026')
    expect(ciclo2026?.cicloAnterior).toEqual({ id: 'esc-atlantica-2025', nome: 'Gestão do contrato portuário, ciclo 2025' })
    expect(ciclo2026?.cicloSeguinte).toBeNull()
    const ciclo2025 = await obterEscopo('esc-atlantica-2025')
    expect(ciclo2025?.cicloSeguinte).toEqual({ id: 'esc-atlantica-2026', nome: 'Gestão do contrato portuário, ciclo 2026' })
    expect(ciclo2025?.cicloAnterior).toBeNull()
  })
})

describe('etapasQueImpedemFechar (DF-59)', () => {
  it('lista as etapas Em andamento do escopo', async () => {
    entrarComo('usr-helena')
    expect(await etapasQueImpedemFechar('esc-vertice-documental')).toEqual([
      {
        tipo: 'Etapa da Jornada',
        descricao: 'Estruturar',
        status: 'Em andamento',
        responsavel: 'Rafael Souza',
        href: '/escopos/esc-vertice-documental',
      },
    ])
  })

  it('sem etapa Em andamento, lista vazia', async () => {
    entrarComo('usr-helena')
    expect(await etapasQueImpedemFechar('esc-vertice-qualidade')).toEqual([])
  })
})

describe('escopoTemItensLigados (RN-13, DF-33)', () => {
  it('a Jornada recém-criada não conta; a Jornada mexida conta', async () => {
    entrarComo('usr-helena')
    expect(await escopoTemItensLigados('esc-vertice-qualidade')).toBe(false)
    expect(await escopoTemItensLigados('esc-vertice-documental')).toBe(true)
  })

  it('fora do vínculo, falso', async () => {
    entrarComo('usr-rafael')
    expect(await escopoTemItensLigados('esc-montareal-montagem')).toBe(false)
  })
})
