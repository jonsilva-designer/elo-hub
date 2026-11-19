import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FaixaIndicadores } from './faixa-indicadores'

describe('FaixaIndicadores', () => {
  it('os números ficam num card só, cada um levando à lista filtrada, com o número na fonte dos números', () => {
    render(
      <FaixaIndicadores
        rotulo="Números da carteira"
        itens={[
          { rotulo: 'Clientes ativos', valor: 3, href: '/clientes?status=Ativo' },
          { rotulo: 'Escopos', valor: 1234, href: '/escopos' },
        ]}
      />,
    )
    const faixa = screen.getByRole('region', { name: 'Números da carteira' })
    expect(faixa.querySelectorAll('a')).toHaveLength(2)
    expect(screen.getByRole('link', { name: /Clientes ativos/ })).toHaveAttribute('href', '/clientes?status=Ativo')
    expect(screen.getByText('1.234')).toHaveClass('font-mono')
  })
})
