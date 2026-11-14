import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoNovaAvaliacao } from './conteudo-nova-avaliacao'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => limparCookies())

const nova = (busca: Record<string, string>) => ConteudoNovaAvaliacao({ searchParams: Promise.resolve(busca) })

describe('nova avaliação (parte 2, 5.8)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Nova avaliação | Plataforma ELO')
  })

  it('o Rafael abre a nova avaliação da Vértice, com a volta para a aba Maturidade', async () => {
    entrarComo('usr-rafael')
    render(await nova({ cliente: 'cli-vertice' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Nova avaliação' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Voltar para Vértice Manutenção/ })).toHaveAttribute(
      'href',
      '/clientes/cli-vertice?aba=maturidade',
    )
    expect(screen.getByRole('group', { name: 'Integridade e informação' })).toBeInTheDocument()
  })

  it('fora do vínculo, sem cliente ou com cliente que não existe, não encontrado (critério 19)', async () => {
    entrarComo('usr-rafael')
    await expect(nova({ cliente: 'cli-montareal' })).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(nova({})).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(nova({ cliente: 'cli-nao-existe' })).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('o cliente Inativo não é avaliado, e a tela leva de volta a ele', async () => {
    entrarComo('usr-helena')
    render(await nova({ cliente: 'cli-fortec' }))
    expect(screen.getByText('Este cliente está inativo. Reative o cliente para avaliar.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar ao cliente' })).toHaveAttribute('href', '/clientes/cli-fortec')
    expect(screen.queryByRole('button', { name: 'Salvar' })).not.toBeInTheDocument()
  })

  it('o cadastro da ELO não tem avaliação de maturidade (DF-40)', async () => {
    entrarComo('usr-helena')
    render(await nova({ cliente: 'cli-elo' }))
    expect(screen.getByText('O cadastro da ELO não tem avaliação de maturidade.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar ao cliente' })).toHaveAttribute('href', '/clientes/cli-elo')
  })
})
