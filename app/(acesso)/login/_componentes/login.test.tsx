import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrar } from '@/lib/acesso/acoes'
import { destinoDe, entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoLogin } from './conteudo-login'
import { FormularioLogin } from './formulario-login'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)
vi.mock('@/lib/acesso/acoes', () => ({ entrar: vi.fn(), entrarComoPerfil: vi.fn() }))

const entrarFalso = vi.mocked(entrar)

beforeEach(() => {
  limparCookies()
  entrarFalso.mockReset()
})

async function renderizarConteudo(busca: Record<string, string | string[] | undefined> = {}) {
  return render(await ConteudoLogin({ searchParams: Promise.resolve(busca) }))
}

const campoDestino = (container: HTMLElement) =>
  container.querySelector('input[type="hidden"][name="destino"]') as HTMLInputElement

describe('página de login', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Entrar | Plataforma ELO')
  })

  it('com sessão válida, vai para o Início', async () => {
    entrarComo('usr-helena')
    expect(await destinoDe(ConteudoLogin({ searchParams: Promise.resolve({}) }))).toBe('/inicio')
  })

  it('com cookie de usuário inativo, mostra o formulário, sem laço', async () => {
    entrarComo('usr-marcos')
    await renderizarConteudo()
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
  })

  it.each([
    ['um caminho interno', '/designsystem', '/designsystem'],
    ['outro site', '//site.com', '/inicio'],
    ['repetido, vale o primeiro', ['/designsystem', '/x'], '/designsystem'],
    ['ausente', undefined, '/inicio'],
  ])('leva o destino ao formulário: %s', async (_caso, destino, esperado) => {
    const { container } = await renderizarConteudo({ destino })
    expect(campoDestino(container).value).toBe(esperado)
  })

  it('mostra o aviso de senha definida só com aviso=senha-definida', async () => {
    await renderizarConteudo({ aviso: 'senha-definida' })
    expect(screen.getByRole('status')).toHaveTextContent('Senha definida. Entre com seu e-mail e a nova senha.')
  })

  it('não mostra aviso com outro valor', async () => {
    await renderizarConteudo({ aviso: 'outro' })
    expect(screen.queryByText(/Senha definida/)).not.toBeInTheDocument()
  })
})

describe('formulário de login', () => {
  it('tem os campos, o link de recuperação e o botão Entrar', () => {
    render(<FormularioLogin destino="/inicio" />)
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password')
    expect(screen.getByRole('link', { name: 'Esqueci minha senha' })).toHaveAttribute('href', '/recuperar-senha')
    expect(screen.getByRole('button', { name: 'Entrar' })).toHaveAttribute('type', 'submit')
  })

  it('mostra os erros sob os campos e devolve o e-mail digitado', async () => {
    const u = userEvent.setup()
    entrarFalso.mockResolvedValue({
      email: 'x@y',
      erros: { email: 'Informe um e-mail válido.', senha: 'Informe a senha.' },
    })
    render(<FormularioLogin destino="/inicio" />)
    await u.type(screen.getByLabelText('E-mail'), 'x@y')
    await u.click(screen.getByRole('button', { name: 'Entrar' }))

    const email = await screen.findByLabelText('E-mail')
    await waitFor(() => expect(email).toHaveAttribute('aria-invalid', 'true'))
    expect(email).toHaveAccessibleDescription('Informe um e-mail válido.')
    expect(email).toHaveValue('x@y')
    expect(screen.getByLabelText('Senha')).toHaveAccessibleDescription('Informe a senha.')
  })

  it('mostra o erro geral num alerta acima do botão Entrar', async () => {
    const u = userEvent.setup()
    entrarFalso.mockResolvedValue({ email: 'a@b.com', erros: {}, erroGeral: 'E-mail ou senha incorretos.' })
    render(<FormularioLogin destino="/inicio" />)
    await u.click(screen.getByRole('button', { name: 'Entrar' }))

    const alerta = await screen.findByRole('alert')
    expect(alerta).toHaveTextContent('E-mail ou senha incorretos.')
    const botao = screen.getByRole('button', { name: 'Entrar' })
    expect(alerta.compareDocumentPosition(botao) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('enquanto envia, o botão fica desabilitado e não aceita um segundo clique', async () => {
    const u = userEvent.setup()
    entrarFalso.mockReturnValue(new Promise(() => {}))
    render(<FormularioLogin destino="/inicio" />)
    await u.click(screen.getByRole('button', { name: 'Entrar' }))

    const botao = screen.getByRole('button', { name: /Entrar/ })
    await waitFor(() => expect(botao).toBeDisabled())
    expect(botao).toHaveAttribute('aria-busy', 'true')
    await u.click(botao)
    expect(entrarFalso).toHaveBeenCalledTimes(1)
  })

  it('envia o destino junto', async () => {
    const u = userEvent.setup()
    entrarFalso.mockReturnValue(new Promise(() => {}))
    render(<FormularioLogin destino="/designsystem" />)
    await u.click(screen.getByRole('button', { name: 'Entrar' }))
    await waitFor(() => expect(entrarFalso).toHaveBeenCalled())
    expect((entrarFalso.mock.calls[0][1] as FormData).get('destino')).toBe('/designsystem')
  })
})

describe('entrada por perfil do protótipo', () => {
  it('mostra os dois perfis de exemplo e a dica do usuário inativo', async () => {
    await renderizarConteudo()
    const bloco = screen.getByRole('region', { name: 'Protótipo' })
    expect(bloco).toHaveTextContent('Entre sem senha com um perfil de exemplo.')
    expect(bloco).toHaveTextContent('Helena Prado')
    expect(bloco).toHaveTextContent('Rafael Souza, 3 clientes vinculados')
    expect(bloco).toHaveTextContent('Para ver o acesso negado, use marcos.lima@elogovernance.com.br.')
  })

  it('cada botão envia o seu próprio formulário, fora do formulário principal', async () => {
    await renderizarConteudo()
    const principal = screen.getByRole('button', { name: 'Entrar' }).closest('form')
    for (const nome of ['Entrar como Administrador', 'Entrar como Equipe']) {
      const botao = screen.getByRole('button', { name: nome })
      expect(botao).toHaveAttribute('type', 'submit')
      const form = botao.closest('form')
      expect(form).not.toBeNull()
      expect(form).not.toBe(principal)
      expect(principal?.contains(botao)).toBe(false)
    }
  })
})
