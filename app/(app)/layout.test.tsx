import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import LayoutApp from './layout'

vi.mock('next/navigation', () => ({ usePathname: () => '/designsystem' }))

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
