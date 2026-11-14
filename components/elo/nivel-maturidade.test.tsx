import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NivelMaturidade } from './nivel-maturidade'

const preenchidos = (container: HTMLElement) => container.querySelectorAll('[data-preenchida="true"]').length
const passos = (container: HTMLElement) => container.querySelectorAll('[data-slot="passo"]').length

describe('NivelMaturidade (padrão 4.6)', () => {
  it.each([
    ['Inicial', 1],
    ['Básica', 2],
    ['Em estruturação', 3],
    ['Consistente', 4],
    ['Avançada', 5],
  ] as const)('%s preenche %i de 5 passos', (nivel, cheios) => {
    const { container } = render(<NivelMaturidade nivel={nivel} />)
    expect(screen.getByText(nivel)).toBeInTheDocument()
    expect(passos(container)).toBe(5)
    expect(preenchidos(container)).toBe(cheios)
  })

  it.each(['Não avaliada', 'Inconclusiva'] as const)('%s fica em texto secundário, com a régua vazia', (nivel) => {
    const { container } = render(<NivelMaturidade nivel={nivel} />)
    expect(screen.getByText(nivel)).toHaveClass('text-muted-foreground')
    expect(preenchidos(container)).toBe(0)
  })

  it('sem nível, mostra o traço', () => {
    const { container } = render(<NivelMaturidade nivel={null} />)
    expect(container).toHaveTextContent('—')
    expect(passos(container)).toBe(0)
  })

  it('a régua fica fora do leitor de tela, que ouve só o nome do nível', () => {
    const { container } = render(<NivelMaturidade nivel="Básica" />)
    expect(container.querySelector('[data-slot="regua"]')).toHaveAttribute('aria-hidden', 'true')
  })

  it('o nível não usa cor de alerta: preenchido em azul-marinho', () => {
    const { container } = render(<NivelMaturidade nivel="Avançada" />)
    for (const passo of container.querySelectorAll('[data-preenchida="true"]')) expect(passo).toHaveClass('bg-primary')
  })
})
