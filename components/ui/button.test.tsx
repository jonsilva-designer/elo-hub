import { createEvent, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from './button'

describe('Button carregando', () => {
  it('fica desabilitado, ocupado, mostra o indicador e mantém o texto', () => {
    render(<Button carregando>Salvar</Button>)
    const botao = screen.getByRole('button', { name: /Salvar/ })
    expect(botao).toBeDisabled()
    expect(botao).toHaveAttribute('aria-busy', 'true')
    expect(botao.querySelector('[data-slot="spinner"]')).toHaveAttribute('aria-hidden', 'true')
    expect(botao).toHaveTextContent('Salvar')
  })

  it('carregando, o nome do botão continua só o texto: o indicador não entra no nome (revisão do código)', () => {
    render(<Button carregando>Salvar</Button>)
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
  })

  it('com asChild, carregando ou desabilitado bloqueia o link (revisão do código)', () => {
    render(
      <Button asChild carregando>
        <a href="/x">Salvar</a>
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'Salvar' })
    expect(link).toHaveAttribute('aria-disabled', 'true')
    expect(link).toHaveAttribute('tabindex', '-1')
    const clique = createEvent.click(link)
    fireEvent(link, clique)
    expect(clique.defaultPrevented).toBe(true)
  })
})

const GUARDA = 'not-disabled:not-aria-disabled:'

/** Classes de passar o mouse e de pressionado (sem a translação, que é de todos). */
function deEstado(botao: HTMLElement) {
  return botao.className.split(' ').filter((c) => /(^|:)(hover|active):/.test(c))
}

describe('Button, passar o mouse e pressionado (padrão 7)', () => {
  const TONS = {
    default: ['bg-primary-hover', 'bg-primary-active'],
    destructive: ['bg-destructive-hover', 'bg-destructive-active'],
    outline: ['bg-surface-hover', 'bg-surface-active'],
    ghost: ['bg-surface-hover', 'bg-surface-active'],
  } as const

  for (const [variante, [hover, active]] of Object.entries(TONS)) {
    it(`${variante}: um tom mais escuro ao passar o mouse e outro ao pressionar`, () => {
      render(<Button variant={variante as keyof typeof TONS}>Salvar</Button>)
      const classes = screen.getByRole('button').className.split(' ')
      expect(classes).toContain(`${GUARDA}hover:${hover}`)
      expect(classes).toContain(`${GUARDA}active:${active}`)
    })

    it(`${variante}: passar o mouse e pressionar não valem no desabilitado`, () => {
      render(<Button variant={variante as keyof typeof TONS}>Salvar</Button>)
      for (const c of deEstado(screen.getByRole('button'))) expect(c.startsWith(GUARDA), c).toBe(true)
    })
  }

  it('não usa mais a cor translúcida, que clareava o botão', () => {
    render(<Button>Salvar</Button>)
    expect(screen.getByRole('button').className).not.toMatch(/bg-(primary|destructive)\/\d+/)
  })
})
