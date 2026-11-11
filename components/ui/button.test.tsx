import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from './button'

describe('Button carregando', () => {
  it('fica desabilitado, ocupado, mostra o indicador e mantém o texto', () => {
    render(<Button carregando>Salvar</Button>)
    const botao = screen.getByRole('button', { name: /Salvar/ })
    expect(botao).toBeDisabled()
    expect(botao).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(botao).toHaveTextContent('Salvar')
  })
})
