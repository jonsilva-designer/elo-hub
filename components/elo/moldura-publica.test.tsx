import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MolduraPublica } from './moldura-publica'

describe('MolduraPublica', () => {
  it('mostra o logo e os filhos', () => {
    render(
      <MolduraPublica>
        <p>Conteúdo público</p>
      </MolduraPublica>,
    )
    expect(screen.getByText('Conteúdo público')).toBeInTheDocument()
    expect(screen.getByAltText('ELO HUB')).toBeInTheDocument()
  })

  it('carrega o logo de imediato, sem o priority que o Next 16 descontinuou', () => {
    render(<MolduraPublica>x</MolduraPublica>)
    expect(screen.getByAltText('ELO HUB')).toHaveAttribute('loading', 'eager')
  })

  it('ocupa a tela toda por padrão', () => {
    const { container } = render(<MolduraPublica>x</MolduraPublica>)
    expect((container.firstElementChild as HTMLElement).className).toContain('min-h-dvh')
  })

  it('aceita className para caber num quadro reduzido', () => {
    const { container } = render(<MolduraPublica className="min-h-0">x</MolduraPublica>)
    const classes = (container.firstElementChild as HTMLElement).className.split(' ')
    expect(classes).toContain('min-h-0')
    expect(classes).not.toContain('min-h-dvh')
  })
})
