import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { listarAtividades, listarAtividadesDoPlano, obterAtividade } from './atividades'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

describe('leitura das atividades (F08, RN-01)', () => {
  it('a Helena vê as 12; o Rafael, as 11 dos clientes dele', async () => {
    entrarComo('usr-helena')
    expect(await listarAtividades()).toHaveLength(12)
    entrarComo('usr-rafael')
    const doRafael = await listarAtividades()
    expect(doRafael).toHaveLength(11)
    expect(doRafael.map((a) => a.id)).not.toContain('atv-estruturas-inspecao')
  })

  it('a situação do prazo é calculada com hoje (RN-09, RN-10, CA-08.1)', async () => {
    entrarComo('usr-helena')
    const atividades = await listarAtividadesDoPlano('pla-vertice-licencas')
    const situacao = Object.fromEntries(atividades.map((a) => [a.id, a.situacao]))
    expect(situacao).toEqual({
      'atv-licencas-protocolo': 'Atrasada',
      'atv-licencas-vistoria': 'Próxima do prazo',
      'atv-licencas-auditoria': null,
      'atv-licencas-levantamento': null,
      'atv-licencas-alvara': null,
    })
  })

  it('traz o plano, o escopo, o cliente, o responsável e o executor (CA-08.8)', async () => {
    entrarComo('usr-rafael')
    expect(await obterAtividade('atv-licencas-vistoria')).toMatchObject({
      nomePlano: 'Regularização das licenças',
      statusPlano: 'Em andamento',
      escopoId: 'esc-vertice-documental',
      nomeEscopo: 'Regularização documental',
      nomeCliente: 'Vértice Manutenção',
      nomeResponsavel: 'Rafael Souza',
      executor: 'Ana Ribeiro (SSMA do cliente)',
      status: 'Não iniciada',
      conclusao: null,
    })
  })

  it('o prazo relativo vira data; a concluída mantém a data de conclusão (DF-43)', async () => {
    entrarComo('usr-helena')
    expect((await obterAtividade('atv-licencas-protocolo'))?.prazo).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(await obterAtividade('atv-licencas-levantamento')).toMatchObject({ prazo: '2026-05-15', conclusao: '2026-05-20' })
  })

  it('fora do vínculo ou com id que não existe, null', async () => {
    entrarComo('usr-rafael')
    expect(await obterAtividade('atv-estruturas-inspecao')).toBeNull()
    expect(await obterAtividade('atv-nao-existe')).toBeNull()
    expect(await listarAtividadesDoPlano('pla-montareal-estruturas')).toEqual([])
  })
})
