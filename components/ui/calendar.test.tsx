import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Calendar } from './calendar'

const GUARDA = 'not-disabled:not-aria-disabled:'

describe('Calendar, dia escolhido', () => {
  it('continua azul-marinho ao passar o mouse e ao pressionar, com o texto branco legível', () => {
    const dia = new Date(2026, 10, 9)
    const { container } = render(<Calendar mode="single" selected={dia} defaultMonth={dia} />)
    const escolhido = container.querySelector<HTMLElement>('[data-selected-single="true"]')!
    const classes = escolhido.className.split(' ')
    expect(classes).toContain(`data-[selected-single=true]:${GUARDA}hover:bg-primary-hover`)
    expect(classes).toContain(`data-[selected-single=true]:${GUARDA}active:bg-primary-active`)
  })
})

describe('Calendar, título do mês', () => {
  it('o ano fica em JetBrains Mono e o nome do mês em Inter', () => {
    const dia = new Date(2026, 10, 9)
    render(<Calendar mode="single" selected={dia} defaultMonth={dia} />)
    const titulo = screen.getByRole('status')
    expect(titulo).toHaveTextContent('November 2026')
    expect(within(titulo).getByText('2026')).toHaveClass('font-mono', 'tabular-nums')
    expect(titulo).not.toHaveClass('font-mono')
  })
})
