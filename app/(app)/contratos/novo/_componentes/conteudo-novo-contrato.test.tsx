import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoNovoContrato } from './conteudo-novo-contrato'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => limparCookies())

const novo = (busca: Record<string, string> = {}) => ConteudoNovoContrato({ searchParams: Promise.resolve(busca) })

describe('novo contrato (seção 5.5)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Novo contrato | Plataforma ELO')
  })

  it('a Helena vê o formulário, com o cliente do endereço e a volta para ele', async () => {
    entrarComo('usr-helena')
    render(await novo({ cliente: 'cli-vertice' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Novo contrato' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /Cliente/ })).toHaveTextContent('Vértice Manutenção')
    expect(screen.getByRole('link', { name: 'Voltar para Vértice Manutenção' })).toHaveAttribute(
      'href',
      '/clientes/cli-vertice?aba=contratos',
    )
  })

  it('cliente Inativo, o cadastro da ELO ou um cliente que não existe no endereço: o campo começa vazio', async () => {
    entrarComo('usr-helena')
    for (const cliente of ['cli-fortec', 'cli-elo', 'cli-nao-existe']) {
      const { unmount } = render(await novo({ cliente }))
      expect(screen.getByRole('combobox', { name: /Cliente/ }), cliente).toHaveTextContent('Selecione')
      expect(screen.getByRole('link', { name: 'Voltar para Contratos' })).toHaveAttribute('href', '/contratos')
      unmount()
    }
  })

  it('a Equipe vê acesso negado (critério 10)', async () => {
    entrarComo('usr-rafael')
    render(await novo({ cliente: 'cli-vertice' }))
    expect(screen.getByText('Você não tem acesso a esta página.')).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /Código/ })).not.toBeInTheDocument()
  })
})
