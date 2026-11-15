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
    expect(screen.getByText('20 dias restantes')).toBeInTheDocument()
  })

  it('vencido diz há quantos dias', () => {
    render(<IndicadorVigencia vigencia={{ status: 'Vencido', diasRestantes: -75 }} termino="2026-08-31" tipoVigencia="Prazo determinado" />)
    expect(screen.getByText('Vencido')).toBeInTheDocument()
    expect(screen.getByText('Vencido há 75 dias')).toBeInTheDocument()
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
