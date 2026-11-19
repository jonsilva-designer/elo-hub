import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoUsuarios } from './conteudo-usuarios'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  usePathname: () => '/configuracoes/usuarios',
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => {
  limparCookies()
  push.mockReset()
})

const linhas = () => within(screen.getAllByRole('rowgroup')[1]).getAllByRole('row')

describe('usuários (parte 8, 4.1; F01)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Usuários | Plataforma ELO')
  })

  it('a Equipe recebe acesso negado (CA-01.2)', async () => {
    entrarComo('usr-rafael')
    render(await ConteudoUsuarios())
    expect(screen.getByText('Você não tem acesso a esta página.')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('o Administrador vê as abas, os ativos, Novo usuário e a linha que abre o usuário', async () => {
    entrarComo('usr-helena')
    render(await ConteudoUsuarios())
    const abas = within(screen.getByRole('navigation', { name: 'Configurações' }))
    expect(abas.getAllByRole('link').map((l) => l.textContent)).toEqual(['Usuários', 'Listas oficiais', 'Parâmetros'])
    expect(abas.getByRole('link', { name: 'Usuários' })).toHaveAttribute('aria-current', 'page')
    // As mesmas abas sublinhadas da página do cliente: a ativa ganha o sublinhado (data-active).
    expect(abas.getByRole('link', { name: 'Usuários' })).toHaveAttribute('data-active')
    expect(abas.getByRole('link', { name: 'Listas oficiais' })).not.toHaveAttribute('data-active')
    expect(abas.getByRole('link', { name: 'Usuários' }).className).toContain('border-b-2')
    expect(screen.getByRole('link', { name: 'Novo usuário' })).toHaveAttribute('href', '/configuracoes/usuarios/novo')
    expect(linhas()).toHaveLength(2)
    const rafael = screen.getByText('Rafael Souza').closest('tr')!
    expect(rafael).toHaveTextContent('Equipe')
    expect(rafael).toHaveTextContent('3 clientes')
    expect(screen.getByText('Helena Prado').closest('tr')).toHaveTextContent('Todos os clientes')
    await userEvent.click(within(rafael).getByText('Rafael Souza'))
    expect(push).toHaveBeenCalledWith('/configuracoes/usuarios/usr-rafael')
  })
})
