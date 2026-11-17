import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoEditarPlano } from './conteudo-editar-plano'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => limparCookies())

const editar = (id: string) => ConteudoEditarPlano({ params: Promise.resolve({ id }) })

describe('editar plano (parte 4, 5.6)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Editar plano | Plataforma ELO')
  })

  it('o Rafael vê o formulário preenchido, a data de criação e a volta para o plano', async () => {
    entrarComo('usr-rafael')
    render(await editar('pla-vertice-licencas'))
    expect(screen.getByRole('heading', { level: 1, name: 'Editar plano' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Nome/ })).toHaveValue('Regularização das licenças')
    expect(screen.getByRole('link', { name: 'Voltar para Regularização das licenças' })).toHaveAttribute(
      'href',
      '/planos/pla-vertice-licencas',
    )
    expect(screen.getByText('04/05/2026')).toBeInTheDocument()
    expect(screen.getByDisplayValue('pla-vertice-licencas')).toHaveAttribute('name', 'id')
  })

  it('a avaliação de origem vem escolhida', async () => {
    entrarComo('usr-helena')
    render(await editar('pla-vertice-desenvolvimento'))
    expect(screen.getByRole('combobox', { name: /Avaliação de maturidade/ })).toHaveTextContent('Avaliação de 15/09/2026 · Concluída')
  })

  it('plano fechado: a Helena edita com o status só para leitura; a Equipe vê acesso negado (RN-17)', async () => {
    entrarComo('usr-helena')
    const { unmount } = render(await editar('pla-atlantica-fechamento'))
    expect(screen.getByText('Para reabrir, use Reabrir na página do plano.')).toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: /Status/ })).not.toBeInTheDocument()
    unmount()
    entrarComo('usr-rafael')
    render(await editar('pla-atlantica-fechamento'))
    expect(screen.getByText('Você não tem acesso a esta página.')).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /Nome/ })).not.toBeInTheDocument()
  })

  it('fora do vínculo ou com id que não existe: não encontrado', async () => {
    entrarComo('usr-rafael')
    await expect(editar('pla-montareal-estruturas')).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(editar('pla-nao-existe')).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
