import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoNovaAtividade } from './conteudo-nova-atividade'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => limparCookies())

const nova = (busca: Record<string, string> = {}) => ConteudoNovaAtividade({ searchParams: Promise.resolve(busca) })

describe('nova atividade (parte 4, 5.7)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Nova atividade | Plataforma ELO')
  })

  it('o Rafael vê o formulário com o plano do endereço e a volta para ele', async () => {
    entrarComo('usr-rafael')
    render(await nova({ plano: 'pla-vertice-licencas' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Nova atividade' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar para Regularização das licenças' })).toHaveAttribute(
      'href',
      '/planos/pla-vertice-licencas',
    )
    expect(screen.getByDisplayValue('pla-vertice-licencas')).toHaveAttribute('name', 'planoId')
    expect(screen.getByRole('textbox', { name: /Executor/ })).toHaveValue('')
    expect(screen.getByText('Quem executa, quando não é o responsável: pessoa do cliente ou especialista')).toBeInTheDocument()
  })

  it('no cadastro, o status oferece Não iniciada e Em andamento', async () => {
    entrarComo('usr-rafael')
    render(await nova({ plano: 'pla-vertice-licencas' }))
    await userEvent.click(screen.getByRole('combobox', { name: /Status/ }))
    expect((await screen.findAllByRole('option')).map((o) => o.textContent)).toEqual(['Não iniciada', 'Em andamento'])
  })

  it('a evidência entra pelos documentos, depois de salvar: a nova atividade não tem o campo (parte 6)', async () => {
    entrarComo('usr-rafael')
    render(await nova({ plano: 'pla-vertice-licencas' }))
    expect(screen.queryByRole('combobox', { name: /Evidência/ })).not.toBeInTheDocument()
  })

  it('plano fechado: avisa e leva de volta a ele, sem formulário (RN-23)', async () => {
    entrarComo('usr-helena')
    render(await nova({ plano: 'pla-atlantica-fechamento' }))
    expect(screen.getByText('Este plano está fechado e não recebe atividades novas.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar ao plano' })).toHaveAttribute('href', '/planos/pla-atlantica-fechamento')
    expect(screen.queryByRole('textbox', { name: /Nome/ })).not.toBeInTheDocument()
  })

  it('sem plano, plano que não existe ou fora do vínculo: não encontrado', async () => {
    entrarComo('usr-rafael')
    await expect(nova({ plano: 'pla-montareal-estruturas' })).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(nova()).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
