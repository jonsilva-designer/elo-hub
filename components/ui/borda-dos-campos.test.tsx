import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SelecaoMultipla } from '@/components/elo/selecao-multipla'
import { Input } from './input'
import { InputGroup, InputGroupInput } from './input-group'
import { Select, SelectTrigger, SelectValue } from './select'
import { Textarea } from './textarea'

// Padrão 7: ao passar o mouse, a borda do campo fica um tom mais escura. Nunca no desabilitado
// nem no campo com erro, que mantém a borda vermelha.
const GUARDA = 'not-disabled:not-aria-disabled:not-aria-invalid:'

function hovers(el: HTMLElement) {
  return el.className.split(' ').filter((c) => /(^|:)hover:/.test(c))
}

describe('borda dos campos ao passar o mouse', () => {
  it('campo de texto', () => {
    render(<Input aria-label="Nome" />)
    const campo = screen.getByLabelText('Nome')
    expect(hovers(campo)).toEqual([`${GUARDA}hover:border-input-hover`])
  })

  it('área de texto', () => {
    render(<Textarea aria-label="Observações" />)
    expect(hovers(screen.getByLabelText('Observações'))).toEqual([`${GUARDA}hover:border-input-hover`])
  })

  it('seleção', () => {
    render(
      <Select>
        <SelectTrigger aria-label="Segmento">
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
      </Select>,
    )
    expect(hovers(screen.getByRole('combobox', { name: 'Segmento' }))).toEqual([
      `${GUARDA}hover:border-input-hover`,
    ])
  })

  it('grupo de campo (data, valor, busca e seleção com busca)', () => {
    render(
      <InputGroup>
        <InputGroupInput aria-label="Valor" />
      </InputGroup>,
    )
    const grupo = screen.getByRole('group')
    expect(hovers(grupo)).toEqual(['not-has-disabled:not-has-aria-invalid:hover:border-input-hover'])
  })

  it('seleção múltipla (a caixa das fichas)', () => {
    const { container } = render(
      <SelecaoMultipla opcoes={[{ valor: 'ana', rotulo: 'Ana' }]} valores={[]} onChange={() => {}} />,
    )
    const caixa = container.querySelector<HTMLElement>('[data-slot="combobox-chips"]')!
    expect(hovers(caixa)).toEqual(['not-has-disabled:not-has-aria-invalid:hover:border-input-hover'])
  })
})
