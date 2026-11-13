import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LinkVoltar } from './link-voltar'

describe('LinkVoltar', () => {
  it('tem o nome acessível "Voltar para <rótulo>" e o destino', () => {
    render(<LinkVoltar href="/clientes" rotulo="Clientes" />)
    const link = screen.getByRole('link', { name: 'Voltar para Clientes' })
    expect(link).toHaveAttribute('href', '/clientes')
    expect(link).toHaveTextContent('Clientes')
  })
})
