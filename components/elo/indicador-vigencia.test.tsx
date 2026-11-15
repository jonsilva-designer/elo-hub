import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { IndicadorVigencia } from './indicador-vigencia'

describe('IndicadorVigencia (F04)', () => {
  it('com término, mostra a etiqueta, a data em números e os dias restantes', () => {
    render(
      <IndicadorVigencia
        vigencia={{ status: 'Próximo do vencimento', diasRestantes: 20 }}
        termino="2026-12-04"
        tipoVigencia="Prazo determinado"
      />,
    )
    expect(screen.getByText('Próximo do vencimento')).toBeInTheDocument()
    expect(screen.getByText('04/12/2026')).toHaveClass('font-mono')
    // JetBrains Mono em todos os números (padrão visual), também no meio do texto dos dias.
    const dias = screen.getByText('20')
    expect(dias).toHaveClass('font-mono')
    expect(dias.parentElement).toHaveTextContent('20 dias restantes')
  })

  it('vencido diz há quantos dias', () => {
    render(<IndicadorVigencia vigencia={{ status: 'Vencido', diasRestantes: -75 }} termino="2026-08-31" tipoVigencia="Prazo determinado" />)
    expect(screen.getByText('Vencido')).toBeInTheDocument()
    const dias = screen.getByText('75')
    expect(dias).toHaveClass('font-mono')
    expect(dias.parentElement).toHaveTextContent('Vencido há 75 dias')
  })

  it('Prazo indeterminado: Vigente, sem data nem dias', () => {
    render(<IndicadorVigencia vigencia={{ status: 'Vigente', diasRestantes: null }} termino={null} tipoVigencia="Prazo indeterminado" />)
    expect(screen.getByText('Vigente')).toBeInTheDocument()
    expect(screen.getByText('Prazo indeterminado')).toBeInTheDocument()
  })

  it('Encerrado: só a etiqueta; sem vigência: o traço', () => {
    const { rerender } = render(
      <IndicadorVigencia vigencia={{ status: 'Encerrado', diasRestantes: null }} termino="2025-05-31" tipoVigencia="Prazo determinado" />,
    )
    expect(screen.getByText('Encerrado')).toBeInTheDocument()
    expect(screen.queryByText('31/05/2025')).not.toBeInTheDocument()
    rerender(<IndicadorVigencia vigencia={null} termino={null} tipoVigencia="Prazo determinado" />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
