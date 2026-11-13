import { render as renderizar, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import LayoutApp from './layout'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  usePathname: () => '/designsystem',
}))
vi.mock('@/lib/acesso/acoes', () => ({ sair: vi.fn() }))

// O botão Sair tem dica, que precisa do TooltipProvider; no app ele vem do layout raiz.
const render = (ui: ReactElement) => renderizar(ui, { wrapper: TooltipProvider })

beforeEach(() => {
  limparCookies()
  entrarComo('usr-helena')
})

describe('layout das telas com menu', () => {
  it('o primeiro Tab chega ao link "Pular para o conteúdo", que aponta para o conteúdo', async () => {
    const u = userEvent.setup()
    render(
      <LayoutApp>
        <p>Conteúdo da tela</p>
      </LayoutApp>,
    )
    await u.tab()
    const pular = screen.getByRole('link', { name: 'Pular para o conteúdo' })
    expect(pular).toHaveFocus()
    expect(pular).toHaveAttribute('href', '#conteudo')
    // Escondido até receber o foco, e então visível.
    expect(pular.className.split(' ')).toEqual(expect.arrayContaining(['sr-only', 'focus:not-sr-only']))
  })

  it('o conteúdo fica num main com id e focável pelo link', () => {
    render(
      <LayoutApp>
        <p>Conteúdo da tela</p>
      </LayoutApp>,
    )
    const principal = screen.getByRole('main')
    expect(principal).toHaveAttribute('id', 'conteudo')
    expect(principal).toHaveAttribute('tabindex', '-1')
    expect(principal).toHaveTextContent('Conteúdo da tela')
  })
})
