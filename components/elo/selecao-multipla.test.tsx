import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SelecaoMultipla } from './selecao-multipla'

const opcoes = [
  { valor: 'ana', rotulo: 'Ana' },
  { valor: 'bruno', rotulo: 'Bruno' },
  { valor: 'carla', rotulo: 'Carla' },
]

describe('SelecaoMultipla', () => {
  it('filtra pela busca', async () => {
    render(<SelecaoMultipla opcoes={opcoes} valores={[]} onChange={() => {}} />)
    await userEvent.type(screen.getByRole('combobox'), 'br')
    expect(screen.getByRole('option', { name: 'Bruno' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Ana' })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Carla' })).not.toBeInTheDocument()
  })

  it('escolher uma opção entrega os valores', async () => {
    const onChange = vi.fn()
    render(<SelecaoMultipla opcoes={opcoes} valores={[]} onChange={onChange} />)
    await userEvent.type(screen.getByRole('combobox'), 'br')
    await userEvent.click(screen.getByRole('option', { name: 'Bruno' }))
    expect(onChange).toHaveBeenCalledWith(['bruno'])
  })

  it('remover uma ficha tira o valor', async () => {
    const onChange = vi.fn()
    render(<SelecaoMultipla opcoes={opcoes} valores={['bruno']} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Remover Bruno' }))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('mostra Nenhum resultado quando a busca não acha', async () => {
    render(<SelecaoMultipla opcoes={opcoes} valores={[]} onChange={() => {}} />)
    await userEvent.type(screen.getByRole('combobox'), 'zzz')
    expect(await screen.findByText('Nenhum resultado')).toBeInTheDocument()
  })

  it('o texto de apoio padrão é Selecione', () => {
    render(<SelecaoMultipla opcoes={opcoes} valores={[]} onChange={() => {}} />)
    expect(screen.getByPlaceholderText('Selecione')).toBeInTheDocument()
  })
})
