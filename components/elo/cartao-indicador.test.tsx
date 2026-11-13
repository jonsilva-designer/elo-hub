import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CartaoIndicador, GradeIndicadores } from './cartao-indicador'

describe('CartaoIndicador', () => {
  it('com href é um link, com o número em font-mono e o rótulo em caixa alta por classe', () => {
    render(<CartaoIndicador rotulo="Contratos vigentes" valor={24} href="/contratos?vigencia=vigente" />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/contratos?vigencia=vigente')
    expect(screen.getByText('24')).toHaveClass('font-mono')
    expect(screen.getByText('Contratos vigentes')).toHaveClass('uppercase')
  })

  it('mostra o zero e o separador de milhar', () => {
    render(
      <>
        <CartaoIndicador rotulo="A" valor={0} />
        <CartaoIndicador rotulo="B" valor={1234} />
      </>,
    )
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('1.234')).toBeInTheDocument()
  })

  it('sem href não é link', () => {
    render(<CartaoIndicador rotulo="Clientes ativos" valor={18} detalhe="na carteira" />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('na carteira')).toBeInTheDocument()
  })

  it('a grade tem 4, 2 e 1 colunas', () => {
    render(
      <GradeIndicadores>
        <p>x</p>
      </GradeIndicadores>,
    )
    expect(screen.getByText('x').parentElement).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'xl:grid-cols-4')
  })
})
