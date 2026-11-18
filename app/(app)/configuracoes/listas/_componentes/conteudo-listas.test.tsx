import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoListas } from './conteudo-listas'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  usePathname: () => '/configuracoes/listas',
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => {
  limparCookies()
  push.mockReset()
})

async function abrir(busca: Record<string, string> = {}) {
  return render(<TooltipProvider>{await ConteudoListas({ searchParams: Promise.resolve(busca) })}</TooltipProvider>)
}

describe('listas oficiais (parte 8, 4.2)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Listas oficiais | Plataforma ELO')
  })

  it('a Equipe recebe acesso negado (CA-01.2)', async () => {
    entrarComo('usr-rafael')
    await abrir()
    expect(screen.getByText('Você não tem acesso a esta página.')).toBeInTheDocument()
  })

  it('abre em Serviços; trocar a lista vai para o endereço', async () => {
    entrarComo('usr-helena')
    await abrir()
    expect(screen.getByRole('heading', { level: 2, name: 'Serviços' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('combobox', { name: 'Lista' }))
    await userEvent.click(await screen.findByRole('option', { name: 'Contratantes' }))
    expect(push).toHaveBeenCalledWith('/configuracoes/listas?lista=contratantes')
  })

  it('o uso de cada item; o inativo só com o filtro (CA-18.5); o usado sem Excluir (DF-38)', async () => {
    entrarComo('usr-helena')
    await abrir({ lista: 'contratantes' })
    const petrobras = screen.getByText('Petrobras').closest('tr')!
    expect(petrobras).toHaveTextContent(/\d+ registros?/)
    expect(screen.queryByText('Vale')).not.toBeInTheDocument()
    await userEvent.click(within(petrobras).getByRole('button', { name: 'Ações de Petrobras' }))
    expect((await screen.findAllByRole('menuitem')).map((m) => m.textContent)).toEqual(['Renomear', 'Inativar'])
    await userEvent.keyboard('{Escape}')
    await userEvent.click(screen.getByRole('combobox', { name: 'Status' }))
    await userEvent.click(await screen.findByRole('option', { name: 'Inativos' }))
    expect(screen.getByText('Vale').closest('tr')).toHaveTextContent('Inativo')
  })

  it('incluir com nome repetido mostra a recusa na janela (CA-18.6)', async () => {
    entrarComo('usr-helena')
    await abrir({ lista: 'contratantes' })
    await userEvent.click(screen.getByRole('button', { name: 'Incluir item' }))
    const janela = within(await screen.findByRole('alertdialog'))
    await userEvent.type(janela.getByRole('textbox', { name: /Nome/ }), 'petrobrás')
    await userEvent.click(janela.getByRole('button', { name: 'Incluir' }))
    expect(await janela.findByText('Já existe um item com este nome na lista.')).toBeInTheDocument()
  })
})
