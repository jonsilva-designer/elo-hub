import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoNovaDemanda } from './conteudo-nova-demanda'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => {
  limparCookies()
  sessionStorage.clear()
})

async function escolher(campo: RegExp, opcao: string) {
  await userEvent.click(screen.getByRole('combobox', { name: campo }))
  await userEvent.click(await screen.findByRole('option', { name: opcao }))
}

async function opcoesDe(campo: RegExp) {
  await userEvent.click(screen.getByRole('combobox', { name: campo }))
  const opcoes = (await screen.findAllByRole('option')).map((o) => o.textContent)
  await userEvent.keyboard('{Escape}')
  return opcoes
}

describe('nova demanda (parte 5, 5.9)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Nova demanda | Plataforma ELO')
  })

  it('o Rafael escolhe entre os clientes Ativos de qualquer vínculo, pelo nome (DF-39)', async () => {
    entrarComo('usr-rafael')
    render(await ConteudoNovaDemanda())
    expect(screen.getByRole('heading', { level: 1, name: 'Nova demanda' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar para Central ELO' })).toHaveAttribute('href', '/central')
    const clientes = await opcoesDe(/Cliente/)
    expect(clientes).toContain('Montareal')
    expect(clientes).not.toContain('Fortec Energia')
  })

  it('cliente vinculado mostra contrato e escopo; fora dos vínculos, não, e a triagem é de quem tem vínculo', async () => {
    entrarComo('usr-rafael')
    render(await ConteudoNovaDemanda())
    await escolher(/Cliente/, 'Vértice Manutenção')
    expect(screen.getByRole('combobox', { name: /Contrato/ })).toBeInTheDocument()
    await escolher(/Cliente/, 'Montareal')
    expect(screen.queryByRole('combobox', { name: /Contrato/ })).not.toBeInTheDocument()
    expect(screen.getByText('Você não vê este cliente: a triagem fica com quem tem vínculo com ele.')).toBeInTheDocument()
    expect(await opcoesDe(/Responsável pela triagem/)).toEqual(['Helena Prado'])
  })

  it('o cadastro da ELO só oferece a origem Institucional; os outros, todas menos ela (CA-09.15)', async () => {
    entrarComo('usr-helena')
    render(await ConteudoNovaDemanda())
    await escolher(/Cliente/, 'ELO HUB')
    expect(await opcoesDe(/Origem/)).toEqual(['Institucional'])
    await escolher(/Cliente/, 'Atlântica Portos')
    expect(await opcoesDe(/Origem/)).not.toContain('Institucional')
  })
})
