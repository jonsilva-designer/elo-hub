import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listarContratos } from '@/lib/dados/contratos'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { escreverFiltrosContratos, filtrarContratos, lerFiltrosContratos, type FiltrosContratos } from './filtros'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const SEM_FILTRO: FiltrosContratos = { busca: '', cliente: null, contratante: null, servico: null, status: [], vigencia: [] }

async function filtrar(parcial: Partial<FiltrosContratos> = {}) {
  entrarComo('usr-helena')
  return filtrarContratos(await listarContratos(), { ...SEM_FILTRO, ...parcial }).map((c) => c.id)
}

describe('filtrarContratos (CA-03.5, CA-03.7, CA-16.1, critério 2)', () => {
  it('sem filtro, mostra os 11: os com término pelo término, depois o indeterminado, as propostas e os fechados', async () => {
    const ids = await filtrar()
    expect(ids).toHaveLength(11)
    expect(ids[0]).toBe('ctr-rede-norte-rmm')
    expect(ids.slice(0, 5)).toContain('ctr-vertice-mobilizacao')
    expect(ids[5]).toBe('ctr-atlantica-porto')
    expect(ids.slice(6, 8)).toEqual(['ctr-vertice-proposta', 'ctr-rede-norte-glpi'])
    expect(ids.slice(8)).toEqual(['ctr-fortec-subestacoes', 'ctr-ondamar-apoio', 'ctr-montareal-pintura'])
  })

  it('a busca acha pelo código, sem diferenciar maiúsculas, e pelo objeto, sem diferenciar acentos', async () => {
    expect(await filtrar({ busca: 'ct-2025-031' })).toEqual(['ctr-vertice-manutencao', 'ctr-montareal-montagem'])
    expect(await filtrar({ busca: 'MONITORAMENTO' })).toEqual(['ctr-rede-norte-rmm'])
    expect(await filtrar({ busca: 'implantacao' })).toEqual(['ctr-rede-norte-rmm'])
  })

  it('os filtros se combinam', async () => {
    expect(await filtrar({ cliente: 'cli-atlantica', status: ['Suspenso'] })).toEqual(['ctr-atlantica-ssma'])
    expect(await filtrar({ vigencia: ['Vencido'] })).toEqual(['ctr-rede-norte-rmm'])
    expect(await filtrar({ servico: 'Tecnologia da Informação' })).toEqual(['ctr-rede-norte-rmm', 'ctr-rede-norte-glpi'])
    expect(await filtrar({ contratante: 'Porto do Açu', status: ['Ativo'] })).toEqual(['ctr-atlantica-porto'])
  })
})

describe('lerFiltrosContratos e escreverFiltrosContratos (CA-16.2)', () => {
  const OPCOES = { clientes: ['cli-vertice', 'cli-atlantica'], contratantes: ['Petrobras'], servicos: ['Engenharia'] }

  it('ignoram o que não está nas opções', () => {
    const lidos = lerFiltrosContratos(
      new URLSearchParams('status=Xyz,Ativo&vigencia=Vencido,Talvez&cliente=cli-montareal&contratante=Shell&servico=Engenharia'),
      OPCOES,
    )
    expect(lidos).toEqual({ ...SEM_FILTRO, status: ['Ativo'], vigencia: ['Vencido'], servico: 'Engenharia' })
  })

  it('vão e voltam iguais', () => {
    const filtros: FiltrosContratos = {
      busca: 'ct 2025',
      cliente: 'cli-vertice',
      contratante: 'Petrobras',
      servico: 'Engenharia',
      status: ['Ativo', 'Suspenso'],
      vigencia: ['Próximo do vencimento'],
    }
    const texto = escreverFiltrosContratos(filtros)
    expect(texto).toContain('status=Ativo,Suspenso')
    expect(lerFiltrosContratos(new URLSearchParams(texto), OPCOES)).toEqual(filtros)
    expect(escreverFiltrosContratos(SEM_FILTRO)).toBe('')
  })
})
