import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoCliente } from './conteudo-cliente'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(window.location.search),
}))

beforeEach(() => {
  push.mockReset()
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

  it('a Helena vê o cabeçalho, Editar, o link da Visão Executiva e as 7 abas', async () => {
    entrarComo('usr-helena')
    const { container } = await abrir('cli-vertice')
    expect(screen.getByRole('heading', { level: 1, name: 'Vértice Manutenção' })).toBeInTheDocument()
    const cabecalho = container.querySelector('header')!
    expect(cabecalho).toHaveTextContent('Vértice Manutenção Industrial Ltda')
    expect(cabecalho).toHaveTextContent('21.473.509/0001-21')
    expect(within(cabecalho).getByText('Ativo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Editar' })).toHaveAttribute('href', '/clientes/cli-vertice/editar')
    expect(screen.getByRole('link', { name: 'Visão Executiva' })).toHaveAttribute('href', '/clientes/cli-vertice/visao-executiva')
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

  it('a aba Demandas lista as demandas do cliente, com a vencida marcada (parte 5, 5.12)', async () => {
    entrarComo('usr-rafael')
    await abrir('cli-vertice', { aba: 'demandas' })
    // Num painel, como as outras abas: com fundo e título, e não a tabela solta.
    const painel = within(screen.getByRole('region', { name: 'Demandas' }))
    expect(painel.getByText('ELO-2026-0003')).toBeInTheDocument()
    const linha = screen.getByText('ELO-2026-0003').closest('tr')!
    expect(linha).toHaveTextContent('Certidões vencidas antes da medição')
    expect(within(linha).getByText('Vencida')).toBeInTheDocument()
    expect(screen.getByText('ELO-2026-0010')).toBeInTheDocument()
  })

  it('o cadastro da ELO mostra a demanda institucional; sem demanda, o vazio (DF-40)', async () => {
    entrarComo('usr-helena')
    const { unmount } = await abrir('cli-elo', { aba: 'demandas' })
    expect(screen.getByText('ELO-2026-0007')).toBeInTheDocument()
    unmount()
    await abrir('cli-limpar', { aba: 'demandas' })
    expect(screen.getByText('Nenhuma demanda deste cliente.')).toBeInTheDocument()
  })

  it('a aba de documentos mostra os do cliente, sem o inativo, e inclui com o cliente (CA-12.3, CA-18.2)', async () => {
    entrarComo('usr-rafael')
    const { unmount } = await abrir('cli-atlantica', { aba: 'documentos' })
    const documentos = within(screen.getByRole('region', { name: 'Documentos' }))
    expect(documentos.getByText('Termo complementar do ciclo 2025')).toBeInTheDocument()
    expect(documentos.queryByText('Ata da reunião de abertura do ciclo 2026')).not.toBeInTheDocument()
    expect(documentos.getByRole('link', { name: 'Incluir documento' })).toHaveAttribute('href', '/documentos/novo?cliente=cli-atlantica')
    unmount()
    await abrir('cli-rede-norte', { aba: 'documentos' })
    expect(screen.getByText('Nenhum documento deste cliente.')).toBeInTheDocument()
  })

  it('a aba Contratos lista os contratos do cliente, com Novo contrato (parte 3, 5.11)', async () => {
    entrarComo('usr-helena')
    await abrir('cli-vertice', { aba: 'contratos' })
    const contratos = within(screen.getByRole('region', { name: 'Contratos' }))
    expect(contratos.getAllByRole('row')).toHaveLength(4)
    const proposta = contratos.getByText('PR-2026-052').closest('tr')!
    expect(proposta).toHaveTextContent('Planejamento')
    expect(proposta).toHaveTextContent('Proposta')
    expect(contratos.getByRole('link', { name: 'Novo contrato' })).toHaveAttribute('href', '/contratos/novo?cliente=cli-vertice')
  })

  it('a linha da aba Contratos abre o contrato', async () => {
    entrarComo('usr-helena')
    await abrir('cli-vertice', { aba: 'contratos' })
    await userEvent.click(screen.getByText('PR-2026-052'))
    expect(push).toHaveBeenCalledWith('/contratos/ctr-vertice-proposta')
  })

  it('no cliente Inativo, Novo contrato fica bloqueado; sem contratos, o vazio', async () => {
    entrarComo('usr-helena')
    const { unmount } = await abrir('cli-fortec', { aba: 'contratos' })
    expect(screen.getByRole('button', { name: 'Novo contrato' })).toHaveAttribute('aria-disabled', 'true')
    unmount()
    await abrir('cli-limpar', { aba: 'contratos' })
    expect(screen.getByText('Nenhum contrato deste cliente.')).toBeInTheDocument()
  })

  it('a aba Escopos lista os escopos do cliente na ordem da lista, sem ação (parte 3, 5.11)', async () => {
    entrarComo('usr-helena')
    await abrir('cli-vertice', { aba: 'escopos' })
    const painel = screen.getByRole('region', { name: 'Escopos' })
    const escopos = within(painel)
    const linhas = escopos.getAllByRole('row').slice(1)
    expect(linhas).toHaveLength(4)
    expect(linhas[0]).toHaveTextContent('Mobilização de equipe')
    expect(within(linhas[0]).getByText('CT-2026-044')).toHaveClass('font-mono')
    expect(linhas[0]).toHaveTextContent('Implementar · 0 de 3')
    expect(escopos.getByText('Diagnóstico para nova proposta').closest('tr')).toHaveTextContent('Planejamento')
    expect(escopos.queryByRole('link')).not.toBeInTheDocument()
    expect(painel.querySelector('h2')?.parentElement?.querySelector('button')).toBeNull()
  })

  it('a linha da aba Escopos abre o escopo', async () => {
    entrarComo('usr-helena')
    await abrir('cli-vertice', { aba: 'escopos' })
    await userEvent.click(screen.getByText('Regularização documental'))
    expect(push).toHaveBeenCalledWith('/escopos/esc-vertice-documental')
  })

  it('cliente sem escopos mostra o vazio; a Equipe vê os do cliente vinculado', async () => {
    entrarComo('usr-helena')
    const { unmount } = await abrir('cli-limpar', { aba: 'escopos' })
    expect(screen.getByText('Nenhum escopo deste cliente.')).toBeInTheDocument()
    unmount()
    entrarComo('usr-rafael')
    await abrir('cli-atlantica', { aba: 'escopos' })
    expect(within(screen.getByRole('region', { name: 'Escopos' })).getAllByRole('row').slice(1)).toHaveLength(3)
  })

  it('a Equipe vê os contratos do cliente vinculado, sem Novo contrato', async () => {
    entrarComo('usr-rafael')
    await abrir('cli-vertice', { aba: 'contratos' })
    expect(within(screen.getByRole('region', { name: 'Contratos' })).getAllByRole('row')).toHaveLength(4)
    expect(screen.queryByRole('link', { name: 'Novo contrato' })).not.toBeInTheDocument()
  })

  it('inativar a Vértice é bloqueado pela avaliação e pelos três contratos abertos (critério 22, RN-18)', async () => {
    entrarComo('usr-helena')
    await abrir('cli-vertice')
    await userEvent.click(screen.getByRole('button', { name: 'Mais ações' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Inativar' }))
    const janela = within(await screen.findByRole('alertdialog'))
    expect(janela.getByRole('link', { name: /Avaliação de 05\/11\/2026/ })).toHaveAttribute('href', '/avaliacoes/ava-vertice-3')
    for (const [codigo, id] of [
      ['CT-2025-031', 'ctr-vertice-manutencao'],
      ['CT-2026-044', 'ctr-vertice-mobilizacao'],
      ['PR-2026-052', 'ctr-vertice-proposta'],
    ]) {
      expect(janela.getByRole('link', { name: new RegExp(codigo) })).toHaveAttribute('href', `/contratos/${id}`)
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
    expect(screen.queryByRole('link', { name: 'Visão Executiva' })).not.toBeInTheDocument()
  })

  it('o Rafael não vê Editar e cria avaliação na Vértice', async () => {
    entrarComo('usr-rafael')
    await abrir('cli-vertice', { aba: 'maturidade' })
    expect(screen.queryByRole('link', { name: 'Editar' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Visão Executiva' })).toBeInTheDocument()
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
