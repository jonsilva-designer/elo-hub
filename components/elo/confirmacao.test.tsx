import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '@/components/ui/button'
import { AvisoConfirmacao, ConfirmarAcao } from './confirmacao'

describe('ConfirmarAcao', () => {
  function montar(onConfirmar = vi.fn()) {
    render(
      <ConfirmarAcao titulo="Excluir plano?" rotuloConfirmar="Excluir" perigo onConfirmar={onConfirmar}>
        <Button>Abrir</Button>
      </ConfirmarAcao>,
    )
    return onConfirmar
  }

  it('abre o diálogo com o título e confirma uma vez', async () => {
    const onConfirmar = montar()
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Excluir plano?')
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }))
    expect(onConfirmar).toHaveBeenCalledTimes(1)
  })

  it('sem descricao não emite erro nem aviso no console', async () => {
    const erro = vi.spyOn(console, 'error').mockImplementation(() => {})
    const aviso = vi.spyOn(console, 'warn').mockImplementation(() => {})
    montar()
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(erro).not.toHaveBeenCalled()
    expect(aviso).not.toHaveBeenCalled()
    erro.mockRestore()
    aviso.mockRestore()
  })

  it('Cancelar fecha sem confirmar', async () => {
    const onConfirmar = montar()
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(onConfirmar).not.toHaveBeenCalled()
  })
})

describe('AvisoConfirmacao', () => {
  it('mostra a mensagem e chama os dois retornos', async () => {
    const onConfirmar = vi.fn()
    const onRevisar = vi.fn()
    render(<AvisoConfirmacao mensagem="Data fora do prazo" onConfirmar={onConfirmar} onRevisar={onRevisar} />)
    expect(screen.getByText('Data fora do prazo')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Salvar mesmo assim' }))
    expect(onConfirmar).toHaveBeenCalledTimes(1)
    await userEvent.click(screen.getByRole('button', { name: 'Revisar' }))
    expect(onRevisar).toHaveBeenCalledTimes(1)
  })
})

describe('botões dentro de um formulário', () => {
  it('"Salvar mesmo assim" e "Revisar" não enviam o formulário em volta', async () => {
    const enviar = vi.fn((e: React.FormEvent) => e.preventDefault())
    const onConfirmar = vi.fn()
    const onRevisar = vi.fn()
    render(
      <form onSubmit={enviar}>
        <AvisoConfirmacao mensagem="Data fora do prazo" onConfirmar={onConfirmar} onRevisar={onRevisar} />
      </form>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Salvar mesmo assim' }))
    await userEvent.click(screen.getByRole('button', { name: 'Revisar' }))
    expect(enviar).not.toHaveBeenCalled()
    expect(onConfirmar).toHaveBeenCalledTimes(1)
    expect(onRevisar).toHaveBeenCalledTimes(1)
  })
})
