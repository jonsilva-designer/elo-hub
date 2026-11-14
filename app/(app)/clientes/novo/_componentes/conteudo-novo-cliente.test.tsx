import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoNovoCliente } from './conteudo-novo-cliente'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => limparCookies())

describe('novo cliente', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Novo cliente | Plataforma ELO')
  })

  it('o Administrador vê o formulário vazio', async () => {
    entrarComo('usr-helena')
    render(await ConteudoNovoCliente())
    expect(screen.getByRole('heading', { level: 1, name: 'Novo cliente' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Razão Social/ })).toHaveValue('')
  })

  it('a Equipe vê acesso negado (padrão 7)', async () => {
    entrarComo('usr-rafael')
    render(await ConteudoNovoCliente())
    expect(screen.getByText('Você não tem acesso a esta página.')).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /Razão Social/ })).not.toBeInTheDocument()
  })
})
