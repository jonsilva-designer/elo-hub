import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BarraTopo } from './barra-topo'

vi.mock('next/navigation', () => ({ usePathname: () => '/clientes' }))

// Sem o roteador do Next, o Link do jsdom não dispara onNavigate: este Link falso faz isso no clique.
vi.mock('next/link', () => ({
  default: ({ href, onNavigate, children, ...resto }: React.ComponentProps<'a'> & { onNavigate?: () => void }) => (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault()
        onNavigate?.()
      }}
      {...resto}
    >
      {children}
    </a>
  ),
}))

const helena = { nome: 'Helena Prado', perfil: 'Administrador' as const }

describe('BarraTopo', () => {
  it('abre a gaveta com o mesmo menu', async () => {
    const u = userEvent.setup()
    render(<BarraTopo usuario={helena} />)
    await u.click(screen.getByRole('button', { name: 'Abrir menu' }))
    expect(screen.getByRole('dialog', { name: 'Menu' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Menu principal' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Contratos' })).toBeInTheDocument()
    expect(screen.getByText('Helena Prado')).toBeInTheDocument()
  })

  it('fecha ao clicar em um link', async () => {
    const u = userEvent.setup()
    render(<BarraTopo usuario={helena} />)
    await u.click(screen.getByRole('button', { name: 'Abrir menu' }))
    await u.click(screen.getByRole('link', { name: 'Contratos' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('fecha com Esc e devolve o foco ao botão', async () => {
    const u = userEvent.setup()
    render(<BarraTopo usuario={helena} />)
    const botao = screen.getByRole('button', { name: 'Abrir menu' })
    await u.click(botao)
    await u.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(botao).toHaveFocus()
  })
})
