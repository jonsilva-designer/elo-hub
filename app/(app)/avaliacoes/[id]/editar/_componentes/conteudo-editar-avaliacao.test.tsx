import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoEditarAvaliacao } from './conteudo-editar-avaliacao'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => limparCookies())

const editar = (id: string) => ConteudoEditarAvaliacao({ params: Promise.resolve({ id }) })

describe('editar avaliação (parte 2, 5.8)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Editar avaliação | Plataforma ELO')
  })

  it('o Rafael edita a avaliação Em elaboração da Vértice (critério 17)', async () => {
    entrarComo('usr-rafael')
    const { container } = render(await editar('ava-vertice-3'))
    expect(screen.getByRole('heading', { level: 1, name: 'Editar avaliação' })).toBeInTheDocument()
    expect(container.querySelector('input[type="hidden"][name="nivel-0"]')).toHaveValue('Consistente')
  })

  it('a avaliação Concluída não abre a edição e leva à página dela (critério 18)', async () => {
    entrarComo('usr-helena')
    render(await editar('ava-vertice-2'))
    expect(
      screen.getByText('Esta avaliação está concluída e não muda. O Administrador pode reabri-la.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver a avaliação' })).toHaveAttribute('href', '/avaliacoes/ava-vertice-2')
    expect(screen.queryByRole('button', { name: 'Salvar' })).not.toBeInTheDocument()
  })

  it('fora do vínculo ou com id que não existe, não encontrado', async () => {
    entrarComo('usr-rafael')
    await expect(editar('ava-montareal-1')).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(editar('ava-nao-existe')).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
