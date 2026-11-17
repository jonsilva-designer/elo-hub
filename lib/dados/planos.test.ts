import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { obterContrato } from './contratos'
import { atividadesQueImpedemFechar, listarPlanosDaAvaliacao, listarPlanosDoEscopo, obterPlano, planosQueImpedemFechar } from './planos'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

describe('leitura dos planos (F07, RN-01)', () => {
  it('o plano das licenças traz o resumo, o escopo e o término do contrato (CA-07.2, RN-21)', async () => {
    entrarComo('usr-helena')
    const plano = await obterPlano('pla-vertice-licencas')
    const contrato = await obterContrato('ctr-vertice-manutencao')
    expect(plano).toMatchObject({
      nome: 'Regularização das licenças',
      nomeResponsavel: 'Rafael Souza',
      nomeEscopo: 'Regularização documental',
      statusEscopo: 'Em andamento',
      contratoId: 'ctr-vertice-manutencao',
      codigoContrato: 'CT-2025-031',
      nomeCliente: 'Vértice Manutenção',
      planejamento: false,
      avaliacao: null,
      resumo: { total: 5, concluidas: 1, atrasadas: 1 },
    })
    expect(plano?.terminoDoContrato).toBe(contrato?.termino)
    expect(plano?.prazo).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('o plano de desenvolvimento é planejamento, sem término para a RN-21, e liga a avaliação (DF-48, DF-80)', async () => {
    entrarComo('usr-helena')
    expect(await obterPlano('pla-vertice-desenvolvimento')).toMatchObject({
      planejamento: true,
      terminoDoContrato: null,
      avaliacao: { id: 'ava-vertice-2', data: '2026-09-15', status: 'Concluída' },
    })
  })

  it('contrato por prazo indeterminado não tem término para a RN-21', async () => {
    entrarComo('usr-helena')
    expect((await obterPlano('pla-atlantica-indicadores'))?.terminoDoContrato).toBeNull()
  })

  it('o Rafael não vê o plano da Montareal; id que não existe dá null', async () => {
    entrarComo('usr-rafael')
    expect(await obterPlano('pla-montareal-estruturas')).toBeNull()
    expect(await obterPlano('pla-nao-existe')).toBeNull()
    expect(await obterPlano('pla-vertice-licencas')).not.toBeNull()
  })

  it('os planos do escopo e os da avaliação', async () => {
    entrarComo('usr-helena')
    expect((await listarPlanosDoEscopo('esc-vertice-documental')).map((p) => p.id)).toEqual(['pla-vertice-licencas'])
    expect(await listarPlanosDoEscopo('esc-vertice-qualidade')).toEqual([])
    expect((await listarPlanosDaAvaliacao('ava-vertice-2')).map((p) => p.id)).toEqual(['pla-vertice-desenvolvimento'])
    expect(await listarPlanosDaAvaliacao('ava-atlantica-1')).toEqual([])
    entrarComo('usr-rafael')
    expect(await listarPlanosDoEscopo('esc-montareal-montagem')).toEqual([])
  })
})

describe('o que impede fechar (RN-18, CA-18.3)', () => {
  it('as atividades abertas impedem fechar o plano', async () => {
    entrarComo('usr-helena')
    const itens = await atividadesQueImpedemFechar('pla-vertice-licencas')
    expect(itens.map((i) => i.descricao)).toEqual([
      'Protocolar a renovação da licença de operação',
      'Agendar a vistoria do órgão ambiental',
      'Preparar a auditoria interna dos documentos',
    ])
    expect(itens[0]).toEqual({
      tipo: 'Atividade',
      descricao: 'Protocolar a renovação da licença de operação',
      status: 'Em andamento',
      responsavel: 'Rafael Souza',
      href: '/planos/pla-vertice-licencas',
    })
    expect(await atividadesQueImpedemFechar('pla-atlantica-indicadores')).toEqual([])
  })

  it('os planos abertos impedem fechar o escopo', async () => {
    entrarComo('usr-helena')
    expect(await planosQueImpedemFechar('esc-vertice-documental')).toEqual([
      {
        tipo: 'Plano de ação',
        descricao: 'Regularização das licenças',
        status: 'Em andamento',
        responsavel: 'Rafael Souza',
        href: '/planos/pla-vertice-licencas',
      },
    ])
    expect(await planosQueImpedemFechar('esc-rede-norte-rmm')).toEqual([])
  })
})
