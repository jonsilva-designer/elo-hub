import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoNovoPlano } from './conteudo-novo-plano'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => limparCookies())

const novo = (busca: Record<string, string> = {}) => ConteudoNovoPlano({ searchParams: Promise.resolve(busca) })

describe('novo plano (parte 4, 5.6)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Novo plano | Plataforma ELO')
  })

  it('o Rafael vê o formulário com o escopo do endereço e a volta para ele', async () => {
    entrarComo('usr-rafael')
    render(await novo({ escopo: 'esc-atlantica-2026' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Novo plano' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar para Gestão do contrato portuário, ciclo 2026' })).toHaveAttribute(
      'href',
      '/escopos/esc-atlantica-2026',
    )
    expect(screen.getByRole('textbox', { name: /Nome/ })).toHaveValue('')
    expect(screen.getByDisplayValue('esc-atlantica-2026')).toHaveAttribute('name', 'escopoId')
    expect(screen.getByText('Atlântica Portos')).toBeInTheDocument()
  })

  it('a avaliação de origem oferece as do cliente, com a data e o status, e "Sem avaliação" (DF-80)', async () => {
    entrarComo('usr-helena')
    render(await novo({ escopo: 'esc-vertice-diagnostico' }))
    await userEvent.click(screen.getByRole('combobox', { name: /Avaliação de maturidade/ }))
    const opcoes = (await screen.findAllByRole('option')).map((o) => o.textContent)
    expect(opcoes[0]).toBe('Sem avaliação')
    expect(opcoes).toContain('Avaliação de 15/09/2026 · Concluída')
    expect(opcoes.some((o) => o?.includes('Em elaboração'))).toBe(true)
  })

  it('o status oferece só Aberto e Em andamento', async () => {
    entrarComo('usr-helena')
    render(await novo({ escopo: 'esc-atlantica-2026' }))
    await userEvent.click(screen.getByRole('combobox', { name: /Status/ }))
    expect((await screen.findAllByRole('option')).map((o) => o.textContent)).toEqual(['Aberto', 'Em andamento'])
  })

  it('escopo fechado: avisa e leva de volta a ele, sem formulário (RN-23)', async () => {
    entrarComo('usr-helena')
    render(await novo({ escopo: 'esc-atlantica-2025' }))
    expect(screen.getByText('Este escopo está fechado e não recebe planos novos.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar ao escopo' })).toHaveAttribute('href', '/escopos/esc-atlantica-2025')
    expect(screen.queryByRole('textbox', { name: /Nome/ })).not.toBeInTheDocument()
  })

  it('sem escopo, escopo que não existe ou fora do vínculo: não encontrado', async () => {
    entrarComo('usr-rafael')
    await expect(novo({ escopo: 'esc-montareal-montagem' })).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(novo()).rejects.toThrow('NEXT_NOT_FOUND')
    entrarComo('usr-helena')
    await expect(novo({ escopo: 'esc-nao-existe' })).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
