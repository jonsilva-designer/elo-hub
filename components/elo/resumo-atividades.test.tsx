import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ResumoAtividades } from './resumo-atividades'

describe('ResumoAtividades (CA-07.2)', () => {
  it('mostra o total, as concluídas com a barra e as atrasadas em alerta', () => {
    const { container } = render(<ResumoAtividades resumo={{ total: 5, concluidas: 1, atrasadas: 1 }} />)
    expect(container).toHaveTextContent('5 atividades')
    expect(container).toHaveTextContent('1 de 5 concluídas')
    expect(screen.getByText(/atrasada$/)).toHaveTextContent('1 atrasada')
    expect(screen.getByRole('progressbar', { name: 'Atividades concluídas' })).toBeInTheDocument()
    for (const n of container.querySelectorAll('.font-mono')) expect(n.textContent).toMatch(/^\d+$/)
  })

  it('no plural, "atrasadas"; sem atrasada, não fala de atraso', () => {
    const { container, rerender } = render(<ResumoAtividades resumo={{ total: 4, concluidas: 0, atrasadas: 2 }} />)
    expect(container).toHaveTextContent('2 atrasadas')
    rerender(<ResumoAtividades resumo={{ total: 1, concluidas: 1, atrasadas: 0 }} />)
    expect(container).toHaveTextContent('1 atividade')
    expect(container).not.toHaveTextContent('atrasad')
  })

  it('compacto: só as concluídas e as atrasadas, sem barra', () => {
    const { container } = render(<ResumoAtividades compacto resumo={{ total: 5, concluidas: 1, atrasadas: 1 }} />)
    expect(container).toHaveTextContent('1 de 5 concluídas · 1 atrasada')
    expect(container).not.toHaveTextContent('5 atividades')
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('sem atividades', () => {
    const { container } = render(<ResumoAtividades compacto resumo={{ total: 0, concluidas: 0, atrasadas: 0 }} />)
    expect(container).toHaveTextContent('Nenhuma atividade')
  })
})
