import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listarEspecialistas } from '@/lib/dados/especialistas'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import {
  CHAVE_FILTROS_DOS_ESPECIALISTAS,
  escreverFiltrosEspecialistas,
  filtrarEspecialistas,
  lerFiltrosEspecialistas,
  type FiltrosEspecialistas,
} from './filtros'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const SEM_FILTRO: FiltrosEspecialistas = { busca: '', status: [], especialidade: null, origem: null }
const OPCOES = { especialidades: ['Financeiro', 'Gestão de riscos'] }

async function todos() {
  entrarComo('usr-rafael')
  return listarEspecialistas()
}

describe('filtros da lista de especialistas (CA-11.3, CA-16.2)', () => {
  it('guarda os filtros com uma chave própria', () => {
    expect(CHAVE_FILTROS_DOS_ESPECIALISTAS).toBe('elo:filtros-especialistas')
  })

  it('lê e escreve o endereço, ida e volta; o que não está nas opções é ignorado', () => {
    const filtros: FiltrosEspecialistas = { busca: 'caio', status: ['Em análise', 'Inativo'], especialidade: 'Financeiro', origem: 'Site' }
    const texto = escreverFiltrosEspecialistas(filtros)
    expect(lerFiltrosEspecialistas(new URLSearchParams(texto), OPCOES)).toEqual(filtros)
    expect(escreverFiltrosEspecialistas(SEM_FILTRO)).toBe('')
    expect(lerFiltrosEspecialistas(new URLSearchParams('status=Arquivado&especialidade=Outra&origem=Feira'), OPCOES)).toEqual(SEM_FILTRO)
  })

  it('sem filtro de status, o Inativo fica de fora; com ele, aparece (CA-18.2)', async () => {
    const lista = await todos()
    expect(filtrarEspecialistas(lista, SEM_FILTRO).map((e) => e.id)).not.toContain('esp-financeiro')
    expect(filtrarEspecialistas(lista, { ...SEM_FILTRO, status: ['Inativo'] }).map((e) => e.id)).toEqual(['esp-financeiro'])
  })

  it('as candidaturas Em análise vêm primeiro, depois os Ativos, cada grupo pelo nome', async () => {
    expect(filtrarEspecialistas(await todos(), SEM_FILTRO).map((e) => e.id)).toEqual([
      'esp-suprimentos-2',
      'esp-riscos',
      'esp-juridico',
      'esp-suprimentos',
      'esp-esg',
      'esp-contratos',
    ])
  })

  it('filtra pela origem e pela especialidade, e busca pelo nome e pelo e-mail sem acento', async () => {
    const lista = await todos()
    expect(filtrarEspecialistas(lista, { ...SEM_FILTRO, origem: 'Site' }).map((e) => e.id)).toEqual([
      'esp-suprimentos-2',
      'esp-riscos',
      'esp-suprimentos',
    ])
    expect(filtrarEspecialistas(lista, { ...SEM_FILTRO, especialidade: 'Gestão de riscos' }).map((e) => e.id)).toEqual(['esp-riscos'])
    expect(filtrarEspecialistas(lista, { ...SEM_FILTRO, busca: 'BEATRIZ' }).map((e) => e.id)).toEqual(['esp-juridico'])
    expect(filtrarEspecialistas(lista, { ...SEM_FILTRO, busca: 'prates@' }).map((e) => e.id)).toEqual(['esp-esg'])
  })
})
