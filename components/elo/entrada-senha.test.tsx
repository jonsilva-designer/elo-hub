import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Campo } from './campo'
import { EntradaSenha } from './entrada-senha'

function renderizar(erro?: string) {
  return render(
    <Campo rotulo="Senha" erro={erro}>
      {(p) => <EntradaSenha {...p} name="senha" />}
    </Campo>,
  )
}

describe('EntradaSenha', () => {
  it('começa escondida e o botão mostra e oculta a senha', async () => {
    const u = userEvent.setup()
    renderizar()
    const campo = screen.getByLabelText('Senha')
    expect(campo).toHaveAttribute('type', 'password')

    await u.click(screen.getByRole('button', { name: 'Mostrar senha' }))
    expect(campo).toHaveAttribute('type', 'text')
    const ocultar = screen.getByRole('button', { name: 'Ocultar senha' })
    expect(ocultar).toHaveTextContent('Ocultar')

    await u.click(ocultar)
    expect(campo).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: 'Mostrar senha' })).toHaveTextContent('Mostrar')
  })

  it('o botão aponta para o campo e não envia o formulário', async () => {
    const u = userEvent.setup()
    const aoEnviar = vi.fn((e: React.FormEvent) => e.preventDefault())
    render(
      <form onSubmit={aoEnviar}>
        <Campo rotulo="Senha">{(p) => <EntradaSenha {...p} name="senha" />}</Campo>
      </form>,
    )
    const botao = screen.getByRole('button', { name: 'Mostrar senha' })
    expect(botao).toHaveAttribute('type', 'button')
    expect(botao).toHaveAttribute('aria-controls', screen.getByLabelText('Senha').id)
    await u.click(botao)
    expect(aoEnviar).not.toHaveBeenCalled()
  })

  it('recebe do Campo o estado de erro', () => {
    renderizar('Informe a senha.')
    const campo = screen.getByLabelText('Senha')
    expect(campo).toHaveAttribute('aria-invalid', 'true')
    expect(campo).toHaveAccessibleDescription('Informe a senha.')
    expect(campo).toHaveAttribute('name', 'senha')
  })
})
