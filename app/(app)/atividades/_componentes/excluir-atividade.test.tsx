import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { excluirAtividade } from '@/lib/atividades/acoes'
import { ExcluirAtividade } from './excluir-atividade'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }) }))
vi.mock('@/lib/atividades/acoes', () => ({ excluirAtividade: vi.fn() }))
vi.mock('@/lib/avisos', () => ({ avisarSalvo: vi.fn() }))

beforeEach(() => {
  push.mockReset()
  sessionStorage.clear()
  vi.mocked(excluirAtividade).mockResolvedValue({ ok: true, mensagem: 'Atividade excluída.' })
})

async function excluir() {
  await userEvent.click(screen.getByRole('button', { name: 'Excluir atividade' }))
  const janela = within(await screen.findByRole('alertdialog'))
  await userEvent.type(janela.getByRole('textbox', { name: /Justificativa/ }), 'Duplicada.')
  await userEvent.click(janela.getByRole('button', { name: 'Excluir' }))
}

// Revisão do código (20/11/2026): quem excluiu a partir de Minhas atividades volta para a lista, com os filtros.
describe('ExcluirAtividade', () => {
  it('aberta a partir de Minhas atividades, volta para a lista com os filtros guardados', async () => {
    sessionStorage.setItem('elo:filtros-atividades', 'status=Em+andamento')
    render(<ExcluirAtividade atividadeId="atv-1" planoId="pla-1" origem="minhas-atividades" />)
    await excluir()
    await waitFor(() => expect(push).toHaveBeenCalledWith('/minhas-atividades?status=Em+andamento'))
  })

  it('aberta pelo plano, volta ao plano', async () => {
    render(<ExcluirAtividade atividadeId="atv-1" planoId="pla-1" origem={null} />)
    await excluir()
    await waitFor(() => expect(push).toHaveBeenCalledWith('/planos/pla-1'))
  })
})
