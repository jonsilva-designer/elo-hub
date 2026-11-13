import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProgressoAtividades } from './progresso-atividades'

describe('ProgressoAtividades', () => {
  it('mostra o texto e a barra com valor arredondado', () => {
    const { container } = render(<ProgressoAtividades concluidas={3} total={8} />)
    expect(container).toHaveTextContent('3 de 8 concluídas')
    const barra = screen.getByRole('progressbar', { name: 'Atividades concluídas' })
    expect(barra).toHaveAttribute('aria-valuenow', '38')
    expect(barra).toHaveAttribute('aria-valuemin', '0')
    expect(barra).toHaveAttribute('aria-valuemax', '100')
  })

  it('sem atividades mostra o texto e nenhum NaN', () => {
    const { container } = render(<ProgressoAtividades concluidas={0} total={0} />)
    expect(container).toHaveTextContent('Sem atividades')
    expect(container.textContent).not.toContain('NaN')
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('limita as concluídas ao total', () => {
    render(<ProgressoAtividades concluidas={12} total={8} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })
})
