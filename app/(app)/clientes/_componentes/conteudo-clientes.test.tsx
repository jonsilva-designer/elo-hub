import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoClientes } from './conteudo-clientes'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => limparCookies())

async function renderizar(busca: Record<string, string> = {}) {
  return render(await ConteudoClientes({ searchParams: Promise.resolve(busca) }))
}

/** O nome mostrado em cada linha da tabela (a primeira linha do corpo da célula Cliente). */
const nomesNaTabela = () =>
  within(screen.getAllByRole('rowgroup')[1])
    .getAllByRole('row')
    .map((linha) => linha.querySelector('[data-slot="texto"]')?.textContent)

describe('lista de clientes (F16)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Clientes | Plataforma ELO')
  })

  it('a Helena vê Novo cliente, Exportar e os 7 clientes Prospect e Ativos, com a marca da ELO', async () => {
    entrarComo('usr-helena')
    const { container } = await renderizar()
    expect(screen.getByRole('link', { name: /Novo cliente/ })).toHaveAttribute('href', '/clientes/novo')
    expect(screen.getByRole('button', { name: /Exportar/ })).toBeInTheDocument()
    expect(nomesNaTabela()).toHaveLength(7)
    expect(nomesNaTabela()).not.toContain('Fortec Energia')
    expect(container.querySelector('header')).toHaveTextContent('7 clientes')
    expect(screen.getByText('Cadastro da ELO')).toBeInTheDocument()
  })

  it('com o filtro Inativo no endereço, só a Fortec', async () => {
    entrarComo('usr-helena')
    await renderizar({ status: 'Inativo' })
    expect(nomesNaTabela()).toEqual(['Fortec Energia'])
  })

  it('o Rafael vê só os três vinculados, sem Novo cliente nem Exportar', async () => {
    entrarComo('usr-rafael')
    await renderizar()
    expect(nomesNaTabela()).toEqual(['Atlântica Portos', 'Rede Norte TI', 'Vértice Manutenção'])
    expect(screen.queryByRole('link', { name: /Novo cliente/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Exportar/ })).not.toBeInTheDocument()
  })
})
