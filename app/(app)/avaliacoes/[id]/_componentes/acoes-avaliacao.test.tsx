import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { avisarSalvo } from '@/lib/avisos'
import { concluirAvaliacao, reabrirAvaliacao } from '@/lib/maturidade/acoes'
import { AcoesAvaliacao } from './acoes-avaliacao'

vi.mock('@/lib/maturidade/acoes', () => ({ concluirAvaliacao: vi.fn(), reabrirAvaliacao: vi.fn() }))
vi.mock('@/lib/avisos', () => ({ avisarSalvo: vi.fn() }))

beforeEach(() => {
  vi.mocked(concluirAvaliacao).mockReset()
  vi.mocked(reabrirAvaliacao).mockReset()
  vi.mocked(avisarSalvo).mockReset()
})

const EM_ELABORACAO = { id: 'ava-x', status: 'Em elaboração' as const }
const CONCLUIDA = { id: 'ava-x', status: 'Concluída' as const }

describe('AcoesAvaliacao (parte 2, 5.9)', () => {
  it('com falta, Concluir abre a janela bloqueada com os itens e só o botão Fechar', async () => {
    render(<AcoesAvaliacao avaliacao={EM_ELABORACAO} faltando={['Gestão e qualidade', 'Prontidão']} podeEditar ehAdmin />)
    await userEvent.click(screen.getByRole('button', { name: 'Concluir' }))
    const janela = within(await screen.findByRole('alertdialog'))
    expect(janela.getByRole('heading', { name: 'Não é possível concluir' })).toBeInTheDocument()
    expect(janela.getByText('Para concluir, preencha:')).toBeInTheDocument()
    expect(janela.getAllByRole('listitem').map((i) => i.textContent)).toEqual(['Gestão e qualidade', 'Prontidão'])
    expect(janela.getAllByRole('button').map((b) => b.textContent)).toEqual(['Fechar'])
    expect(concluirAvaliacao).not.toHaveBeenCalled()
  })

  it('sem falta, confirmar chama concluirAvaliacao, mostra o aviso e fecha a janela', async () => {
    vi.mocked(concluirAvaliacao).mockResolvedValue({
      ok: true,
      mensagem: 'Avaliação concluída. No protótipo, os dados não são gravados.',
    })
    render(<AcoesAvaliacao avaliacao={EM_ELABORACAO} faltando={[]} podeEditar ehAdmin />)
    await userEvent.click(screen.getByRole('button', { name: 'Concluir' }))
    const janela = within(await screen.findByRole('alertdialog'))
    expect(janela.getByRole('heading', { name: 'Concluir avaliação?' })).toBeInTheDocument()
    expect(
      janela.getByText('Depois de concluída, a avaliação não muda. Só o Administrador pode reabri-la.'),
    ).toBeInTheDocument()
    await userEvent.click(janela.getByRole('button', { name: 'Concluir' }))
    expect(concluirAvaliacao).toHaveBeenCalledWith('ava-x')
    await waitFor(() =>
      expect(avisarSalvo).toHaveBeenCalledWith('Avaliação concluída. No protótipo, os dados não são gravados.'),
    )
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
  })

  it('a recusa do servidor aparece dentro da janela, que continua aberta', async () => {
    vi.mocked(concluirAvaliacao).mockResolvedValue({ ok: false, mensagem: 'Esta avaliação já está concluída.' })
    render(<AcoesAvaliacao avaliacao={EM_ELABORACAO} faltando={[]} podeEditar ehAdmin />)
    await userEvent.click(screen.getByRole('button', { name: 'Concluir' }))
    const janela = within(await screen.findByRole('alertdialog'))
    await userEvent.click(janela.getByRole('button', { name: 'Concluir' }))
    expect(await janela.findByText('Esta avaliação já está concluída.')).toBeInTheDocument()
    expect(avisarSalvo).not.toHaveBeenCalled()
  })

  it('Reabrir sem justificativa mostra o erro e mantém a janela aberta, sem chamar o servidor', async () => {
    render(<AcoesAvaliacao avaliacao={CONCLUIDA} faltando={[]} podeEditar={false} ehAdmin />)
    await userEvent.click(screen.getByRole('button', { name: 'Reabrir' }))
    const janela = within(await screen.findByRole('alertdialog'))
    expect(janela.getByRole('heading', { name: 'Reabrir avaliação?' })).toBeInTheDocument()
    expect(janela.getByText('A avaliação volta para Em elaboração.')).toBeInTheDocument()
    await userEvent.click(janela.getByRole('button', { name: 'Reabrir' }))
    expect(janela.getByText('Escreva a justificativa da reabertura.')).toBeInTheDocument()
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(reabrirAvaliacao).not.toHaveBeenCalled()
  })

  it('Reabrir com justificativa chama reabrirAvaliacao e mostra o aviso', async () => {
    vi.mocked(reabrirAvaliacao).mockResolvedValue({
      ok: true,
      mensagem: 'Avaliação reaberta. No protótipo, os dados não são gravados.',
    })
    render(<AcoesAvaliacao avaliacao={CONCLUIDA} faltando={[]} podeEditar={false} ehAdmin />)
    await userEvent.click(screen.getByRole('button', { name: 'Reabrir' }))
    const janela = within(await screen.findByRole('alertdialog'))
    await userEvent.type(janela.getByRole('textbox', { name: /Justificativa/ }), 'Nível revisto')
    await userEvent.click(janela.getByRole('button', { name: 'Reabrir' }))
    expect(reabrirAvaliacao).toHaveBeenCalledWith('ava-x', 'Nível revisto')
    await waitFor(() =>
      expect(avisarSalvo).toHaveBeenCalledWith('Avaliação reaberta. No protótipo, os dados não são gravados.'),
    )
  })

  it('sem ser Administrador, só aparece Editar, e só quando pode editar', () => {
    const { rerender } = render(<AcoesAvaliacao avaliacao={EM_ELABORACAO} faltando={[]} podeEditar ehAdmin={false} />)
    expect(screen.getByRole('link', { name: 'Editar' })).toHaveAttribute('href', '/avaliacoes/ava-x/editar')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    rerender(<AcoesAvaliacao avaliacao={CONCLUIDA} faltando={[]} podeEditar={false} ehAdmin={false} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
