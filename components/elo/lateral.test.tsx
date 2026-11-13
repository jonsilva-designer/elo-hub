import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Usuario } from '@/lib/dados/tipos'
import { Lateral } from './lateral'

const rota = vi.hoisted(() => ({ pathname: '/clientes/12' }))
vi.mock('next/navigation', () => ({ usePathname: () => rota.pathname }))

const helena: Usuario = { nome: 'Helena Prado', perfil: 'Administrador' }

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
    render(<Lateral usuario={{ nome: 'Marcos Lima', perfil: 'Equipe' }} />)
    expect(screen.queryByRole('link', { name: 'Configurações' })).not.toBeInTheDocument()
  })
})
