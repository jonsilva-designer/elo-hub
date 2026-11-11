import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CampoValor } from './campo-valor'

describe('CampoValor', () => {
  it('mostra o prefixo R$', () => {
    render(<CampoValor id="v" valor={null} onChange={() => {}} />)
    expect(screen.getByText('R$')).toBeInTheDocument()
  })

  it('formata ao sair do campo e entrega o número', async () => {
    const onChange = vi.fn()
    render(<CampoValor id="v" valor={null} onChange={onChange} />)
    const campo = screen.getByRole('textbox')
    await userEvent.type(campo, '48500')
    await userEvent.tab()
    expect(campo).toHaveValue('48.500,00')
    expect(onChange).toHaveBeenLastCalledWith(48500)
  })

  it('entende o formato brasileiro', async () => {
    const onChange = vi.fn()
    render(<CampoValor id="v" valor={null} onChange={onChange} />)
    await userEvent.type(screen.getByRole('textbox'), '1.234,5')
    expect(onChange).toHaveBeenLastCalledWith(1234.5)
  })

  it('campo vazio entrega null', async () => {
    const onChange = vi.fn()
    render(<CampoValor id="v" valor={10} onChange={onChange} />)
    const campo = screen.getByRole('textbox')
    expect(campo).toHaveValue('10,00')
    await userEvent.clear(campo)
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('só pontuação ou letras entregam null', async () => {
    const onChange = vi.fn()
    render(<CampoValor id="v" valor={null} onChange={onChange} />)
    const campo = screen.getByRole('textbox')
    await userEvent.type(campo, '.')
    expect(onChange).toHaveBeenLastCalledWith(null)
    await userEvent.clear(campo)
    await userEvent.type(campo, '...')
    expect(onChange).toHaveBeenLastCalledWith(null)
    await userEvent.clear(campo)
    await userEvent.type(campo, 'abc')
    expect(campo).toHaveValue('')
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('não aceita sinal de menos', async () => {
    const onChange = vi.fn()
    render(<CampoValor id="v" valor={null} onChange={onChange} />)
    await userEvent.type(screen.getByRole('textbox'), '-5')
    expect(screen.getByRole('textbox')).toHaveValue('5')
    expect(onChange).toHaveBeenLastCalledWith(5)
  })

  it('mostra zero como 0,00', () => {
    render(<CampoValor id="v" valor={0} onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toHaveValue('0,00')
  })
})
