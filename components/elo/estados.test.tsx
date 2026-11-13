import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AcessoNegado, Carregando, ErroCarregamento, EstadoVazio } from './estados'

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

  it('Carregando é um status ocupado, com o rótulo para o leitor de tela e quatro linhas cinza', () => {
    render(<Carregando />)
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-busy', 'true')
    expect(status).toHaveTextContent('Carregando')
    expect(screen.getByText('Carregando')).toHaveClass('sr-only')
    expect(status.querySelectorAll(':scope > [data-carregando-linha]')).toHaveLength(4)
    expect(status.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
  })

  it('Carregando aceita a quantidade de linhas e o rótulo', () => {
    render(<Carregando linhas={2} rotulo="Carregando contratos" />)
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Carregando contratos')
    expect(status.querySelectorAll(':scope > [data-carregando-linha]')).toHaveLength(2)
  })

  it('AcessoNegado mostra a mensagem', () => {
    render(<AcessoNegado />)
    expect(screen.getByText('Você não tem acesso a esta página.')).toBeInTheDocument()
  })
})
