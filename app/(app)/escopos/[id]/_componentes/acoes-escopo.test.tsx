import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { avisarSalvo } from '@/lib/avisos'
import { obterEscopo } from '@/lib/dados/escopos'
import type { EscopoDetalhado, ItemQueImpede } from '@/lib/dados/tipos'
import { cancelarEscopo, concluirEscopo, excluirEscopo, moverEscopo, reabrirEscopo } from '@/lib/escopos/acoes'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { AcoesEscopo } from './acoes-escopo'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
}))
vi.mock('@/lib/escopos/acoes', () => ({
  concluirEscopo: vi.fn(),
  cancelarEscopo: vi.fn(),
  reabrirEscopo: vi.fn(),
  moverEscopo: vi.fn(),
  excluirEscopo: vi.fn(),
}))
vi.mock('@/lib/avisos', () => ({ avisarSalvo: vi.fn() }))

const ETAPA_EM_ANDAMENTO: ItemQueImpede = {
  tipo: 'Etapa da Jornada',
  descricao: 'Estruturar',
  status: 'Em andamento',
  responsavel: 'Rafael Souza',
  href: '/escopos/esc-vertice-documental',
}

const DESTINOS = [{ valor: 'ctr-vertice-mobilizacao', codigo: 'CT-2026-044', contratante: 'FMC Logística' }]

const SUCESSO = { ok: true, mensagem: 'Feito. No protótipo, os dados não são gravados.' } as const

beforeEach(() => {
  limparCookies()
  push.mockReset()
  for (const f of [concluirEscopo, cancelarEscopo, reabrirEscopo, moverEscopo, excluirEscopo]) vi.mocked(f).mockReset()
  vi.mocked(avisarSalvo).mockReset()
})

async function escopo(id: string): Promise<EscopoDetalhado> {
  entrarComo('usr-helena')
  return (await obterEscopo(id))!
}

function montar(
  e: EscopoDetalhado,
  { impedimentos = [], contratosDestino = [], podeExcluir = false }: Partial<Parameters<typeof AcoesEscopo>[0]> = {},
) {
  return render(
    <TooltipProvider>
      <AcoesEscopo escopo={e} impedimentos={impedimentos} contratosDestino={contratosDestino} podeExcluir={podeExcluir} />
    </TooltipProvider>,
  )
}

async function abrirMenu() {
  await userEvent.click(screen.getByRole('button', { name: 'Mais ações' }))
  return within(await screen.findByRole('menu'))
}

async function escolher(item: string) {
  const menu = await abrirMenu()
  await userEvent.click(menu.getByRole('menuitem', { name: item }))
  return within(await screen.findByRole('alertdialog'))
}

describe('AcoesEscopo (parte 3, 5.9)', () => {
  it('o escopo aberto tem Concluir e Cancelar, sem Reabrir; o fechado tem Reabrir', async () => {
    const { unmount } = montar(await escopo('esc-vertice-qualidade'))
    let menu = await abrirMenu()
    expect(menu.getAllByRole('menuitem').map((i) => i.textContent)).toEqual(['Concluir', 'Cancelar'])
    unmount()
    montar(await escopo('esc-atlantica-2025'))
    menu = await abrirMenu()
    expect(menu.getAllByRole('menuitem').map((i) => i.textContent)).toEqual(['Reabrir'])
  })

  it('com etapa Em andamento, Concluir abre a janela bloqueada com a etapa e só Fechar (DF-59)', async () => {
    montar(await escopo('esc-vertice-documental'), { impedimentos: [ETAPA_EM_ANDAMENTO] })
    const janela = await escolher('Concluir')
    expect(janela.getByRole('heading', { name: 'Não é possível concluir' })).toBeInTheDocument()
    expect(janela.getByText('Não é possível concluir este escopo enquanto houver etapas Em andamento.')).toBeInTheDocument()
    expect(janela.getByRole('link', { name: /Estruturar/ })).toHaveAttribute('href', '/escopos/esc-vertice-documental')
    expect(janela.getAllByRole('button').map((b) => b.textContent)).toEqual(['Fechar'])
  })

  it('Concluir sem a data efetiva mostra o erro sem chamar o servidor; com ela, conclui', async () => {
    vi.mocked(concluirEscopo).mockResolvedValue(SUCESSO)
    montar(await escopo('esc-vertice-qualidade'))
    const janela = await escolher('Concluir')
    expect(janela.getByRole('heading', { name: 'Concluir escopo?' })).toBeInTheDocument()
    await userEvent.click(janela.getByRole('button', { name: 'Concluir' }))
    expect(await janela.findByText('Informe a data efetiva de conclusão.')).toBeInTheDocument()
    expect(concluirEscopo).not.toHaveBeenCalled()
    await userEvent.type(janela.getByRole('textbox', { name: /Data efetiva de conclusão/ }), '15/11/2026')
    await userEvent.click(janela.getByRole('button', { name: 'Concluir' }))
    await waitFor(() => expect(concluirEscopo).toHaveBeenCalledWith('esc-vertice-qualidade', '2026-11-15'))
    await waitFor(() => expect(avisarSalvo).toHaveBeenCalledWith(SUCESSO.mensagem))
  })

  it('Cancelar confirma com o botão "Cancelar escopo"', async () => {
    vi.mocked(cancelarEscopo).mockResolvedValue(SUCESSO)
    montar(await escopo('esc-vertice-qualidade'))
    const janela = await escolher('Cancelar')
    expect(janela.getByRole('heading', { name: 'Cancelar escopo?' })).toBeInTheDocument()
    expect(janela.getByText('O escopo sai do andamento sem ser concluído.')).toBeInTheDocument()
    await userEvent.click(janela.getByRole('button', { name: 'Cancelar escopo' }))
    await waitFor(() => expect(cancelarEscopo).toHaveBeenCalledWith('esc-vertice-qualidade'))
  })

  it('Reabrir com o contrato fechado abre a janela bloqueada (RN-23)', async () => {
    montar({ ...(await escopo('esc-atlantica-2025')), statusContrato: 'Encerrado' })
    const janela = await escolher('Reabrir')
    expect(janela.getByRole('heading', { name: 'Não é possível reabrir' })).toBeInTheDocument()
    expect(janela.getByText('O contrato está fechado. Reabra o contrato antes.')).toBeInTheDocument()
    expect(janela.getAllByRole('button').map((b) => b.textContent)).toEqual(['Fechar'])
  })

  it('Reabrir pede a justificativa e envia o status de volta, Planejado por padrão', async () => {
    vi.mocked(reabrirEscopo).mockResolvedValue(SUCESSO)
    montar(await escopo('esc-atlantica-2025'))
    const janela = await escolher('Reabrir')
    expect(janela.getByRole('heading', { name: 'Reabrir escopo?' })).toBeInTheDocument()
    expect(janela.getByRole('radio', { name: 'Planejado' })).toBeChecked()
    await userEvent.click(janela.getByRole('button', { name: 'Reabrir' }))
    expect(await janela.findByText('Escreva a justificativa da reabertura.')).toBeInTheDocument()
    expect(reabrirEscopo).not.toHaveBeenCalled()
    await userEvent.click(janela.getByRole('radio', { name: 'Em andamento' }))
    await userEvent.type(janela.getByRole('textbox', { name: /Justificativa/ }), 'Novo pedido')
    await userEvent.click(janela.getByRole('button', { name: 'Reabrir' }))
    await waitFor(() => expect(reabrirEscopo).toHaveBeenCalledWith('esc-atlantica-2025', 'Em andamento', 'Novo pedido'))
  })

  it('sem contratos de destino, não há Mover; com eles, move para o escolhido (DF-45)', async () => {
    vi.mocked(moverEscopo).mockResolvedValue(SUCESSO)
    const qualidade = await escopo('esc-vertice-qualidade')
    const { unmount } = montar(qualidade)
    const menu = await abrirMenu()
    expect(menu.queryByRole('menuitem', { name: 'Mover para outro contrato' })).not.toBeInTheDocument()
    unmount()
    montar(qualidade, { contratosDestino: DESTINOS })
    const janela = await escolher('Mover para outro contrato')
    expect(janela.getByRole('heading', { name: 'Mover escopo?' })).toBeInTheDocument()
    expect(
      janela.getByText('Planos, atividades, Jornada, documentos e demandas vão junto para o contrato escolhido.'),
    ).toBeInTheDocument()
    await userEvent.click(janela.getByRole('button', { name: 'Mover' }))
    expect(await janela.findByText('Escolha outro contrato aberto do mesmo cliente.')).toBeInTheDocument()
    expect(moverEscopo).not.toHaveBeenCalled()
    await userEvent.click(janela.getByRole('combobox', { name: /Contrato de destino/ }))
    const opcao = await screen.findByRole('option', { name: /CT-2026-044/ })
    expect(opcao).toHaveTextContent('CT-2026-044 · FMC Logística')
    expect(within(opcao).getByText('CT-2026-044')).toHaveClass('font-mono')
    await userEvent.click(opcao)
    await userEvent.click(janela.getByRole('button', { name: 'Mover' }))
    await waitFor(() => expect(moverEscopo).toHaveBeenCalledWith('esc-vertice-qualidade', 'ctr-vertice-mobilizacao'))
  })

  it('Excluir com sucesso volta para a lista de escopos', async () => {
    vi.mocked(excluirEscopo).mockResolvedValue(SUCESSO)
    montar(await escopo('esc-vertice-qualidade'), { podeExcluir: true })
    const janela = await escolher('Excluir')
    expect(janela.getByRole('heading', { name: 'Excluir escopo?' })).toBeInTheDocument()
    expect(janela.getByText('A exclusão é definitiva. Escreva o motivo.')).toBeInTheDocument()
    await userEvent.type(janela.getByRole('textbox', { name: /Justificativa/ }), 'Duplicado')
    await userEvent.click(janela.getByRole('button', { name: 'Excluir' }))
    await waitFor(() => expect(push).toHaveBeenCalledWith('/escopos'))
    expect(excluirEscopo).toHaveBeenCalledWith('esc-vertice-qualidade', 'Duplicado')
  })

  it('a recusa do servidor aparece dentro da janela', async () => {
    vi.mocked(cancelarEscopo).mockResolvedValue({ ok: false, mensagem: 'Só um escopo aberto pode ser cancelado.' })
    montar(await escopo('esc-vertice-qualidade'))
    const janela = await escolher('Cancelar')
    await userEvent.click(janela.getByRole('button', { name: 'Cancelar escopo' }))
    expect(await janela.findByText('Só um escopo aberto pode ser cancelado.')).toBeInTheDocument()
  })
})
