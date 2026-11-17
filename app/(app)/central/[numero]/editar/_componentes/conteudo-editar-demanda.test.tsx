import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { ConteudoDemanda } from '../../_componentes/conteudo-demanda'
import { metadata } from '../page'
import { ConteudoEditarDemanda } from './conteudo-editar-demanda'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => {
  limparCookies()
  sessionStorage.clear()
})

const editar = (numero: string) => ConteudoEditarDemanda({ params: Promise.resolve({ numero }) })

async function opcoesDe(campo: RegExp) {
  await userEvent.click(screen.getByRole('combobox', { name: campo }))
  const opcoes = (await screen.findAllByRole('option')).map((o) => o.textContent)
  await userEvent.keyboard('{Escape}')
  return opcoes
}

describe('editar demanda (parte 5, 5.11)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Editar demanda | Plataforma ELO')
  })

  it('o Rafael vê os dados e a triagem preenchidos, com o cliente só para leitura e a volta para a demanda', async () => {
    entrarComo('usr-rafael')
    render(await editar('ELO-2026-0003'))
    expect(screen.getByRole('heading', { level: 1, name: 'Editar demanda' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Voltar para ELO-2026-0003/ })).toHaveAttribute('href', '/central/ELO-2026-0003')
    expect(screen.getByText('Vértice Manutenção')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Assunto/ })).toHaveValue('Certidões vencidas antes da medição')
    expect(screen.getByRole('combobox', { name: /Categoria/ })).toHaveTextContent('Pedido de documento')
    expect(screen.getByRole('radio', { name: 'Beatriz Fontes' })).toBeChecked()
  })

  it('a criticidade mostra que não há referência de prazo cadastrada, sem preencher o prazo (CA-09.14)', async () => {
    entrarComo('usr-rafael')
    render(await editar('ELO-2026-0003'))
    expect(screen.getByText('Sem referência de prazo cadastrada para esta criticidade.')).toBeInTheDocument()
  })

  it('o atendimento oferece os Administradores e a Equipe vinculada (RN-19)', async () => {
    entrarComo('usr-rafael')
    render(await editar('ELO-2026-0010'))
    expect(await opcoesDe(/Responsável pelo atendimento/)).toEqual(['Sem atendente', 'Helena Prado', 'Rafael Souza'])
  })

  it('a Equipe na Encerrada vê acesso negado; fora do vínculo, não encontrado', async () => {
    entrarComo('usr-rafael')
    render(await editar('ELO-2026-0001'))
    expect(screen.getByText('Você não tem acesso a esta página.')).toBeInTheDocument()
    await expect(editar('ELO-2026-0011')).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('a página da demanda tem Editar para quem pode editar', async () => {
    entrarComo('usr-rafael')
    const { unmount } = render(<TooltipProvider>{await ConteudoDemanda({ params: Promise.resolve({ numero: 'ELO-2026-0003' }) })}</TooltipProvider>)
    expect(screen.getByRole('link', { name: /Editar/ })).toHaveAttribute('href', '/central/ELO-2026-0003/editar')
    unmount()
    render(<TooltipProvider>{await ConteudoDemanda({ params: Promise.resolve({ numero: 'ELO-2026-0001' }) })}</TooltipProvider>)
    expect(screen.queryByRole('link', { name: /Editar/ })).not.toBeInTheDocument()
  })
})
