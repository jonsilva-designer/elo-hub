import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { pedirRecuperacao } from '@/lib/acesso/acoes'
import Pagina, { metadata } from '../page'

vi.mock('@/lib/acesso/acoes', () => ({ pedirRecuperacao: vi.fn() }))

const pedirFalso = vi.mocked(pedirRecuperacao)

beforeEach(() => {
  pedirFalso.mockReset()
})

const CONFIRMACAO =
  'Se o e-mail estiver cadastrado, enviamos um link para criar uma nova senha. Confira também a caixa de spam.'

describe('Recuperar senha', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Recuperar senha | Plataforma ELO')
  })

  it('mostra o título, a orientação, o campo E-mail e o botão Enviar link', () => {
    render(<Pagina />)
    expect(screen.getByRole('heading', { level: 1, name: 'Recuperar senha' })).toBeInTheDocument()
    expect(
      screen.getByText('Informe o e-mail cadastrado. Você vai receber um link para criar uma nova senha.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('type', 'email')
    expect(screen.getByRole('button', { name: 'Enviar link' })).toHaveAttribute('type', 'submit')
  })

  it('depois do envio, o formulário dá lugar à confirmação', async () => {
    const u = userEvent.setup()
    pedirFalso.mockResolvedValue({ email: 'a@b.com', enviado: true })
    render(<Pagina />)
    await u.click(screen.getByRole('button', { name: 'Enviar link' }))
    expect(await screen.findByRole('status')).toHaveTextContent(CONFIRMACAO)
    expect(screen.queryByLabelText('E-mail')).not.toBeInTheDocument()
  })

  it('mostra o erro sob o campo', async () => {
    const u = userEvent.setup()
    pedirFalso.mockResolvedValue({ email: 'helena', erro: 'Informe um e-mail válido.', enviado: false })
    render(<Pagina />)
    await u.click(screen.getByRole('button', { name: 'Enviar link' }))
    const campo = await screen.findByLabelText('E-mail')
    await waitFor(() => expect(campo).toHaveAccessibleDescription('Informe um e-mail válido.'))
    expect(campo).toHaveValue('helena')
  })

  it('tem a volta ao login e o atalho do protótipo para a tela do link', () => {
    render(<Pagina />)
    expect(screen.getByRole('link', { name: 'Voltar para o login' })).toHaveAttribute('href', '/login')
    const bloco = screen.getByRole('region', { name: 'Protótipo' })
    expect(bloco).toHaveTextContent('Nenhum e-mail é enviado no protótipo.')
    expect(screen.getByRole('link', { name: 'Abrir a tela do link do e-mail' })).toHaveAttribute(
      'href',
      '/definir-senha',
    )
  })

  it('enquanto envia, o botão fica desabilitado', async () => {
    const u = userEvent.setup()
    pedirFalso.mockReturnValue(new Promise(() => {}))
    render(<Pagina />)
    await u.click(screen.getByRole('button', { name: 'Enviar link' }))
    await waitFor(() => expect(screen.getByRole('button', { name: /Enviar link/ })).toBeDisabled())
  })
})
