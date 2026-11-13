import { render } from '@testing-library/react'
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
