import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoCliente } from './conteudo-cliente'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(window.location.search),
}))

beforeEach(() => {
  limparCookies()
  sessionStorage.clear()
  window.history.replaceState(null, '', '/')
})

const conteudo = (id: string, busca: Record<string, string> = {}) =>
  ConteudoCliente({ params: Promise.resolve({ id }), searchParams: Promise.resolve(busca) })

async function abrir(id: string, busca: Record<string, string> = {}) {
  return render(<TooltipProvider>{await conteudo(id, busca)}</TooltipProvider>)
}

const abas = () => screen.getAllByRole('tab').map((t) => t.textContent)

describe('página do cliente (parte 2, 5.6)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Cliente | Plataforma ELO')
  })

  it('a Helena vê o cabeçalho, Editar, a Visão Executiva bloqueada e as 7 abas', async () => {
    entrarComo('usr-helena')
    const { container } = await abrir('cli-vertice')
    expect(screen.getByRole('heading', { level: 1, name: 'Vértice Manutenção' })).toBeInTheDocument()
    const cabecalho = container.querySelector('header')!
    expect(cabecalho).toHaveTextContent('Vértice Manutenção Industrial Ltda')
    expect(cabecalho).toHaveTextContent('21.473.509/0001-21')
    expect(within(cabecalho).getByText('Ativo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Editar' })).toHaveAttribute('href', '/clientes/cli-vertice/editar')
    expect(screen.getByRole('button', { name: 'Visão Executiva' })).toHaveAttribute('aria-disabled', 'true')
    expect(abas()).toEqual(['Resumo', 'Maturidade', 'Contratos', 'Escopos', 'Demandas', 'Documentos', 'Histórico'])
  })

  it('o Resumo mostra os dados, "Não informado" nos vazios, a maturidade atual e a autoria (CA-17.1)', async () => {
    entrarComo('usr-helena')
    const { container } = await abrir('cli-vertice')
    expect(screen.getByText('(22) 2765-4310')).toBeInTheDocument()
    expect(screen.getAllByText('Não informado').length).toBeGreaterThan(0)
    const atual = screen.getByRole('heading', { name: 'Maturidade atual' }).closest('section')!
    expect(atual).toHaveTextContent('Em estruturação')
    expect(atual).toHaveTextContent('Pronto com condições')
    expect(atual).toHaveTextContent('15/09/2026')
    expect(within(atual).getByRole('link', { name: 'Ver maturidade' })).toHaveAttribute(
      'href',
      '/clientes/cli-vertice?aba=maturidade',
    )
    expect(container).toHaveTextContent(
      'Criado por Helena Prado em 02/02/2026 · Última alteração por Helena Prado em 20/09/2026',
    )
  })

  it('a aba Maturidade compara a inicial e a atual (CA-20.4, critério 13)', async () => {
    entrarComo('usr-helena')
    await abrir('cli-vertice', { aba: 'maturidade' })
    const comparacao = screen.getByRole('heading', { name: 'Inicial e atual' }).closest('section')!
    const cabecalhos = within(comparacao).getAllByRole('columnheader').map((th) => th.textContent)
    expect(cabecalhos).toEqual(['Dimensão', 'Inicial · 10/03/2026', 'Atual · 15/09/2026'])
    const linha = within(comparacao).getByRole('row', { name: /Integridade e informação/ })
    const [, inicial, atual] = within(linha).getAllByRole('cell')
    expect(inicial).toHaveTextContent('Não avaliada')
    expect(atual).toHaveTextContent('Básica')
    const nomes = within(comparacao).getAllByRole('row').slice(1, 3).map((r) => within(r).getAllByRole('cell')[0].textContent)
    expect(nomes).toEqual(['Maturidade geral', 'Prontidão'])
  })

  it('a lista de avaliações começa pela mais recente, com Nova avaliação', async () => {
    entrarComo('usr-helena')
    await abrir('cli-vertice', { aba: 'maturidade' })
    const lista = screen.getByRole('heading', { name: 'Avaliações' }).closest('section')!
    const datas = within(within(lista).getAllByRole('rowgroup')[1])
      .getAllByRole('row')
      .map((r) => within(r).getAllByRole('cell')[0].textContent)
    expect(datas).toEqual(['05/11/2026', '15/09/2026', '10/03/2026'])
    expect(within(lista).getByRole('link', { name: 'Nova avaliação' })).toHaveAttribute(
      'href',
      '/avaliacoes/nova?cliente=cli-vertice',
    )
  })

  it('com uma só avaliação, a inicial e a atual têm a mesma data', async () => {
    entrarComo('usr-helena')
    await abrir('cli-atlantica', { aba: 'maturidade' })
    const comparacao = screen.getByRole('heading', { name: 'Inicial e atual' }).closest('section')!
    expect(within(comparacao).getAllByRole('columnheader').map((th) => th.textContent)).toEqual([
      'Dimensão',
      'Inicial · 20/08/2026',
      'Atual · 20/08/2026',
    ])
  })

  it('sem avaliação, a Maturidade mostra os dois vazios e a ação de começar', async () => {
    entrarComo('usr-rafael')
    await abrir('cli-rede-norte', { aba: 'maturidade' })
    expect(screen.getByText('Nenhuma avaliação concluída.')).toBeInTheDocument()
    expect(screen.getByText('A comparação aparece quando a primeira for concluída.')).toBeInTheDocument()
    expect(screen.getByText('Nenhuma avaliação deste cliente.')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Nova avaliação' }).length).toBeGreaterThan(0)
  })

  it('no cliente Inativo, Nova avaliação fica bloqueada', async () => {
    entrarComo('usr-helena')
    await abrir('cli-fortec', { aba: 'maturidade' })
    for (const botao of screen.getAllByRole('button', { name: 'Nova avaliação' })) {
      expect(botao).toHaveAttribute('aria-disabled', 'true')
    }
    expect(screen.queryByRole('link', { name: 'Nova avaliação' })).not.toBeInTheDocument()
  })

  it('as abas de contratos, escopos, demandas e documentos mostram o vazio da tela', async () => {
    entrarComo('usr-helena')
    for (const [aba, texto] of [
      ['contratos', 'Nenhum contrato deste cliente.'],
      ['escopos', 'Nenhum escopo deste cliente.'],
      ['demandas', 'Nenhuma demanda deste cliente.'],
      ['documentos', 'Nenhum documento deste cliente.'],
    ]) {
      const { unmount } = await abrir('cli-vertice', { aba })
      expect(screen.getByText(texto)).toBeInTheDocument()
      unmount()
    }
  })

  it('a aba Histórico lista as alterações do cliente', async () => {
    entrarComo('usr-helena')
    await abrir('cli-vertice', { aba: 'historico' })
    const historico = screen.getByRole('heading', { name: 'Histórico' }).closest('section')!
    expect(historico).toHaveTextContent('De Prospect para Ativo')
  })

  it('aba desconhecida no endereço abre o Resumo', async () => {
    entrarComo('usr-helena')
    await abrir('cli-vertice', { aba: 'xyz' })
    expect(screen.getByRole('tab', { name: 'Resumo' })).toHaveAttribute('aria-selected', 'true')
  })

  it('trocar de aba põe a aba no endereço, e o Resumo a tira', async () => {
    entrarComo('usr-helena')
    window.history.replaceState(null, '', '/clientes/cli-vertice')
    await abrir('cli-vertice')
    await userEvent.click(screen.getByRole('tab', { name: 'Maturidade' }))
    expect(window.location.pathname + window.location.search).toBe('/clientes/cli-vertice?aba=maturidade')
    await userEvent.click(screen.getByRole('tab', { name: 'Resumo' }))
    expect(window.location.pathname + window.location.search).toBe('/clientes/cli-vertice')
  })

  it('o cadastro da ELO tem 4 abas, a nota e nada de maturidade nem Visão Executiva (DF-40)', async () => {
    entrarComo('usr-helena')
    await abrir('cli-elo', { aba: 'maturidade' })
    expect(abas()).toEqual(['Resumo', 'Demandas', 'Documentos', 'Histórico'])
    expect(screen.getByRole('tab', { name: 'Resumo' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Cadastro da própria ELO, usado nas demandas institucionais')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Maturidade atual' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Visão Executiva' })).not.toBeInTheDocument()
  })

  it('o Rafael não vê Editar e cria avaliação na Vértice', async () => {
    entrarComo('usr-rafael')
    await abrir('cli-vertice', { aba: 'maturidade' })
    expect(screen.queryByRole('link', { name: 'Editar' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Visão Executiva' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Nova avaliação' })[0]).toHaveAttribute(
      'href',
      '/avaliacoes/nova?cliente=cli-vertice',
    )
  })

  it('o menu de ações aparece só para o Administrador e fora do cadastro da ELO (critério 11)', async () => {
    entrarComo('usr-helena')
    const { unmount } = await abrir('cli-vertice')
    expect(screen.getByRole('button', { name: 'Mais ações' })).toBeInTheDocument()
    unmount()
    await abrir('cli-elo')
    expect(screen.queryByRole('button', { name: 'Mais ações' })).not.toBeInTheDocument()
  })

  it('a Equipe não vê o menu de ações', async () => {
    entrarComo('usr-rafael')
    await abrir('cli-vertice')
    expect(screen.queryByRole('button', { name: 'Mais ações' })).not.toBeInTheDocument()
  })

  it('fora do vínculo ou com id que não existe, não encontrado (critério 9)', async () => {
    entrarComo('usr-rafael')
    await expect(conteudo('cli-montareal')).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(conteudo('cli-nao-existe')).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('a volta para Clientes recupera os filtros da lista', async () => {
    entrarComo('usr-helena')
    sessionStorage.setItem('elo:filtros-clientes', 'status=Inativo')
    await abrir('cli-fortec')
    expect(screen.getByRole('link', { name: /Voltar para Clientes/ })).toHaveAttribute('href', '/clientes?status=Inativo')
  })
})
