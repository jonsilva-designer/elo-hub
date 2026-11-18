import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { avisarSalvo } from '@/lib/avisos'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { ConteudoNovoUsuario } from '../../novo/_componentes/conteudo-novo-usuario'
import { metadata as metadataNovo } from '../../novo/page'
import { metadata } from '../page'
import { ConteudoUsuario } from './conteudo-usuario'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('@/lib/avisos', () => ({ avisarSalvo: vi.fn() }))
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => limparCookies())

const pagina = (id: string) => ConteudoUsuario({ params: Promise.resolve({ id }) })

async function abrir(id: string) {
  return render(<TooltipProvider>{await pagina(id)}</TooltipProvider>)
}

describe('cadastro e página do usuário (parte 8, 4.1)', () => {
  it('têm os títulos da aba', () => {
    expect(metadata.title).toBe('Usuário | Plataforma ELO')
    expect(metadataNovo.title).toBe('Novo usuário | Plataforma ELO')
  })

  it('a Equipe recebe acesso negado nas duas (CA-01.2)', async () => {
    entrarComo('usr-rafael')
    const { unmount } = render(await ConteudoNovoUsuario())
    expect(screen.getByText('Você não tem acesso a esta página.')).toBeInTheDocument()
    unmount()
    await abrir('usr-rafael')
    expect(screen.getByText('Você não tem acesso a esta página.')).toBeInTheDocument()
  })

  it('o cadastro: nome, e-mail, perfil e, na Equipe, os clientes; enviar sem nada mostra o que falta', async () => {
    entrarComo('usr-helena')
    render(<TooltipProvider>{await ConteudoNovoUsuario()}</TooltipProvider>)
    expect(screen.getByRole('heading', { level: 1, name: 'Novo usuário' })).toBeInTheDocument()
    expect(screen.queryByText('Clientes vinculados')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('combobox', { name: /Perfil/ }))
    await userEvent.click(await screen.findByRole('option', { name: 'Equipe' }))
    expect(screen.getByText('Clientes vinculados')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar e enviar o convite' }))
    expect(await screen.findByText('Informe o nome.')).toBeInTheDocument()
    expect(screen.getByText('Escolha pelo menos um cliente.')).toBeInTheDocument()
  })

  it('a página vem preenchida com os dados e os vínculos', async () => {
    entrarComo('usr-helena')
    await abrir('usr-rafael')
    expect(screen.getByRole('heading', { level: 1, name: 'Rafael Souza' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /E-mail/ })).toHaveValue('rafael.souza@elogovernance.com.br')
    expect(screen.getByRole('combobox', { name: /Perfil/ })).toHaveTextContent('Equipe')
    expect(screen.getByText('Clientes vinculados')).toBeInTheDocument()
  })

  it('inativar com itens abertos é recusado e lista os itens (CA-01.7)', async () => {
    entrarComo('usr-helena')
    await abrir('usr-rafael')
    await userEvent.click(screen.getByRole('button', { name: 'Mais ações' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Inativar' }))
    const janela = within(await screen.findByRole('alertdialog'))
    await userEvent.click(janela.getByRole('button', { name: 'Inativar' }))
    expect(await janela.findByText(/Há itens abertos sob a responsabilidade desta pessoa/)).toBeInTheDocument()
    expect(janela.getAllByRole('link').length).toBeGreaterThan(5)
  })

  it('redistribui os itens escolhidos para quem tem vínculo (CA-01.9)', async () => {
    entrarComo('usr-helena')
    vi.mocked(avisarSalvo).mockReset()
    await abrir('usr-rafael')
    const painel = within(screen.getByRole('region', { name: /Itens abertos/ }))
    await userEvent.click(painel.getByRole('checkbox', { name: /Protocolar a renovação da licença de operação/ }))
    await userEvent.click(painel.getByRole('combobox', { name: /Novo responsável/ }))
    await userEvent.click(await screen.findByRole('option', { name: 'Helena Prado' }))
    await userEvent.click(painel.getByRole('button', { name: 'Redistribuir' }))
    await vi.waitFor(() => expect(avisarSalvo).toHaveBeenCalledWith('Itens redistribuídos. No protótipo, os dados não são gravados.'))
  })

  it('id que não existe: não encontrado', async () => {
    entrarComo('usr-helena')
    await expect(pagina('usr-nao-existe')).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
