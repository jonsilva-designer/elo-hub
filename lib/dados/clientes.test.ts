import { beforeEach, describe, expect, it, vi } from 'vitest'
import { destinoDe, entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { itensQueImpedemInativar, listarClientes, obterCliente, obterClientePorCnpj, temItensLigados } from './clientes'
import { CLIENTES } from './mock/clientes'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const ids = (lista: { id: string }[]) => lista.map((c) => c.id)

describe('listarClientes (RN-01, DF-23, CA-01.1)', () => {
  it('o Administrador vê os 8 clientes, na ordem do cadastro', async () => {
    entrarComo('usr-helena')
    expect(ids(await listarClientes())).toEqual(ids(CLIENTES))
    expect(CLIENTES).toHaveLength(8)
  })

  it('a Equipe vê só os clientes vinculados', async () => {
    entrarComo('usr-rafael')
    expect(ids(await listarClientes())).toEqual(['cli-vertice', 'cli-atlantica', 'cli-rede-norte'])
  })

  it('sem sessão, vai ao login', async () => {
    expect(await destinoDe(listarClientes())).toBe('/login')
  })
})

describe('obterCliente (CA-01.1, link direto)', () => {
  it('a Equipe recebe null para um cliente fora do vínculo, igual a um que não existe', async () => {
    entrarComo('usr-rafael')
    expect(await obterCliente('cli-montareal')).toBeNull()
    expect(await obterCliente('cli-nao-existe')).toBeNull()
  })

  it('a Equipe recebe o cliente vinculado', async () => {
    entrarComo('usr-rafael')
    expect(await obterCliente('cli-vertice')).toMatchObject({ id: 'cli-vertice', nomeFantasia: 'Vértice Manutenção' })
  })

  it('o Administrador recebe qualquer cliente', async () => {
    entrarComo('usr-helena')
    expect(await obterCliente('cli-montareal')).toMatchObject({ id: 'cli-montareal' })
  })
})

describe('obterClientePorCnpj (CA-02.1)', () => {
  it('acha o cliente com ou sem pontuação', async () => {
    entrarComo('usr-helena')
    expect((await obterClientePorCnpj('21473509000121'))?.id).toBe('cli-vertice')
    expect((await obterClientePorCnpj('21.473.509/0001-21'))?.id).toBe('cli-vertice')
  })

  it('CNPJ que não existe dá null', async () => {
    entrarComo('usr-helena')
    expect(await obterClientePorCnpj('11.222.333/0001-81')).toBeNull()
    expect(await obterClientePorCnpj('')).toBeNull()
  })
})

describe('itensQueImpedemInativar (RN-18, CA-18.3)', () => {
  it('a Vértice tem a avaliação Em elaboração do Rafael', async () => {
    entrarComo('usr-helena')
    expect((await itensQueImpedemInativar('cli-vertice'))[0]).toEqual(
      {
        tipo: 'Avaliação de maturidade',
        descricao: 'Avaliação de 05/11/2026',
        status: 'Em elaboração',
        responsavel: 'Rafael Souza',
        href: '/avaliacoes/ava-vertice-3',
      },
    )
  })

  it('a Vértice também tem os três contratos abertos, depois da avaliação (critério 22 da parte 3)', async () => {
    entrarComo('usr-helena')
    const itens = await itensQueImpedemInativar('cli-vertice')
    expect(itens.map((i) => i.href)).toEqual([
      '/avaliacoes/ava-vertice-3',
      '/contratos/ctr-vertice-manutencao',
      '/contratos/ctr-vertice-mobilizacao',
      '/contratos/ctr-vertice-proposta',
      '/central/ELO-2026-0003',
      '/central/ELO-2026-0006',
      '/central/ELO-2026-0009',
      '/central/ELO-2026-0010',
    ])
    expect(itens[1]).toEqual({
      tipo: 'Contrato',
      descricao: 'CT-2025-031 · Petrobras',
      status: 'Ativo',
      responsavel: 'Helena Prado',
      href: '/contratos/ctr-vertice-manutencao',
    })
  })

  it('a Ondamar, com o contrato Encerrado, não tem item aberto', async () => {
    entrarComo('usr-helena')
    expect(await itensQueImpedemInativar('cli-ondamar')).toEqual([])
  })
})

describe('temItensLigados (DF-33)', () => {
  it('verdadeiro para quem tem avaliação, contrato ou demanda, falso para os outros', async () => {
    entrarComo('usr-helena')
    // O cadastro da ELO tem a demanda institucional desde a parte 5 (DF-40).
    for (const id of ['cli-vertice', 'cli-atlantica', 'cli-fortec', 'cli-elo']) expect(await temItensLigados(id), id).toBe(true)
    expect(await temItensLigados('cli-limpar')).toBe(false)
  })
})
