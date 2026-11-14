import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QuadroPrototipo } from './quadro-prototipo'

describe('QuadroPrototipo', () => {
  it('é uma seção com o título "Protótipo" e o conteúdo dentro, separada do formulário de verdade', () => {
    render(
      <QuadroPrototipo>
        <p>Entrar como Administrador</p>
      </QuadroPrototipo>,
    )
    const secao = screen.getByRole('region', { name: 'Protótipo' })
    expect(secao).toHaveTextContent('Entrar como Administrador')
  })

  it('dois quadros na mesma tela têm títulos com ids diferentes', () => {
    render(
      <>
        <QuadroPrototipo>um</QuadroPrototipo>
        <QuadroPrototipo>dois</QuadroPrototipo>
      </>,
    )
    expect(screen.getAllByRole('region', { name: 'Protótipo' })).toHaveLength(2)
  })
})
