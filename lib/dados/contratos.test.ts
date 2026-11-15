import { connection } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { diasEntre } from '@/lib/contratos/vigencia'
import { hojeEmBrasilia } from '@/lib/formato'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { listarContratos, listarContratosDoCliente, obterContrato } from './contratos'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const ids = (lista: { id: string }[]) => lista.map((c) => c.id)

describe('listarContratos (RN-01, CA-01.1, critério 1)', () => {
  it('o Administrador vê os 11 contratos', async () => {
    entrarComo('usr-helena')
    expect(await listarContratos()).toHaveLength(11)
  })

  it('a Equipe vê só os 7 de Vértice, Atlântica e Rede Norte', async () => {
    entrarComo('usr-rafael')
    const contratos = await listarContratos()
    expect(contratos).toHaveLength(7)
    expect(new Set(contratos.map((c) => c.clienteId))).toEqual(new Set(['cli-vertice', 'cli-atlantica', 'cli-rede-norte']))
  })

  it('mudar o que voltou não muda a próxima leitura', async () => {
    entrarComo('usr-helena')
    const [primeiro] = await listarContratos()
    primeiro.servicos.push('Inventado')
    primeiro.codigo = 'X'
    const [denovo] = await listarContratos()
    expect(denovo.codigo).not.toBe('X')
    expect(denovo.servicos).not.toContain('Inventado')
  })
})

describe('obterContrato', () => {
  it('traz o nome do cliente, do responsável e a vigência Vencido do contrato da Rede Norte (DF-25)', async () => {
    entrarComo('usr-rafael')
    const c = await obterContrato('ctr-rede-norte-rmm')
    expect(c).toMatchObject({ status: 'Ativo', nomeResponsavel: 'Rafael Souza', nomeCliente: 'Rede Norte TI' })
    expect(c?.vigencia?.status).toBe('Vencido')
  })

  it('fora do vínculo ou que não existe: null', async () => {
    entrarComo('usr-rafael')
    expect(await obterContrato('ctr-montareal-montagem')).toBeNull()
    expect(await obterContrato('ctr-nao-existe')).toBeNull()
  })

  it('o término da mobilização é calculado a partir de hoje: 20 dias, Próximo do vencimento', async () => {
    entrarComo('usr-helena')
    const c = await obterContrato('ctr-vertice-mobilizacao')
    const hoje = hojeEmBrasilia(new Date())
    expect(diasEntre(hoje, c!.termino!)).toBe(20)
    expect(c?.vigencia).toEqual({ status: 'Próximo do vencimento', diasRestantes: 20 })
    expect(c).not.toHaveProperty('terminoEmDias')
  })

  it('Prazo indeterminado: Vigente sem dias; Proposta: sem vigência', async () => {
    entrarComo('usr-helena')
    expect((await obterContrato('ctr-atlantica-porto'))?.vigencia).toEqual({ status: 'Vigente', diasRestantes: null })
    expect((await obterContrato('ctr-vertice-proposta'))?.vigencia).toBeNull()
  })
})

describe('listarContratosDoCliente', () => {
  it('traz os do cliente, e lista vazia fora do vínculo', async () => {
    entrarComo('usr-helena')
    expect(ids(await listarContratosDoCliente('cli-vertice'))).toEqual([
      'ctr-vertice-manutencao',
      'ctr-vertice-mobilizacao',
      'ctr-vertice-proposta',
    ])
    entrarComo('usr-rafael')
    expect(await listarContratosDoCliente('cli-montareal')).toEqual([])
  })
})

describe('data de hoje na requisição (cacheComponents)', () => {
  it('listarContratos espera o connection() antes de ler a data', async () => {
    entrarComo('usr-helena')
    vi.mocked(connection).mockClear()
    await listarContratos()
    expect(connection).toHaveBeenCalled()
  })
})
