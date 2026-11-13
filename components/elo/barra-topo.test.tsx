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

  it('a gaveta tem 280px de largura', async () => {
    const u = userEvent.setup()
    render(<BarraTopo usuario={helena} />)
    await u.click(screen.getByRole('button', { name: 'Abrir menu' }))
    const gaveta = screen.getByRole('dialog', { name: 'Menu' })
    expect(gaveta.className).toContain('data-[side=left]:w-[280px]')
    expect(gaveta.className).toContain('data-[side=left]:sm:max-w-[280px]')
  })

  it('fecha com o botão "Fechar menu" e devolve o foco', async () => {
    const u = userEvent.setup()
    render(<BarraTopo usuario={helena} />)
    const abrir = screen.getByRole('button', { name: 'Abrir menu' })
    await u.click(abrir)
    expect(screen.getAllByRole('button', { name: /fechar/i })).toHaveLength(1)
    await u.click(screen.getByRole('button', { name: 'Fechar menu' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(abrir).toHaveFocus()
  })

  it('os botões de abrir e fechar ficam no tom da lateral ao passar o mouse e ao pressionar', async () => {
    const u = userEvent.setup()
    render(<BarraTopo usuario={helena} />)
    const abrir = screen.getByRole('button', { name: 'Abrir menu' })
    await u.click(abrir)
    for (const botao of [abrir, screen.getByRole('button', { name: 'Fechar menu' })]) {
      const classes = botao.className.split(' ')
      expect(classes).toContain('not-disabled:not-aria-disabled:hover:bg-sidebar-accent')
      expect(classes).toContain('not-disabled:not-aria-disabled:active:bg-sidebar-accent')
      // O tom claro de superfície, do botão discreto, não pode aparecer sobre o azul-marinho.
      expect(classes.filter((c) => c.includes('surface'))).toEqual([])
    }
  })
})
