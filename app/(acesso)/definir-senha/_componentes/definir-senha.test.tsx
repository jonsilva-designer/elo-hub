import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { definirSenha } from '@/lib/acesso/acoes'
import Pagina, { metadata } from '../page'

vi.mock('@/lib/acesso/acoes', () => ({ definirSenha: vi.fn() }))

const definirFalso = vi.mocked(definirSenha)

beforeEach(() => {
  definirFalso.mockReset()
})

describe('Definir senha', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Definir senha | Plataforma ELO')
  })

  it('mostra o título, a orientação e os dois campos de senha', () => {
    render(<Pagina />)
    expect(screen.getByRole('heading', { level: 1, name: 'Definir senha' })).toBeInTheDocument()
    expect(
      screen.getByText('Crie a senha que você vai usar para entrar na Plataforma ELO. Use pelo menos 8 caracteres.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Nova senha')).toHaveAttribute('type', 'password')
    expect(screen.getByLabelText('Confirme a nova senha')).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: 'Salvar senha' })).toHaveAttribute('type', 'submit')
  })

  it('mostra cada erro sob o seu campo', async () => {
    const u = userEvent.setup()
    definirFalso.mockResolvedValue({
      erros: { senha: 'A senha precisa ter pelo menos 8 caracteres.', confirmacao: 'As senhas não são iguais.' },
    })
    render(<Pagina />)
    await u.click(screen.getByRole('button', { name: 'Salvar senha' }))
    await waitFor(() =>
      expect(screen.getByLabelText('Nova senha')).toHaveAccessibleDescription(
        'A senha precisa ter pelo menos 8 caracteres.',
      ),
    )
    expect(screen.getByLabelText('Confirme a nova senha')).toHaveAccessibleDescription('As senhas não são iguais.')
  })

  it('enquanto envia, o botão fica desabilitado', async () => {
    const u = userEvent.setup()
    definirFalso.mockReturnValue(new Promise(() => {}))
    render(<Pagina />)
    await u.click(screen.getByRole('button', { name: 'Salvar senha' }))
    await waitFor(() => expect(screen.getByRole('button', { name: /Salvar senha/ })).toBeDisabled())
  })
})
