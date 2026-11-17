import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { avisarSalvo } from '@/lib/avisos'
import { obterPlano } from '@/lib/dados/planos'
import type { ItemQueImpede, Perfil, PlanoDetalhado } from '@/lib/dados/tipos'
import { cancelarPlano, concluirPlano, excluirPlano, reabrirPlano } from '@/lib/planos/acoes'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { AcoesPlano } from './acoes-plano'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
}))
vi.mock('@/lib/planos/acoes', () => ({
  concluirPlano: vi.fn(),
  cancelarPlano: vi.fn(),
  reabrirPlano: vi.fn(),
  excluirPlano: vi.fn(),
}))
vi.mock('@/lib/avisos', () => ({ avisarSalvo: vi.fn() }))

const ATIVIDADE_ABERTA: ItemQueImpede = {
  tipo: 'Atividade',
  descricao: 'Protocolar a renovação da licença de operação',
  status: 'Em andamento',
  responsavel: 'Rafael Souza',
  href: '/planos/pla-vertice-licencas',
}

const SUCESSO = { ok: true, mensagem: 'Feito. No protótipo, os dados não são gravados.' } as const

beforeEach(() => {
  limparCookies()
  push.mockReset()
  for (const f of [concluirPlano, cancelarPlano, reabrirPlano, excluirPlano]) vi.mocked(f).mockReset()
  vi.mocked(avisarSalvo).mockReset()
})

async function plano(id: string): Promise<PlanoDetalhado> {
  entrarComo('usr-helena')
  return (await obterPlano(id))!
}

function montar(
  p: PlanoDetalhado,
  { perfil = 'Administrador', impedimentos = [], podeExcluir = false }: { perfil?: Perfil; impedimentos?: ItemQueImpede[]; podeExcluir?: boolean } = {},
) {
  return render(
    <TooltipProvider>
      <AcoesPlano plano={p} perfil={perfil} impedimentos={impedimentos} podeExcluir={podeExcluir} />
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

describe('AcoesPlano (parte 4, 5.5)', () => {
  it('a Equipe no plano aberto tem Concluir e Cancelar; no fechado, nenhum menu (RN-17)', async () => {
    const { unmount } = montar(await plano('pla-vertice-licencas'), { perfil: 'Equipe' })
    const menu = await abrirMenu()
    expect(menu.getAllByRole('menuitem').map((i) => i.textContent)).toEqual(['Concluir', 'Cancelar'])
    unmount()
    montar(await plano('pla-rede-norte-implantacao'), { perfil: 'Equipe' })
    expect(screen.queryByRole('button', { name: 'Mais ações' })).not.toBeInTheDocument()
  })

  it('o Administrador tem Excluir no plano sem atividades e Reabrir no fechado', async () => {
    const { unmount } = montar(await plano('pla-atlantica-indicadores'), { podeExcluir: true })
    let menu = await abrirMenu()
    expect(menu.getAllByRole('menuitem').map((i) => i.textContent)).toEqual(['Concluir', 'Cancelar', 'Excluir'])
    unmount()
    montar(await plano('pla-rede-norte-implantacao'))
    menu = await abrirMenu()
    expect(menu.getAllByRole('menuitem').map((i) => i.textContent)).toEqual(['Reabrir'])
  })

  it('com atividade aberta, Concluir abre a janela bloqueada com a lista e só Fechar (RN-18)', async () => {
    montar(await plano('pla-vertice-licencas'), { perfil: 'Equipe', impedimentos: [ATIVIDADE_ABERTA] })
    const janela = await escolher('Concluir')
    expect(janela.getByText('Não é possível concluir este plano enquanto houver atividades abertas.')).toBeInTheDocument()
    expect(janela.getByRole('link', { name: /Protocolar a renovação/ })).toHaveAttribute('href', '/planos/pla-vertice-licencas')
    expect(janela.getAllByRole('button').map((b) => b.textContent)).toEqual(['Fechar'])
  })

  it('sem atividade aberta, concluir chama o servidor e avisa', async () => {
    vi.mocked(concluirPlano).mockResolvedValue(SUCESSO)
    montar(await plano('pla-atlantica-indicadores'), { perfil: 'Equipe' })
    const janela = await escolher('Concluir')
    await userEvent.click(janela.getByRole('button', { name: 'Concluir' }))
    await waitFor(() => expect(concluirPlano).toHaveBeenCalledWith('pla-atlantica-indicadores'))
    expect(avisarSalvo).toHaveBeenCalledWith(SUCESSO.mensagem)
  })

  it('Reabrir com o escopo fechado fica bloqueado (RN-23)', async () => {
    montar(await plano('pla-atlantica-fechamento'))
    const janela = await escolher('Reabrir')
    expect(janela.getByText('O escopo está fechado. Reabra o escopo antes.')).toBeInTheDocument()
    expect(janela.getAllByRole('button').map((b) => b.textContent)).toEqual(['Fechar'])
  })

  it('Reabrir sem justificativa mostra o erro sem chamar o servidor; com ela, reabre no status escolhido', async () => {
    vi.mocked(reabrirPlano).mockResolvedValue(SUCESSO)
    montar(await plano('pla-rede-norte-implantacao'))
    const janela = await escolher('Reabrir')
    await userEvent.click(janela.getByRole('button', { name: 'Reabrir' }))
    expect(janela.getByText('Escreva a justificativa da reabertura.')).toBeInTheDocument()
    expect(reabrirPlano).not.toHaveBeenCalled()
    await userEvent.click(janela.getByRole('radio', { name: 'Em andamento' }))
    await userEvent.type(janela.getByRole('textbox', { name: /Justificativa/ }), 'O aditivo foi assinado.')
    await userEvent.click(janela.getByRole('button', { name: 'Reabrir' }))
    await waitFor(() =>
      expect(reabrirPlano).toHaveBeenCalledWith('pla-rede-norte-implantacao', 'Em andamento', 'O aditivo foi assinado.'),
    )
  })

  it('Excluir pede a justificativa e volta ao escopo', async () => {
    vi.mocked(excluirPlano).mockResolvedValue(SUCESSO)
    montar(await plano('pla-atlantica-indicadores'), { podeExcluir: true })
    const janela = await escolher('Excluir')
    await userEvent.type(janela.getByRole('textbox', { name: /Justificativa/ }), 'Criado por engano.')
    await userEvent.click(janela.getByRole('button', { name: 'Excluir' }))
    await waitFor(() => expect(excluirPlano).toHaveBeenCalledWith('pla-atlantica-indicadores', 'Criado por engano.'))
    expect(push).toHaveBeenCalledWith('/escopos/esc-atlantica-2026')
  })
})
