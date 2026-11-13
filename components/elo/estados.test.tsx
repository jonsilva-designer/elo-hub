import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AcessoNegado, ErroCarregamento, EstadoVazio } from './estados'

describe('estados', () => {
  it('EstadoVazio mostra título, descrição e ação', () => {
    render(
      <EstadoVazio titulo="Nenhum contrato cadastrado" descricao="Cadastre o primeiro." acao={<button>Cadastrar</button>} />,
    )
    expect(screen.getByText('Nenhum contrato cadastrado')).toBeInTheDocument()
    expect(screen.getByText('Cadastre o primeiro.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeInTheDocument()
  })

  it('ErroCarregamento tem a mensagem padrão e chama a função', async () => {
    const fn = vi.fn()
    render(<ErroCarregamento onTentarDeNovo={fn} />)
    expect(screen.getByText('Não foi possível carregar.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(fn).toHaveBeenCalledOnce()
  })

  it('AcessoNegado mostra a mensagem', () => {
    render(<AcessoNegado />)
    expect(screen.getByText('Você não tem acesso a esta página.')).toBeInTheDocument()
  })
})
