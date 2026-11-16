import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Progresso } from './progresso'

const atividades = { rotulo: 'concluídas', vazio: 'Sem atividades', rotuloAcessivel: 'Atividades concluídas' }

describe('Progresso (parte 3, 5.13)', () => {
  it('mostra o texto com os números em fonte de número e a barra com valor arredondado', () => {
    const { container } = render(<Progresso feitas={3} total={8} {...atividades} />)
    expect(container).toHaveTextContent('3 de 8 concluídas')
    expect(screen.getByText('3')).toHaveClass('font-mono')
    expect(screen.getByText('8')).toHaveClass('font-mono')
    const barra = screen.getByRole('progressbar', { name: 'Atividades concluídas' })
    expect(barra).toHaveAttribute('aria-valuenow', '38')
    expect(barra).not.toHaveAttribute('data-state', 'indeterminate')
    expect(barra).toHaveAttribute('aria-valuemin', '0')
    expect(barra).toHaveAttribute('aria-valuemax', '100')
  })

  it('total zero mostra o vazio, sem barra e sem NaN', () => {
    const { container } = render(<Progresso feitas={0} total={0} {...atividades} />)
    expect(container).toHaveTextContent('Sem atividades')
    expect(container.textContent).not.toContain('NaN')
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('sem barra, mostra só o texto, em linha', () => {
    const { container } = render(
      <Progresso feitas={1} total={5} rotulo="etapas" vazio="Sem etapas aplicáveis" rotuloAcessivel="Etapas concluídas" barra={false} />,
    )
    expect(container).toHaveTextContent('1 de 5 etapas')
    expect(container.firstElementChild?.tagName).toBe('SPAN')
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('limita as feitas ao total', () => {
    render(<Progresso feitas={12} total={8} {...atividades} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })

  it('limita feitas negativas a zero', () => {
    render(<Progresso feitas={-2} total={8} {...atividades} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('total negativo mostra o vazio', () => {
    const { container } = render(<Progresso feitas={1} total={-3} {...atividades} />)
    expect(container).toHaveTextContent('Sem atividades')
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })
})
