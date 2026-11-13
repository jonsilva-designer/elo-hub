import { render as renderizar, screen, within } from '@testing-library/react'
import type { ReactElement } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Usuario } from '@/lib/dados/tipos'
import { Lateral, LateralEstatica } from './lateral'

vi.mock('@/lib/acesso/acoes', () => ({ sair: vi.fn() }))

// O botão Sair tem dica, que precisa do TooltipProvider; no app ele vem do layout raiz.
const render = (ui: ReactElement) => renderizar(ui, { wrapper: TooltipProvider })

// `pathname: null` faz o usePathname falhar: prova que a versão estática não lê o endereço.
const rota = vi.hoisted(() => ({ pathname: '/clientes/12' as string | null }))
vi.mock('next/navigation', () => ({
  usePathname: () => {
    if (rota.pathname === null) throw new Error('usePathname chamado na versão estática')
    return rota.pathname
  },
}))

const helena: Usuario = {
  id: 'usr-helena',
  nome: 'Helena Prado',
  email: 'helena.prado@elogovernance.com.br',
  perfil: 'Administrador',
  status: 'Ativo',
}
const rafael: Usuario = {
  id: 'usr-rafael',
  nome: 'Rafael Souza',
  email: 'rafael.souza@elogovernance.com.br',
  perfil: 'Equipe',
  status: 'Ativo',
}

describe('Lateral', () => {
  beforeEach(() => {
    rota.pathname = '/clientes/12'
  })

  it('tem o atributo data-sidebar na raiz (foco dourado)', () => {
    const { container } = render(<Lateral usuario={helena} />)
    expect(container.firstElementChild).toHaveAttribute('data-sidebar')
  })

  it('tem a navegação "Menu principal"', () => {
    render(<Lateral usuario={helena} />)
    expect(screen.getByRole('navigation', { name: 'Menu principal' })).toBeInTheDocument()
  })

  it('marca só Clientes como página atual', () => {
    render(<Lateral usuario={helena} />)
    const atuais = screen.getAllByRole('link').filter((l) => l.getAttribute('aria-current') === 'page')
    expect(atuais).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Clientes' })).toHaveAttribute('aria-current', 'page')
  })

  it('mostra os grupos Carteira e Apoio', () => {
    render(<Lateral usuario={helena} />)
    const nav = screen.getByRole('navigation', { name: 'Menu principal' })
    expect(within(nav).getByText('Carteira')).toBeInTheDocument()
    expect(within(nav).getByText('Apoio')).toBeInTheDocument()
  })

  it('mostra o link Padrão visual e o usuário', () => {
    render(<Lateral usuario={helena} />)
    expect(screen.getByRole('link', { name: 'Padrão visual' })).toHaveAttribute('href', '/designsystem')
    expect(screen.getByText('Helena Prado')).toBeInTheDocument()
    expect(screen.getByText('Administrador')).toBeInTheDocument()
  })

  it('marca Padrão visual com aria-current em /designsystem', () => {
    rota.pathname = '/designsystem'
    render(<Lateral usuario={helena} />)
    expect(screen.getByRole('link', { name: 'Padrão visual' })).toHaveAttribute('aria-current', 'page')
  })

  it('Equipe não vê Configurações', () => {
    render(<Lateral usuario={rafael} />)
    expect(screen.queryByRole('link', { name: 'Configurações' })).not.toBeInTheDocument()
  })

  it.each([
    ['Administrador', helena],
    ['Equipe', rafael],
  ])('com o perfil %s, mostra o nome, o perfil e o botão Sair (CA-01.2)', (perfil, usuario) => {
    render(<Lateral usuario={usuario} />)
    expect(screen.getByText(usuario.nome)).toBeInTheDocument()
    expect(screen.getByText(perfil)).toBeInTheDocument()
    const sair = screen.getByRole('button', { name: 'Sair' })
    expect(sair).toHaveAttribute('type', 'submit')
    expect(sair.closest('form')).not.toBeNull()
  })

  it('o logo não é forçado a carregar: no celular a lateral fica escondida', () => {
    render(<Lateral usuario={helena} />)
    const logo = screen.getByAltText('ELO HUB')
    expect(logo).toHaveAttribute('loading', 'lazy')
    expect(logo).toHaveAttribute('fetchpriority', 'high')
  })

  it('os itens têm um tom de pressionado mais forte que o de passar o mouse', () => {
    render(<Lateral usuario={helena} />)
    for (const nome of ['Início', 'Clientes', 'Padrão visual']) {
      const classes = screen.getByRole('link', { name: nome }).className.split(' ')
      expect(classes, nome).toContain('hover:bg-sidebar-accent/60')
      expect(classes, nome).toContain('active:bg-sidebar-accent-active')
    }
  })
})

describe('LateralEstatica', () => {
  beforeEach(() => {
    rota.pathname = null
  })

  it('sem usuário, mostra a lateral com os itens comuns, sem nome, perfil nem Sair', () => {
    render(<LateralEstatica usuario={null} />)
    expect(screen.getByRole('link', { name: 'Início' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Clientes' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Padrão visual' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Configurações' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sair' })).not.toBeInTheDocument()
    expect(screen.queryByText('Helena Prado')).not.toBeInTheDocument()
  })

  it('é a mesma lateral sem ler o endereço e sem marcar a página atual', () => {
    const { container } = render(<LateralEstatica usuario={helena} />)
    expect(container.firstElementChild).toHaveAttribute('data-sidebar')
    expect(screen.getByRole('navigation', { name: 'Menu principal' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Clientes' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Configurações' })).toBeInTheDocument()
    expect(screen.getByText('Helena Prado')).toBeInTheDocument()
    expect(screen.getAllByRole('link').filter((l) => l.hasAttribute('aria-current'))).toEqual([])
  })
})
