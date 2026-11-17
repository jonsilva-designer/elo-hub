import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listarEscopos } from '@/lib/dados/escopos'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import {
  CHAVE_FILTROS_DOS_ESCOPOS,
  contratosDosEscopos,
  escreverFiltrosEscopos,
  filtrarEscopos,
  lerFiltrosEscopos,
  ordenarEscopos,
  responsaveisDosEscopos,
  type FiltrosEscopos,
} from './filtros'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const SEM_FILTRO: FiltrosEscopos = {
  busca: '',
  cliente: null,
  contrato: null,
  responsavel: null,
  status: [],
  criticidade: [],
  prioridade: [],
}

const OPCOES = {
  clientes: ['cli-vertice', 'cli-atlantica'],
  contratos: [{ valor: 'ctr-vertice-mobilizacao', clienteId: 'cli-vertice' }],
  responsaveis: ['usr-rafael'],
}

async function escoposDaHelena() {
  entrarComo('usr-helena')
  return listarEscopos()
}

describe('filtros da lista de escopos (parte 3, 5.7; critério 11)', () => {
  it('guarda os filtros com uma chave própria', () => {
    expect(CHAVE_FILTROS_DOS_ESCOPOS).toBe('elo:filtros-escopos')
  })

  it('lê e escreve o endereço, ida e volta', () => {
    const filtros: FiltrosEscopos = {
      busca: 'gestão',
      cliente: 'cli-vertice',
      contrato: 'ctr-vertice-mobilizacao',
      responsavel: 'usr-rafael',
      status: ['Planejado', 'Em andamento'],
      criticidade: ['Alta', 'Crítica'],
      prioridade: ['Média'],
    }
    const texto = escreverFiltrosEscopos(filtros)
    expect(texto).toContain('status=Planejado,Em+andamento')
    expect(lerFiltrosEscopos(new URLSearchParams(texto), OPCOES)).toEqual(filtros)
  })

  it('sem filtro, o endereço fica vazio', () => {
    expect(escreverFiltrosEscopos(SEM_FILTRO)).toBe('')
  })

  it('ignora o que não está nas opções', () => {
    const params = new URLSearchParams(
      'cliente=cli-montareal&contrato=ctr-x&responsavel=usr-marcos&status=Arquivado&criticidade=Altíssima,Alta&prioridade=Urgente',
    )
    expect(lerFiltrosEscopos(params, OPCOES)).toEqual({ ...SEM_FILTRO, criticidade: ['Alta'] })
  })

  it('ignora o contrato de outro cliente, como a troca de cliente na tela', () => {
    const params = new URLSearchParams('cliente=cli-atlantica&contrato=ctr-vertice-mobilizacao')
    expect(lerFiltrosEscopos(params, OPCOES)).toEqual({ ...SEM_FILTRO, cliente: 'cli-atlantica' })
  })

  it('busca pelo código do contrato e pelo nome, sem acento nem maiúsculas', async () => {
    const escopos = await escoposDaHelena()
    expect(filtrarEscopos(escopos, { ...SEM_FILTRO, busca: 'ct-2026-044' }).map((e) => e.nome)).toEqual([
      'Mobilização de equipe',
    ])
    expect(filtrarEscopos(escopos, { ...SEM_FILTRO, busca: 'regularizacao' }).map((e) => e.nome)).toEqual([
      'Regularização documental',
    ])
  })

  it('busca sem letra nem dígito conta como vazia', async () => {
    const escopos = await escoposDaHelena()
    expect(filtrarEscopos(escopos, { ...SEM_FILTRO, busca: ' . ' })).toHaveLength(10)
  })

  it('combina os filtros', async () => {
    const escopos = await escoposDaHelena()
    const filtros = { ...SEM_FILTRO, cliente: 'cli-vertice', criticidade: ['Alta', 'Crítica'] } satisfies FiltrosEscopos
    expect(filtrarEscopos(escopos, filtros).map((e) => e.nome)).toEqual(['Mobilização de equipe', 'Regularização documental'])
    expect(filtrarEscopos(escopos, { ...SEM_FILTRO, responsavel: 'usr-helena', status: ['Planejado'] }).map((e) => e.nome)).toEqual([
      'Programa de qualidade',
      'Diagnóstico para nova proposta',
    ])
    expect(filtrarEscopos(escopos, { ...SEM_FILTRO, contrato: 'ctr-atlantica-porto', prioridade: ['Baixa'] }).map((e) => e.nome)).toEqual([
      'Gestão do contrato portuário, ciclo 2026',
    ])
  })

  it('ordem inicial: abertos da Crítica para a Baixa, depois pelo nome; fechados no fim', async () => {
    const escopos = await escoposDaHelena()
    expect(ordenarEscopos(escopos).map((e) => e.nome)).toEqual([
      'Mobilização de equipe',
      'Implantação do monitoramento remoto',
      'Regularização documental',
      'Montagem eletromecânica',
      'Programa de qualidade',
      'Diagnóstico para nova proposta',
      'Gestão do contrato portuário, ciclo 2026',
      'Adequação de SSMA',
      'Gestão do contrato portuário, ciclo 2025',
      'Apoio marítimo à Bacia de Campos',
    ])
  })
})

describe('opções dos filtros Contrato e Responsável', () => {
  it('os contratos dos escopos, sem repetir, pelo código e depois pelo cliente', async () => {
    const contratos = contratosDosEscopos(await escoposDaHelena())
    expect(contratos.map((c) => `${c.codigo} ${c.nomeCliente}`)).toEqual([
      'CT-2023-021 Ondamar',
      'CT-2024-008 Atlântica Portos',
      'CT-2025-031 Montareal',
      'CT-2025-031 Vértice Manutenção',
      'CT-2025-077 Rede Norte TI',
      'CT-2026-019 Atlântica Portos',
      'CT-2026-044 Vértice Manutenção',
      'PR-2026-052 Vértice Manutenção',
    ])
    expect(contratos[1]).toEqual({
      valor: 'ctr-atlantica-porto',
      codigo: 'CT-2024-008',
      clienteId: 'cli-atlantica',
      nomeCliente: 'Atlântica Portos',
    })
  })

  it('os responsáveis dos escopos, sem repetir, pelo nome', async () => {
    expect(responsaveisDosEscopos(await escoposDaHelena())).toEqual([
      { valor: 'usr-helena', rotulo: 'Helena Prado' },
      { valor: 'usr-rafael', rotulo: 'Rafael Souza' },
    ])
  })
})
