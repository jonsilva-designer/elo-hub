import { beforeEach, describe, expect, it, vi } from 'vitest'
import { destinoDe, entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { listarClientes, obterCliente } from './clientes'
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
