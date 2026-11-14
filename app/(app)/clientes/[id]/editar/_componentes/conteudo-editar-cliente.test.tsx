import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoEditarCliente } from './conteudo-editar-cliente'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => limparCookies())

const editar = (id: string) => ConteudoEditarCliente({ params: Promise.resolve({ id }) })

describe('editar cliente', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Editar cliente | Plataforma ELO')
  })

  it('o Administrador vê o formulário preenchido e a volta para o cliente', async () => {
    entrarComo('usr-helena')
    render(await editar('cli-vertice'))
    expect(screen.getByRole('heading', { level: 1, name: 'Editar cliente' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Razão Social/ })).toHaveValue('Vértice Manutenção Industrial Ltda')
    expect(screen.getByRole('link', { name: /Voltar para Vértice Manutenção/ })).toHaveAttribute('href', '/clientes/cli-vertice')
  })

  it('a Equipe vê acesso negado no cliente vinculado (critério 9)', async () => {
    entrarComo('usr-rafael')
    render(await editar('cli-vertice'))
    expect(screen.getByText('Você não tem acesso a esta página.')).toBeInTheDocument()
  })

  it('fora do vínculo ou com id que não existe, não encontrado', async () => {
    entrarComo('usr-rafael')
    await expect(editar('cli-montareal')).rejects.toThrow('NEXT_NOT_FOUND')
    entrarComo('usr-helena')
    await expect(editar('cli-nao-existe')).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
