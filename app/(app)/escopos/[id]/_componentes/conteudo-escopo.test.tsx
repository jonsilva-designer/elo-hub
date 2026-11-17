import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoEscopo } from './conteudo-escopo'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => {
  limparCookies()
  sessionStorage.clear()
})

const conteudo = (id: string) => ConteudoEscopo({ params: Promise.resolve({ id }) })

async function abrir(id: string) {
  return render(<TooltipProvider>{await conteudo(id)}</TooltipProvider>)
}

const painel = (titulo: string) => within(screen.getByRole('region', { name: titulo }))

describe('página do escopo (parte 3, 5.9)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Escopo | Plataforma ELO')
  })

  it('o cabeçalho tem a volta para Escopos, o nome, o cliente e o contrato com link e o status', async () => {
    entrarComo('usr-helena')
    const { container } = await abrir('esc-vertice-documental')
    expect(screen.getByRole('link', { name: 'Voltar para Escopos' })).toHaveAttribute('href', '/escopos')
    expect(screen.getByRole('heading', { level: 1, name: 'Regularização documental' })).toBeInTheDocument()
    const cabecalho = within(container.querySelector('header')!)
    expect(cabecalho.getByRole('link', { name: 'Vértice Manutenção' })).toHaveAttribute('href', '/clientes/cli-vertice')
    const contrato = cabecalho.getByRole('link', { name: 'CT-2025-031' })
    expect(contrato).toHaveAttribute('href', '/contratos/ctr-vertice-manutencao')
    expect(contrato.querySelector('.font-mono')).toHaveTextContent('CT-2025-031')
    expect(cabecalho.getByText('Em andamento')).toBeInTheDocument()
    expect(cabecalho.queryByText('Planejamento')).not.toBeInTheDocument()
  })

  it('os painéis aparecem na ordem da especificação', async () => {
    entrarComo('usr-helena')
    await abrir('esc-vertice-documental')
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Dados do escopo',
      'Criticidade',
      'Jornada ELO',
      'Planos e atividades',
      'Especialistas',
      'Documentos',
      'Demandas',
      'Histórico',
    ])
  })

  it('os Dados do escopo mostram o que foi informado, e "Não informado" no vazio', async () => {
    entrarComo('usr-helena')
    await abrir('esc-vertice-documental')
    const dados = painel('Dados do escopo')
    expect(dados.getByText('Rafael Souza')).toBeInTheDocument()
    expect(dados.getByText('09/02/2026')).toHaveClass('font-mono')
    expect(dados.getByText('18/12/2026')).toHaveClass('font-mono')
    expect(dados.getByText('Não informado')).toBeInTheDocument()
    expect(dados.queryByText('Conclusão efetiva')).not.toBeInTheDocument()
    expect(dados.queryByText('Ciclo anterior')).not.toBeInTheDocument()
    expect(dados.queryByText('Ciclo seguinte')).not.toBeInTheDocument()
  })

  it('a Criticidade mostra a etiqueta, a justificativa, quem classificou e a última alteração (CA-05.2)', async () => {
    entrarComo('usr-helena')
    await abrir('esc-vertice-documental')
    const criticidade = screen.getByRole('region', { name: 'Criticidade' })
    expect(within(criticidade).getByText('Alta')).toBeInTheDocument()
    expect(criticidade).toHaveTextContent('Três certidões vencem antes da próxima medição')
    // O responsável muda a cada reclassificação (CA-05.2): ele fica junto da última alteração, não da primeira data.
    expect(criticidade).toHaveTextContent('Classificada em 04/02/2026 · Última alteração por Helena Prado em 02/10/2026')
    expect(within(criticidade).getByText('04/02/2026')).toHaveClass('font-mono')
    expect(within(criticidade).getByText('02/10/2026')).toHaveClass('font-mono')
  })

  it('a criticidade nunca alterada diz só quem classificou e quando', async () => {
    entrarComo('usr-helena')
    await abrir('esc-vertice-qualidade')
    const criticidade = screen.getByRole('region', { name: 'Criticidade' })
    expect(criticidade).toHaveTextContent('Classificada por Helena Prado em 04/02/2026')
    expect(criticidade).not.toHaveTextContent('Última alteração')
  })

  it('a Jornada mostra a etapa atual e o progresso (critério 15)', async () => {
    entrarComo('usr-helena')
    await abrir('esc-vertice-documental')
    const jornada = screen.getByRole('region', { name: 'Jornada ELO' })
    expect(jornada).toHaveTextContent('Etapa atual: Estruturar · 1 de 5 etapas')
    expect(within(jornada).getByRole('article', { name: 'Estruturar' })).toHaveAttribute('data-atual', 'true')
    expect(within(jornada).queryByText('As etapas não mudam com o escopo fechado.')).not.toBeInTheDocument()
  })

  it('os planos do escopo, com o resumo das atividades e a linha que abre o plano (parte 4, 5.4)', async () => {
    entrarComo('usr-rafael')
    await abrir('esc-vertice-documental')
    const planos = painel('Planos e atividades')
    expect(planos.getAllByRole('columnheader').map((c) => c.textContent)).toEqual([
      'Plano',
      'Responsável',
      'Prazo',
      'Status',
      'Atividades',
    ])
    const linha = planos.getByText('Regularização das licenças').closest('tr')!
    expect(linha).toHaveTextContent('Rafael Souza')
    expect(linha).toHaveTextContent('1 de 5 concluídas · 1 atrasada')
    expect(planos.getByRole('link', { name: /Novo plano/ })).toHaveAttribute('href', '/planos/novo?escopo=esc-vertice-documental')
  })

  it('escopo fechado: Novo plano bloqueado (RN-23); escopo sem plano: o vazio', async () => {
    entrarComo('usr-helena')
    const { unmount } = await abrir('esc-atlantica-2025')
    const bloqueado = painel('Planos e atividades').getByRole('button', { name: /Novo plano/ })
    expect(bloqueado).toHaveAttribute('aria-disabled', 'true')
    expect(painel('Planos e atividades').getByText('Fechamento do ciclo 2025')).toBeInTheDocument()
    unmount()
    await abrir('esc-vertice-qualidade')
    expect(painel('Planos e atividades').getByText('Nenhum plano neste escopo.')).toBeInTheDocument()
  })

  it('o plano de contrato em Proposta aparece como planejamento (CA-05.9)', async () => {
    entrarComo('usr-helena')
    await abrir('esc-vertice-diagnostico')
    const linha = painel('Planos e atividades').getByText('Plano de desenvolvimento da gestão').closest('tr')!
    expect(within(linha).getByText('Planejamento')).toBeInTheDocument()
  })

  it('os especialistas ligados, com a especialidade e o link; o Inativo pede troca (UC-14, DF-51)', async () => {
    entrarComo('usr-rafael')
    const { unmount } = await abrir('esc-vertice-documental')
    expect(painel('Especialistas').getByRole('link', { name: 'Beatriz Fontes' })).toHaveAttribute('href', '/especialistas/esp-juridico')
    expect(painel('Especialistas').queryByText('Trocar especialista')).not.toBeInTheDocument()
    unmount()
    await abrir('esc-vertice-mobilizacao')
    expect(painel('Especialistas').getByText('Eduardo Salles')).toBeInTheDocument()
    expect(painel('Especialistas').getByText('Trocar especialista')).toBeInTheDocument()

  })

  it('escopo sem especialista mostra o vazio', async () => {
    entrarComo('usr-helena')
    await abrir('esc-vertice-qualidade')
    expect(painel('Especialistas').getByText('Nenhum especialista vinculado.')).toBeInTheDocument()
  })

  it('as demandas do escopo, e o vazio no escopo sem demanda (parte 5, 5.12)', async () => {
    entrarComo('usr-rafael')
    const { unmount } = await abrir('esc-vertice-documental')
    expect(painel('Demandas').getByText('ELO-2026-0003')).toBeInTheDocument()
    expect(painel('Demandas').getByText('ELO-2026-0009')).toBeInTheDocument()
    unmount()
    await abrir('esc-vertice-qualidade')
    expect(painel('Demandas').getByText('Nenhuma demanda ligada a este escopo.')).toBeInTheDocument()
  })

  it('o painel de documentos fica vazio', async () => {
    entrarComo('usr-helena')
    await abrir('esc-vertice-documental')
    expect(painel('Documentos').getByText('Nenhum documento ligado a este escopo.')).toBeInTheDocument()
  })

  it('o Histórico traz a justificativa da criticidade e a linha de autoria', async () => {
    entrarComo('usr-helena')
    const { container } = await abrir('esc-vertice-documental')
    expect(painel('Histórico').getByText(/^Justificativa: Três certidões/)).toBeInTheDocument()
    expect(container).toHaveTextContent('Criado por Helena Prado em 04/02/2026')
  })

  it('o escopo de contrato em Proposta tem a etiqueta de planejamento (DF-48)', async () => {
    entrarComo('usr-helena')
    const { container } = await abrir('esc-vertice-diagnostico')
    expect(within(container.querySelector('header')!).getByText('Planejamento')).toBeInTheDocument()
  })

  it('liga os ciclos do contrato recorrente (DF-46)', async () => {
    entrarComo('usr-helena')
    await abrir('esc-atlantica-2026')
    expect(painel('Dados do escopo').getByRole('link', { name: 'Gestão do contrato portuário, ciclo 2025' })).toHaveAttribute(
      'href',
      '/escopos/esc-atlantica-2025',
    )
  })

  it('o escopo Concluído mostra a conclusão efetiva, o ciclo seguinte e as etapas paradas (RN-23)', async () => {
    entrarComo('usr-helena')
    await abrir('esc-atlantica-2025')
    const dados = painel('Dados do escopo')
    expect(dados.getByText('Conclusão efetiva')).toBeInTheDocument()
    expect(dados.getByText('15/12/2025')).toHaveClass('font-mono')
    expect(dados.getByRole('link', { name: 'Gestão do contrato portuário, ciclo 2026' })).toHaveAttribute(
      'href',
      '/escopos/esc-atlantica-2026',
    )
    expect(painel('Jornada ELO').getByText('As etapas não mudam com o escopo fechado.')).toBeInTheDocument()
  })

  it('a Equipe atualiza as etapas Não iniciadas e Em andamento; o Administrador, todas (critério 16)', async () => {
    const comAtualizar = () =>
      screen
        .getAllByRole('article')
        .filter((cartao) => within(cartao).queryByRole('button', { name: /^Atualizar / }))
        .map((cartao) => cartao.getAttribute('aria-label'))
    entrarComo('usr-rafael')
    const { unmount } = await abrir('esc-vertice-documental')
    expect(comAtualizar()).toEqual(['Estruturar', 'Implementar', 'Monitorar', 'Evoluir'])
    unmount()
    entrarComo('usr-helena')
    await abrir('esc-vertice-documental')
    expect(comAtualizar()).toEqual(['Diagnosticar', 'Estruturar', 'Implementar', 'Monitorar', 'Evoluir'])
  })

  it('no escopo fechado, nenhuma etapa tem Atualizar (RN-23)', async () => {
    entrarComo('usr-helena')
    await abrir('esc-atlantica-2025')
    expect(screen.queryByRole('button', { name: /^Atualizar / })).not.toBeInTheDocument()
  })

  it('o Administrador vê Editar, Mais ações e Reclassificar', async () => {
    entrarComo('usr-helena')
    await abrir('esc-vertice-documental')
    expect(screen.getByRole('link', { name: 'Editar' })).toHaveAttribute('href', '/escopos/esc-vertice-documental/editar')
    expect(screen.getByRole('button', { name: 'Mais ações' })).toBeInTheDocument()
    expect(painel('Criticidade').getByRole('button', { name: 'Reclassificar' })).toBeInTheDocument()
  })

  it('no escopo fechado, o Administrador tem Mais ações, sem Reclassificar', async () => {
    entrarComo('usr-helena')
    await abrir('esc-atlantica-2025')
    expect(screen.getByRole('button', { name: 'Mais ações' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reclassificar' })).not.toBeInTheDocument()
  })

  it('a Equipe vinculada vê o escopo, sem Editar, Mais ações nem Reclassificar', async () => {
    entrarComo('usr-rafael')
    await abrir('esc-vertice-documental')
    expect(screen.getByRole('heading', { level: 1, name: 'Regularização documental' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Editar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Mais ações' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reclassificar' })).not.toBeInTheDocument()
  })

  it('fora do vínculo ou com id que não existe, "não encontrado" (critério 10)', async () => {
    entrarComo('usr-rafael')
    await expect(conteudo('esc-montareal-montagem')).rejects.toThrow('NEXT_NOT_FOUND')
    entrarComo('usr-helena')
    await expect(conteudo('esc-nao-existe')).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
