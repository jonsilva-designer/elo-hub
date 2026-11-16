import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { avisarSalvo } from '@/lib/avisos'
import { obterEscopo } from '@/lib/dados/escopos'
import { reclassificarCriticidade } from '@/lib/escopos/acoes'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { ReclassificarCriticidade } from './reclassificar-criticidade'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)
vi.mock('@/lib/escopos/acoes', () => ({ reclassificarCriticidade: vi.fn() }))
vi.mock('@/lib/avisos', () => ({ avisarSalvo: vi.fn() }))

beforeEach(() => {
  limparCookies()
  vi.mocked(reclassificarCriticidade).mockReset()
  vi.mocked(avisarSalvo).mockReset()
})

async function abrir() {
  entrarComo('usr-helena')
  render(<ReclassificarCriticidade escopo={(await obterEscopo('esc-vertice-documental'))!} />)
  await userEvent.click(screen.getByRole('button', { name: 'Reclassificar' }))
  return within(await screen.findByRole('alertdialog'))
}

describe('ReclassificarCriticidade (F05, CA-05.2)', () => {
  it('abre a janela com a criticidade atual escolhida', async () => {
    const janela = await abrir()
    expect(janela.getByRole('heading', { name: 'Reclassificar a criticidade?' })).toBeInTheDocument()
    expect(janela.getByRole('combobox', { name: /Criticidade/ })).toHaveTextContent('Alta')
  })

  it('sem justificativa, o erro aparece sem chamar o servidor', async () => {
    const janela = await abrir()
    await userEvent.click(janela.getByRole('button', { name: 'Reclassificar' }))
    expect(await janela.findByText('Escreva a justificativa da criticidade.')).toBeInTheDocument()
    expect(reclassificarCriticidade).not.toHaveBeenCalled()
  })

  it('com a justificativa, chama o servidor com a criticidade escolhida, avisa e fecha', async () => {
    vi.mocked(reclassificarCriticidade).mockResolvedValue({
      ok: true,
      mensagem: 'Criticidade reclassificada. No protótipo, os dados não são gravados.',
    })
    const janela = await abrir()
    await userEvent.click(janela.getByRole('combobox', { name: /Criticidade/ }))
    await userEvent.click(await screen.findByRole('option', { name: 'Crítica' }))
    await userEvent.type(janela.getByRole('textbox', { name: /Justificativa/ }), 'Motivo')
    await userEvent.click(janela.getByRole('button', { name: 'Reclassificar' }))
    await waitFor(() =>
      expect(reclassificarCriticidade).toHaveBeenCalledWith('esc-vertice-documental', 'Crítica', 'Motivo'),
    )
    await waitFor(() =>
      expect(avisarSalvo).toHaveBeenCalledWith('Criticidade reclassificada. No protótipo, os dados não são gravados.'),
    )
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
  })
})
