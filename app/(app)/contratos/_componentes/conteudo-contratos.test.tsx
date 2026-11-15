import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoContratos } from './conteudo-contratos'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => {
  limparCookies()
  sessionStorage.clear()
  window.history.replaceState(null, '', '/contratos')
})

async function renderizar(busca: Record<string, string> = {}) {
  return render(await ConteudoContratos({ searchParams: Promise.resolve(busca) }))
}

const linhas = () => within(screen.getAllByRole('rowgroup')[1]).getAllByRole('row')

/** A linha da tabela que mostra o código. */
const linhaDo = (codigo: string) => screen.getAllByText(codigo)[0].closest('tr')!

describe('lista de contratos (F03, F04, F16)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Contratos | Plataforma ELO')
  })

  it('a Helena vê Novo contrato, Exportar e os 11 contratos (critério 1)', async () => {
    entrarComo('usr-helena')
    const { container } = await renderizar()
    expect(screen.getByRole('link', { name: /Novo contrato/ })).toHaveAttribute('href', '/contratos/novo')
    expect(screen.getByRole('button', { name: /Exportar/ })).toBeInTheDocument()
    expect(linhas()).toHaveLength(11)
    expect(container.querySelector('header')).toHaveTextContent('11 contratos')
  })

  it('o Rafael vê só os 7 dos clientes vinculados, sem Novo contrato nem Exportar (critério 9)', async () => {
    entrarComo('usr-rafael')
    await renderizar()
    expect(linhas()).toHaveLength(7)
    expect(screen.queryByRole('link', { name: /Novo contrato/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Exportar/ })).not.toBeInTheDocument()
  })

  it('destaca o Vencido e o Próximo do vencimento (CA-04.8)', async () => {
    entrarComo('usr-helena')
    await renderizar()
    expect(linhaDo('CT-2025-077')).toHaveAttribute('data-destaque', 'problema')
    expect(linhaDo('CT-2026-044')).toHaveAttribute('data-destaque', 'atencao')
    expect(linhaDo('CT-2024-008')).not.toHaveAttribute('data-destaque')
  })

  it('a proposta aparece como planejamento (CA-05.9)', async () => {
    entrarComo('usr-helena')
    await renderizar()
    expect(within(linhaDo('PR-2026-052')).getByText('Planejamento')).toBeInTheDocument()
    expect(within(linhaDo('CT-2024-008')).queryByText('Planejamento')).not.toBeInTheDocument()
  })

  it('começa com os filtros do endereço (CA-16.2)', async () => {
    entrarComo('usr-helena')
    await renderizar({ status: 'Suspenso' })
    expect(linhas()).toHaveLength(1)
    expect(linhaDo('CT-2026-019')).toBeInTheDocument()
  })
})
