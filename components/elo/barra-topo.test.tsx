import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BarraTopo, BarraTopoEstatica } from './barra-topo'

// Com `ligada`, ler o endereço falha: prova que a versão estática não chama o usePathname.
const rotaQueFalha = vi.hoisted(() => ({ ligada: false }))
vi.mock('next/navigation', () => ({
  usePathname: () => {
    if (rotaQueFalha.ligada) throw new Error('usePathname chamado na versão estática')
    return '/clientes'
  },
}))

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

const helena = {
  id: 'usr-helena',
  nome: 'Helena Prado',
  email: 'helena.prado@elogovernance.com.br',
  perfil: 'Administrador' as const,
  status: 'Ativo' as const,
}

describe('BarraTopo', () => {
  it('tem o atributo data-sidebar na barra (foco dourado sobre o azul-marinho)', () => {
    render(<BarraTopo usuario={helena} />)
    expect(screen.getByRole('banner')).toHaveAttribute('data-sidebar')
    expect(screen.getByRole('button', { name: 'Abrir menu' }).closest('[data-sidebar]')).not.toBeNull()
  })

  it('o logo não é pré-carregado: no computador a barra fica escondida', () => {
    render(<BarraTopo usuario={helena} />)
    expect(screen.getByAltText('ELO HUB')).not.toHaveAttribute('loading', 'eager')
  })

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

  it('os botões de abrir e fechar ficam no tom da lateral, com pressionado mais forte que passar o mouse', async () => {
    const u = userEvent.setup()
    render(<BarraTopo usuario={helena} />)
    const abrir = screen.getByRole('button', { name: 'Abrir menu' })
    await u.click(abrir)
    for (const botao of [abrir, screen.getByRole('button', { name: 'Fechar menu' })]) {
      const classes = botao.className.split(' ')
      expect(classes).toContain('not-disabled:not-aria-disabled:hover:bg-sidebar-accent')
      expect(classes).toContain('not-disabled:not-aria-disabled:active:bg-sidebar-accent-active')
      expect(classes).not.toContain('not-disabled:not-aria-disabled:active:bg-sidebar-accent')
      // O tom claro de superfície, do botão discreto, não pode aparecer sobre o azul-marinho.
      expect(classes.filter((c) => c.includes('surface'))).toEqual([])
    }
  })

  it('marca a página atual no menu da gaveta', async () => {
    const u = userEvent.setup()
    render(<BarraTopo usuario={helena} />)
    await u.click(screen.getByRole('button', { name: 'Abrir menu' }))
    expect(screen.getByRole('link', { name: 'Clientes' })).toHaveAttribute('aria-current', 'page')
  })
})

describe('BarraTopoEstatica', () => {
  it('é a mesma barra sem ler o endereço e sem marcar a página atual', async () => {
    rotaQueFalha.ligada = true
    try {
      const u = userEvent.setup()
      render(<BarraTopoEstatica usuario={helena} />)
      expect(screen.getByRole('banner')).toHaveAttribute('data-sidebar')
      await u.click(screen.getByRole('button', { name: 'Abrir menu' }))
      expect(screen.getByRole('link', { name: 'Clientes' })).toBeInTheDocument()
      expect(screen.getByText('Helena Prado')).toBeInTheDocument()
      const atuais = screen.getAllByRole('link').filter((l) => l.hasAttribute('aria-current'))
      expect(atuais).toEqual([])
    } finally {
      rotaQueFalha.ligada = false
    }
  })
})
