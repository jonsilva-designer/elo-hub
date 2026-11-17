import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoEditarEscopo } from './conteudo-editar-escopo'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => limparCookies())

const editar = (id: string) => ConteudoEditarEscopo({ params: Promise.resolve({ id }) })

describe('editar escopo (parte 3, 5.8)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Editar escopo | Plataforma ELO')
  })

  it('a Helena vê o formulário preenchido e a volta para o escopo', async () => {
    entrarComo('usr-helena')
    render(await editar('esc-vertice-documental'))
    expect(screen.getByRole('heading', { level: 1, name: 'Editar escopo' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Nome/ })).toHaveValue('Regularização documental')
    expect(screen.getByRole('link', { name: 'Voltar para Regularização documental' })).toHaveAttribute(
      'href',
      '/escopos/esc-vertice-documental',
    )
    expect(screen.getByText('Para mudar, use Reclassificar na página do escopo')).toBeInTheDocument()
  })

  it('o ciclo anterior vem escolhido', async () => {
    entrarComo('usr-helena')
    render(await editar('esc-atlantica-2026'))
    expect(screen.getByRole('combobox', { name: /Ciclo anterior/ })).toHaveTextContent('Gestão do contrato portuário, ciclo 2025')
  })

  it('o ciclo seguinte não aparece entre os ciclos anteriores (CA-05.10)', async () => {
    entrarComo('usr-helena')
    render(await editar('esc-atlantica-2025'))
    await userEvent.click(screen.getByRole('combobox', { name: /Ciclo anterior/ }))
    const opcoes = (await screen.findAllByRole('option')).map((o) => o.textContent)
    expect(opcoes).toContain('Sem ciclo anterior')
    expect(opcoes).not.toContain('Gestão do contrato portuário, ciclo 2026')
  })

  it('o Rafael, vinculado, vê acesso negado; fora do vínculo ou com id que não existe, não encontrado (critério 10)', async () => {
    entrarComo('usr-rafael')
    render(await editar('esc-vertice-documental'))
    expect(screen.getByText('Você não tem acesso a esta página.')).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /Nome/ })).not.toBeInTheDocument()
    await expect(editar('esc-montareal-montagem')).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(editar('esc-nao-existe')).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
