import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { avisarSalvo } from '@/lib/avisos'
import { mudarStatusDemanda, reabrirDemanda } from '@/lib/demandas/acoes'
import type { AcaoDemanda } from '@/lib/demandas/regras'
import { AcoesDemanda } from './acoes-demanda'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }) }))
vi.mock('@/lib/demandas/acoes', () => ({ mudarStatusDemanda: vi.fn(), reabrirDemanda: vi.fn() }))
vi.mock('@/lib/avisos', () => ({ avisarSalvo: vi.fn() }))

const SUCESSO = { ok: true, mensagem: 'Feito. No protótipo, os dados não são gravados.' } as const

beforeEach(() => {
  vi.mocked(mudarStatusDemanda).mockReset()
  vi.mocked(reabrirDemanda).mockReset()
  vi.mocked(avisarSalvo).mockReset()
})

function montar(acoes: AcaoDemanda[], falta: string[] = []) {
  return render(
    <TooltipProvider>
      <AcoesDemanda numero="ELO-2026-0010" acoes={acoes} falta={falta} />
    </TooltipProvider>,
  )
}

async function escolher(item: string) {
  await userEvent.click(screen.getByRole('button', { name: /Mudar status/ }))
  await userEvent.click(await screen.findByRole('menuitem', { name: item }))
  return within(await screen.findByRole('alertdialog'))
}

describe('AcoesDemanda (parte 5, 5.10)', () => {
  it('o menu mostra só as mudanças que valem; sem nenhuma, não aparece', async () => {
    const { unmount } = montar(['iniciar-triagem', 'iniciar-atendimento', 'encerrar-sem-resolver'])
    await userEvent.click(screen.getByRole('button', { name: /Mudar status/ }))
    expect((await screen.findAllByRole('menuitem')).map((i) => i.textContent)).toEqual([
      'Iniciar triagem',
      'Iniciar atendimento',
      'Encerrar sem resolver',
    ])
    unmount()
    montar([])
    expect(screen.queryByRole('button', { name: /Mudar status/ })).not.toBeInTheDocument()
  })

  it('iniciar o atendimento sem a triagem completa fica bloqueado, com o que falta e o link para editar (CA-09.2)', async () => {
    montar(['iniciar-atendimento'], ['Categoria', 'Criticidade'])
    const janela = await escolher('Iniciar atendimento')
    expect(janela.getByText('Falta para iniciar o atendimento: Categoria, Criticidade.')).toBeInTheDocument()
    expect(janela.getByRole('link', { name: 'Editar a triagem' })).toHaveAttribute('href', '/central/ELO-2026-0010/editar')
    expect(mudarStatusDemanda).not.toHaveBeenCalled()
  })

  it('resolver pede a solução antes de chamar o servidor (CA-09.3)', async () => {
    vi.mocked(mudarStatusDemanda).mockResolvedValue(SUCESSO)
    montar(['resolver'])
    const janela = await escolher('Resolver')
    await userEvent.click(janela.getByRole('button', { name: 'Resolver' }))
    expect(janela.getByText('Escreva a solução.')).toBeInTheDocument()
    expect(mudarStatusDemanda).not.toHaveBeenCalled()
    await userEvent.type(janela.getByRole('textbox', { name: /Solução/ }), 'Certidões renovadas.')
    await userEvent.click(janela.getByRole('button', { name: 'Resolver' }))
    await waitFor(() => expect(mudarStatusDemanda).toHaveBeenCalledWith('ELO-2026-0010', 'resolver', 'Certidões renovadas.'))
    expect(avisarSalvo).toHaveBeenCalledWith(SUCESSO.mensagem)
  })

  it('reabrir pede o status de volta e a justificativa (RN-22)', async () => {
    vi.mocked(reabrirDemanda).mockResolvedValue(SUCESSO)
    montar(['reabrir'])
    const janela = await escolher('Reabrir')
    await userEvent.click(janela.getByRole('radio', { name: 'Nova' }))
    await userEvent.type(janela.getByRole('textbox', { name: /Justificativa/ }), 'Não era duplicada.')
    await userEvent.click(janela.getByRole('button', { name: 'Reabrir' }))
    await waitFor(() => expect(reabrirDemanda).toHaveBeenCalledWith('ELO-2026-0010', 'Nova', 'Não era duplicada.'))
  })
})
