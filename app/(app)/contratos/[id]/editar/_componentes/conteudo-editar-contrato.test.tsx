import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoEditarContrato } from './conteudo-editar-contrato'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => limparCookies())

const editar = (id: string) => ConteudoEditarContrato({ params: Promise.resolve({ id }) })

describe('editar contrato (seção 5.5)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Editar contrato | Plataforma ELO')
  })

  it('a Helena vê o formulário preenchido e a volta para o contrato', async () => {
    entrarComo('usr-helena')
    render(await editar('ctr-vertice-manutencao'))
    expect(screen.getByRole('heading', { level: 1, name: 'Editar contrato' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Código/ })).toHaveValue('CT-2025-031')
    expect(screen.getByRole('link', { name: 'Voltar para CT-2025-031' })).toHaveAttribute(
      'href',
      '/contratos/ctr-vertice-manutencao',
    )
    expect(screen.getByRole('link', { name: 'Voltar para CT-2025-031' }).querySelector('.font-mono')).toHaveTextContent('CT-2025-031')
  })

  it('o Rafael, vinculado, vê acesso negado; fora do vínculo ou com id que não existe, não encontrado (critério 10)', async () => {
    entrarComo('usr-rafael')
    render(await editar('ctr-vertice-manutencao'))
    expect(screen.getByText('Você não tem acesso a esta página.')).toBeInTheDocument()
    await expect(editar('ctr-montareal-montagem')).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(editar('ctr-nao-existe')).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
