import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoPlano } from './conteudo-plano'

const push = vi.fn()

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => {
  limparCookies()
  push.mockReset()
})

const conteudo = (id: string) => ConteudoPlano({ params: Promise.resolve({ id }) })

async function abrir(id: string) {
  return render(<TooltipProvider>{await conteudo(id)}</TooltipProvider>)
}

const painel = (titulo: string) => within(screen.getByRole('region', { name: titulo }))

const linhaDe = (nome: string) => screen.getByText(nome).closest('tr')!

describe('página do plano (parte 4, 5.5)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Plano de ação | Plataforma ELO')
  })

  it('o cabeçalho tem a volta para o escopo, o nome, o cliente e o escopo com link e o status', async () => {
    entrarComo('usr-helena')
    const { container } = await abrir('pla-vertice-licencas')
    expect(screen.getByRole('link', { name: 'Voltar para Regularização documental' })).toHaveAttribute(
      'href',
      '/escopos/esc-vertice-documental',
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Regularização das licenças' })).toBeInTheDocument()
    const cabecalho = within(container.querySelector('header')!)
    expect(cabecalho.getByRole('link', { name: 'Vértice Manutenção' })).toHaveAttribute('href', '/clientes/cli-vertice')
    expect(cabecalho.getByRole('link', { name: 'Regularização documental' })).toHaveAttribute(
      'href',
      '/escopos/esc-vertice-documental',
    )
    expect(cabecalho.getByText('Em andamento')).toBeInTheDocument()
    expect(cabecalho.getByRole('link', { name: /Editar/ })).toHaveAttribute('href', '/planos/pla-vertice-licencas/editar')
  })

  it('os painéis aparecem na ordem da especificação', async () => {
    entrarComo('usr-helena')
    await abrir('pla-vertice-licencas')
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Dados do plano',
      'Atividades',
      'Documentos',
      'Histórico',
    ])
    expect(painel('Documentos').getByText('Nenhum documento ligado a este plano.')).toBeInTheDocument()
  })

  it('as atividades vêm com o resumo, na ordem, com a situação do prazo, o executor e a conclusão (CA-07.2, CA-08)', async () => {
    entrarComo('usr-helena')
    await abrir('pla-vertice-licencas')
    const atividades = painel('Atividades')
    expect(atividades.getByText(/atividades$/).closest('p')).toHaveTextContent('5 atividades · 1 atrasada')
    const nomes = atividades.getAllByRole('row').slice(1).map((r) => r.querySelector('[data-slot="nome-atividade"]')?.textContent)
    expect(nomes).toEqual([
      'Protocolar a renovação da licença de operação',
      'Agendar a vistoria do órgão ambiental',
      'Preparar a auditoria interna dos documentos',
      'Levantar as licenças vencidas',
      'Renovar o alvará da base antiga',
    ])
    const protocolo = linhaDe('Protocolar a renovação da licença de operação')
    expect(within(protocolo).getByText('Atrasada')).toBeInTheDocument()
    expect(protocolo).toHaveAttribute('data-destaque', 'problema')
    const vistoria = linhaDe('Agendar a vistoria do órgão ambiental')
    expect(within(vistoria).getByText('Próxima do prazo')).toBeInTheDocument()
    expect(vistoria).toHaveAttribute('data-destaque', 'atencao')
    expect(vistoria).toHaveTextContent('Executor: Ana Ribeiro (SSMA do cliente)')
    expect(linhaDe('Levantar as licenças vencidas')).toHaveTextContent('Concluída em 20/05/2026')
  })

  it('para a Equipe, a atividade fechada não abre; a aberta abre a edição', async () => {
    entrarComo('usr-rafael')
    await abrir('pla-vertice-licencas')
    expect(linhaDe('Levantar as licenças vencidas')).not.toHaveAttribute('tabindex')
    const protocolo = linhaDe('Protocolar a renovação da licença de operação')
    expect(protocolo).toHaveAttribute('tabindex', '0')
    await userEvent.click(protocolo)
    expect(push).toHaveBeenCalledWith('/atividades/atv-licencas-protocolo/editar')
    expect(painel('Atividades').getByRole('link', { name: /Nova atividade/ })).toHaveAttribute(
      'href',
      '/atividades/nova?plano=pla-vertice-licencas',
    )
  })

  it('para o Administrador, a atividade fechada abre', async () => {
    entrarComo('usr-helena')
    await abrir('pla-vertice-licencas')
    expect(linhaDe('Levantar as licenças vencidas')).toHaveAttribute('tabindex', '0')
  })

  it('plano fechado: a Equipe não edita e Nova atividade fica bloqueada (RN-17, RN-23); o Administrador edita', async () => {
    entrarComo('usr-rafael')
    const { container, unmount } = await abrir('pla-atlantica-fechamento')
    expect(within(container.querySelector('header')!).queryByRole('link', { name: /Editar/ })).not.toBeInTheDocument()
    expect(painel('Atividades').getByRole('button', { name: /Nova atividade/ })).toHaveAttribute('aria-disabled', 'true')
    unmount()
    entrarComo('usr-helena')
    const helena = await abrir('pla-atlantica-fechamento')
    expect(within(helena.container.querySelector('header')!).getByRole('link', { name: /Editar/ })).toBeInTheDocument()
  })

  it('o menu de ações aparece para a Equipe no plano aberto e some no fechado', async () => {
    entrarComo('usr-rafael')
    const { unmount } = await abrir('pla-vertice-licencas')
    expect(screen.getByRole('button', { name: 'Mais ações' })).toBeInTheDocument()
    unmount()
    await abrir('pla-atlantica-fechamento')
    expect(screen.queryByRole('button', { name: 'Mais ações' })).not.toBeInTheDocument()
  })

  it('o plano de desenvolvimento é planejamento e liga a avaliação de origem (CA-05.9, DF-80)', async () => {
    entrarComo('usr-helena')
    const { container } = await abrir('pla-vertice-desenvolvimento')
    expect(within(container.querySelector('header')!).getByText('Planejamento')).toBeInTheDocument()
    const avaliacao = painel('Dados do plano').getByRole('link', { name: 'Avaliação de 15/09/2026' })
    expect(avaliacao).toHaveAttribute('href', '/avaliacoes/ava-vertice-2')
  })

  it('o histórico traz as alterações das atividades, com o nome delas', async () => {
    entrarComo('usr-helena')
    await abrir('pla-vertice-licencas')
    expect(painel('Histórico').getAllByText('Levantar as licenças vencidas · Status da atividade').length).toBeGreaterThan(0)
  })

  it('o Rafael não vê o plano da Montareal; id que não existe dá não encontrado', async () => {
    entrarComo('usr-rafael')
    await expect(conteudo('pla-montareal-estruturas')).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(conteudo('pla-nao-existe')).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
