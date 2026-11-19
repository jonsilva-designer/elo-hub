import { beforeEach, describe, expect, it, vi } from 'vitest'
import { filtrarAtividades, lerFiltrosAtividades } from '@/lib/atividades/filtros'
import { filtrarClientes, lerFiltros } from '@/lib/clientes/filtros'
import { filtrarContratos, lerFiltrosContratos } from '@/lib/contratos/filtros'
import { filtrarDemandas, lerFiltrosDemandas } from '@/lib/demandas/filtros'
import { filtrarEscopos, lerFiltrosEscopos } from '@/lib/escopos/filtros'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { listarAtividades } from './atividades'
import { listarClientes } from './clientes'
import { listarContratos } from './contratos'
import { listarDemandas } from './demandas'
import { listarEscopos } from './escopos'
import { indicadoresDoPainel, type Indicador } from './painel'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const todos = async (usuarioId: string) => {
  const p = await indicadoresDoPainel()
  return [
    p.clientesAtivos,
    ...Object.values(p.contratos),
    p.escopos.total,
    ...p.escopos.porStatus,
    ...p.escopos.porCriticidade,
    ...p.escopos.porEtapa,
    ...Object.values(p.atividades),
    p.demandas.abertas,
    ...p.demandas.porStatus,
    ...p.demandas.porCriticidade,
  ].map((i) => ({ ...i, usuarioId }))
}

/** Quantas linhas a lista mostra ao abrir o endereço do indicador, pelas mesmas funções da tela da lista. */
async function contarNaLista(i: Indicador & { usuarioId: string }): Promise<number> {
  const url = new URL(i.href, 'http://localhost')
  const params = url.searchParams
  switch (url.pathname) {
    case '/clientes':
      return filtrarClientes(await listarClientes(), lerFiltros(params, [])).length
    case '/contratos':
      return filtrarContratos(await listarContratos(), lerFiltrosContratos(params, { clientes: [], contratantes: [], servicos: [] })).length
    case '/escopos':
      return filtrarEscopos(await listarEscopos(), lerFiltrosEscopos(params, { clientes: [], contratos: [], responsaveis: [] })).length
    case '/minhas-atividades':
      return filtrarAtividades(
        await listarAtividades(),
        lerFiltrosAtividades(params, { usuarioId: i.usuarioId, responsaveis: [], escopos: [] }),
      ).length
    case '/central':
      return filtrarDemandas(await listarDemandas(), lerFiltrosDemandas(params, { clientes: [], contratos: [], escopos: [], responsaveis: [] }))
        .length
    default:
      throw new Error(`lista desconhecida: ${i.href}`)
  }
}

describe('indicadores do painel (F13)', () => {
  it('cada número é igual à lista que ele abre, para os dois perfis (CA-13.1, CA-13.3)', async () => {
    for (const usuarioId of ['usr-helena', 'usr-rafael']) {
      entrarComo(usuarioId)
      for (const i of await todos(usuarioId)) expect(i.valor, `${usuarioId} ${i.rotulo} ${i.href}`).toBe(await contarNaLista(i))
    }
  })

  it('clientes ativos não contam o cadastro da ELO, e a lista aberta também não (CA-13.4)', async () => {
    entrarComo('usr-helena')
    const { clientesAtivos } = await indicadoresDoPainel()
    expect(clientesAtivos.href).toBe('/clientes?status=Ativo&carteira=sim')
    const ativos = (await listarClientes()).filter((c) => c.status === 'Ativo')
    expect(ativos.some((c) => c.ehCadastroElo)).toBe(true)
    expect(clientesAtivos.valor).toBe(ativos.length - 1)
  })

  it('a Equipe vê números só dos clientes vinculados (CA-13.2)', async () => {
    entrarComo('usr-helena')
    const daHelena = await indicadoresDoPainel()
    entrarComo('usr-rafael')
    const doRafael = await indicadoresDoPainel()
    expect(doRafael.escopos.total.valor).toBeLessThan(daHelena.escopos.total.valor)
    expect(doRafael.clientesAtivos.valor).toBe(3)
  })

  it('os blocos e os destaques de F13', async () => {
    entrarComo('usr-helena')
    const p = await indicadoresDoPainel()
    const { vigentes, proximos, vencidos, suspensos } = p.contratos
    expect([vigentes, proximos, vencidos, suspensos].map((i) => [i.rotulo, i.tom ?? null])).toEqual([
      ['Vigentes', null],
      ['Próximos do vencimento', 'atencao'],
      ['Vencidos', 'problema'],
      ['Suspensos', 'atencao'],
    ])
    expect(proximos.href).toBe('/contratos?vigencia=Pr%C3%B3ximo+do+vencimento')
    // Os contratos em vigor são o todo do gráfico: as três vigências somam ele.
    expect(p.contratos.emVigor.href).toBe('/contratos?vigencia=Vigente,Pr%C3%B3ximo+do+vencimento,Vencido')
    expect(vigentes.valor + proximos.valor + vencidos.valor).toBe(p.contratos.emVigor.valor)
    expect(p.escopos.porStatus.map((i) => i.rotulo)).toEqual(['Planejado', 'Em andamento', 'Em espera', 'Concluído', 'Cancelado'])
    expect(p.escopos.porCriticidade.map((i) => i.rotulo)).toEqual(['Crítica', 'Alta', 'Moderada', 'Baixa'])
    // A etapa atual conta os escopos abertos: o fechado já terminou a Jornada (CA-06.4).
    expect(p.escopos.porEtapa.map((i) => i.rotulo)).toEqual(['Não iniciada', 'Diagnosticar', 'Estruturar', 'Implementar', 'Monitorar', 'Evoluir'])
    expect(p.escopos.porEtapa[3].href).toBe('/escopos?status=Planejado,Em+andamento,Em+espera&etapa=Implementar')
    const abertos = p.escopos.porStatus.slice(0, 3).reduce((soma, i) => soma + i.valor, 0)
    expect(p.escopos.porEtapa.reduce((soma, i) => soma + i.valor, 0)).toBe(abertos)
    const { abertas, concluidas, noPrazo, proximas, atrasadas } = p.atividades
    expect([abertas, concluidas, noPrazo, proximas, atrasadas].map((i) => i.rotulo)).toEqual([
      'Abertas',
      'Concluídas',
      'No prazo',
      'Próximas do prazo',
      'Atrasadas',
    ])
    expect(abertas.href).toBe('/minhas-atividades?responsavel=todos&status=N%C3%A3o+iniciada,Em+andamento')
    expect(noPrazo.href).toBe('/minhas-atividades?responsavel=todos&prazo=No+prazo')
    // As partes fecham o todo: é o que o gráfico do Início mostra (revisão do Jonathan).
    expect(noPrazo.valor + proximas.valor + atrasadas.valor).toBe(abertas.valor)
    expect(atrasadas.valor).toBeGreaterThan(0)
    expect(p.demandas.porStatus.map((i) => i.rotulo)).toEqual(['Nova', 'Em triagem', 'Em atendimento', 'Aguardando retorno', 'Resolvida'])
    expect(p.demandas.abertas.valor).toBe(p.demandas.porStatus.reduce((soma, i) => soma + i.valor, 0))
  })
})
