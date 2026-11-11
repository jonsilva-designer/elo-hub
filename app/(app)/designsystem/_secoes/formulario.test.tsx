import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Formulario } from './formulario'

describe('seção Formulário', () => {
  it('todo campo tem nome acessível', () => {
    render(<Formulario />)
    const campos = [
      ...screen.getAllByRole('textbox'),
      ...screen.getAllByRole('combobox'),
      ...screen.getAllByRole('checkbox'),
      ...screen.getAllByRole('radio'),
    ]
    expect(campos.length).toBeGreaterThan(10)
    for (const c of campos) {
      expect(c, c.outerHTML.slice(0, 120)).toHaveAccessibleName(/\S/)
    }
  })

  it('o grupo de opção única tem nome', () => {
    render(<Formulario />)
    for (const g of screen.getAllByRole('radiogroup')) expect(g).toHaveAccessibleName(/\S/)
  })

  it('o grupo de opção única com erro é marcado como inválido', () => {
    render(<Formulario />)
    const grupo = screen.getByText('Escolha o porte').closest('fieldset')!.querySelector('[role="radiogroup"]')
    expect(grupo).toHaveAttribute('aria-invalid', 'true')
  })
})
