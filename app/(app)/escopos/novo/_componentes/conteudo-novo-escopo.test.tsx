import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoNovoEscopo } from './conteudo-novo-escopo'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => limparCookies())

const novo = (busca: Record<string, string> = {}) => ConteudoNovoEscopo({ searchParams: Promise.resolve(busca) })

describe('novo escopo (parte 3, 5.8)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Novo escopo | Plataforma ELO')
  })

  it('a Helena vê o formulário com o contrato do endereço e a volta para ele', async () => {
    entrarComo('usr-helena')
    render(await novo({ contrato: 'ctr-vertice-manutencao' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Novo escopo' })).toBeInTheDocument()
    const volta = screen.getByRole('link', { name: 'Voltar para CT-2025-031' })
    expect(volta).toHaveAttribute('href', '/contratos/ctr-vertice-manutencao')
    expect(volta.querySelector('.font-mono')).toHaveTextContent('CT-2025-031')
    expect(screen.getByRole('textbox', { name: /Nome/ })).toHaveValue('')
    expect(screen.getByDisplayValue('ctr-vertice-manutencao')).toHaveAttribute('name', 'contratoId')
  })

  it('contrato fechado: avisa e leva de volta a ele, sem formulário (RN-23)', async () => {
    entrarComo('usr-helena')
    render(await novo({ contrato: 'ctr-ondamar-apoio' }))
    expect(screen.getByText('Este contrato está fechado e não recebe escopos novos.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar ao contrato' })).toHaveAttribute('href', '/contratos/ctr-ondamar-apoio')
    expect(screen.queryByRole('textbox', { name: /Nome/ })).not.toBeInTheDocument()
  })

  it('a Equipe vinculada vê acesso negado (critério 10)', async () => {
    entrarComo('usr-rafael')
    render(await novo({ contrato: 'ctr-vertice-manutencao' }))
    expect(screen.getByText('Você não tem acesso a esta página.')).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /Nome/ })).not.toBeInTheDocument()
  })

  it('sem contrato, contrato que não existe ou fora do vínculo: não encontrado', async () => {
    entrarComo('usr-rafael')
    await expect(novo({ contrato: 'ctr-montareal-montagem' })).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(novo()).rejects.toThrow('NEXT_NOT_FOUND')
    entrarComo('usr-helena')
    await expect(novo({ contrato: 'ctr-nao-existe' })).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
