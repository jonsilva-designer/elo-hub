import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Documento } from '@/lib/dados/tipos'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { excluirAtividade } from '@/lib/atividades/acoes'
import { excluirPlano } from '@/lib/planos/acoes'
import { temItensLigados } from './clientes'
import { contratoTemItensLigados } from './contratos'
import { escopoTemItensLigados } from './escopos'
import { especialistaTemItensLigados } from './especialistas'

// RN-13 e DF-33: o documento sozinho já impede excluir o registro, também o inativo. Os documentos fictícios são
// trocados aqui por um conjunto só com registros que não têm nenhum outro item ligado.

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

const { base } = vi.hoisted(() => ({
  base: {
    categoria: 'Outros',
    especialistaId: null,
    contratoId: null,
    escopoId: null,
    etapa: null,
    planoId: null,
    atividadeId: null,
    demandaNumero: null,
    avaliacaoId: null,
    data: '2026-10-01',
    incluidoEm: '2026-10-01',
    incluidoPorId: 'usr-helena',
    status: 'Vigente',
    substituidoPorId: null,
    observacoes: '',
    arquivo: { nome: 'a.pdf', tipo: 'application/pdf', tamanho: 10 },
  } satisfies Partial<Documento>,
}))

vi.mock('./mock/documentos', () => ({
  DOCUMENTOS: [
    { ...base, id: 'd1', nome: 'Do cliente', clienteId: 'cli-limpar', inativo: true },
    { ...base, id: 'd2', nome: 'Do contrato', clienteId: 'cli-atlantica', contratoId: 'ctr-atlantica-ssma', inativo: false },
    {
      ...base,
      id: 'd3',
      nome: 'Do escopo',
      clienteId: 'cli-vertice',
      contratoId: 'ctr-vertice-manutencao',
      escopoId: 'esc-vertice-qualidade',
      inativo: false,
    },
    {
      ...base,
      id: 'd4',
      nome: 'Do plano',
      clienteId: 'cli-atlantica',
      contratoId: 'ctr-atlantica-porto',
      escopoId: 'esc-atlantica-2026',
      planoId: 'pla-atlantica-indicadores',
      inativo: true,
    },
    {
      ...base,
      id: 'd5',
      nome: 'Da atividade',
      clienteId: 'cli-vertice',
      contratoId: 'ctr-vertice-manutencao',
      escopoId: 'esc-vertice-documental',
      planoId: 'pla-vertice-licencas',
      atividadeId: 'atv-licencas-alvara',
      inativo: false,
    },
    { ...base, id: 'd6', nome: 'Currículo', categoria: 'Documento do Especialista', clienteId: null, especialistaId: 'esp-contratos', inativo: false },
  ],
}))

beforeEach(() => {
  limparCookies()
  entrarComo('usr-helena')
})

describe('documento ligado impede excluir (RN-13, DF-33; parte 6, critério 9)', () => {
  it('o cliente, o contrato, o escopo e o especialista com documento, mesmo inativo', async () => {
    expect(await temItensLigados('cli-limpar')).toBe(true)
    expect(await contratoTemItensLigados('ctr-atlantica-ssma')).toBe(true)
    expect(await escopoTemItensLigados('esc-vertice-qualidade')).toBe(true)
    expect(await especialistaTemItensLigados('esp-contratos')).toBe(true)
  })

  it('o plano sem atividades, mas com documento inativo, não é excluído', async () => {
    expect(await excluirPlano('pla-atlantica-indicadores', 'Criado por engano.')).toEqual({
      ok: false,
      mensagem: 'Este plano tem documentos e não pode ser excluído.',
    })
  })

  it('a atividade com evidência não é excluída', async () => {
    expect(await excluirAtividade('atv-licencas-alvara', 'Registrada em duplicidade.')).toEqual({
      ok: false,
      mensagem: 'Esta atividade tem documentos e não pode ser excluída.',
    })
  })
})
