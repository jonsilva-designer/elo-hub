import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { formatarReal } from '@/lib/formato'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoContrato } from './conteudo-contrato'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => {
  limparCookies()
  push.mockReset()
})

const conteudo = (id: string) => ConteudoContrato({ params: Promise.resolve({ id }) })

async function abrir(id: string) {
  return render(<TooltipProvider>{await conteudo(id)}</TooltipProvider>)
}

const painel = (titulo: string) => within(screen.getByRole('region', { name: titulo }))

describe('página do contrato (parte 3, 5.6)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Contrato | Plataforma ELO')
  })

  it('o cabeçalho tem a volta para Contratos, o código, o cliente com link, o contratante e o status', async () => {
    entrarComo('usr-helena')
    const { container } = await abrir('ctr-vertice-manutencao')
    expect(screen.getByRole('link', { name: 'Voltar para Contratos' })).toHaveAttribute('href', '/contratos')
    const titulo = screen.getByRole('heading', { level: 1, name: 'CT-2025-031' })
    // JetBrains Mono em todos os números (padrão visual, decisão do Jonathan), também no título.
    expect(titulo.querySelector('.font-mono')).toHaveTextContent('CT-2025-031')
    const cabecalho = within(container.querySelector('header')!)
    expect(cabecalho.getByRole('link', { name: 'Vértice Manutenção' })).toHaveAttribute('href', '/clientes/cli-vertice')
    expect(cabecalho.getByText('Petrobras')).toBeInTheDocument()
    expect(cabecalho.getByText('Ativo')).toBeInTheDocument()
    expect(cabecalho.queryByText('Planejamento')).not.toBeInTheDocument()
  })

  it('o Administrador vê Editar e o menu de ações', async () => {
    entrarComo('usr-helena')
    await abrir('ctr-vertice-manutencao')
    expect(screen.getByRole('link', { name: 'Editar' })).toHaveAttribute('href', '/contratos/ctr-vertice-manutencao/editar')
    expect(screen.getByRole('button', { name: 'Mais ações' })).toBeInTheDocument()
  })

  it('os painéis aparecem na ordem da especificação', async () => {
    entrarComo('usr-helena')
    await abrir('ctr-vertice-manutencao')
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Vigência',
      'Dados do contrato',
      'Escopos',
      'Documentos',
      'Histórico',
    ])
  })

  it('a Vigência mostra o status da vigência, o tipo, o início e o término', async () => {
    entrarComo('usr-helena')
    await abrir('ctr-vertice-manutencao')
    const vigencia = painel('Vigência')
    expect(vigencia.getByText('Vigente')).toBeInTheDocument()
    expect(vigencia.getByText('Prazo determinado')).toBeInTheDocument()
    expect(vigencia.getByText('01/07/2025')).toBeInTheDocument()
    expect(vigencia.getAllByText('30/06/2027').length).toBeGreaterThan(0)
  })

  it('os Dados do contrato mostram o que foi informado', async () => {
    entrarComo('usr-helena')
    await abrir('ctr-vertice-manutencao')
    const dados = painel('Dados do contrato')
    // O Intl separa o R$ com espaço sem quebra: o normalizador padrão o troca por espaço comum e não acharia o valor.
    expect(dados.getByText(formatarReal(1850000), { normalizer: (t) => t.trim() })).toBeInTheDocument()
    expect(dados.getByText('Nenhum documento')).toBeInTheDocument()
    for (const rotulo of ['Objeto', 'Serviços', 'Responsável ELO', 'Valor', 'Data da proposta', 'Documento principal', 'Observações']) {
      expect(dados.getByText(rotulo)).toBeInTheDocument()
    }
  })

  it('os Escopos listam os escopos do contrato com a etapa atual e o progresso', async () => {
    entrarComo('usr-helena')
    await abrir('ctr-vertice-manutencao')
    const escopos = painel('Escopos')
    expect(escopos.getAllByRole('row')).toHaveLength(3)
    const documental = escopos.getByRole('cell', { name: 'Regularização documental' }).closest('tr')!
    expect(documental).toHaveTextContent('Estruturar · 1 de 5')
    expect(documental).toHaveTextContent('Em andamento')
    expect(documental).toHaveTextContent('Alta')
    expect(documental).toHaveTextContent('Rafael Souza')
    expect(escopos.getByRole('cell', { name: 'Programa de qualidade' })).toBeInTheDocument()
  })

  it('a linha do escopo abre a página dele', async () => {
    entrarComo('usr-helena')
    await abrir('ctr-vertice-manutencao')
    await userEvent.click(painel('Escopos').getByText('Regularização documental'))
    expect(push).toHaveBeenCalledWith('/escopos/esc-vertice-documental')
  })

  it('o Administrador cadastra escopo pelo Novo escopo do painel', async () => {
    entrarComo('usr-helena')
    await abrir('ctr-vertice-manutencao')
    expect(painel('Escopos').getByRole('link', { name: /Novo escopo/ })).toHaveAttribute(
      'href',
      '/escopos/novo?contrato=ctr-vertice-manutencao',
    )
  })

  it('no contrato fechado, Novo escopo fica bloqueado com a dica de reabrir (RN-23)', async () => {
    entrarComo('usr-helena')
    await abrir('ctr-ondamar-apoio')
    const botao = painel('Escopos').getByRole('button', { name: /Novo escopo/ })
    expect(botao).toHaveAttribute('aria-disabled', 'true')
    expect(painel('Escopos').queryByRole('link', { name: /Novo escopo/ })).not.toBeInTheDocument()
    await userEvent.hover(botao)
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Contrato fechado: reabra o contrato para cadastrar escopos')
  })

  it('Documentos e Histórico', async () => {
    entrarComo('usr-helena')
    await abrir('ctr-vertice-manutencao')
    expect(painel('Documentos').getByText('Nenhum documento ligado a este contrato.')).toBeInTheDocument()
    expect(screen.getByText(/Criado por Helena/)).toBeInTheDocument()
  })

  it('a proposta tem a etiqueta de planejamento, fica sem vigência e mostra "Não informado" no valor', async () => {
    entrarComo('usr-helena')
    const { container } = await abrir('ctr-vertice-proposta')
    expect(within(container.querySelector('header')!).getByText('Planejamento')).toBeInTheDocument()
    expect(painel('Vigência').getByText('Sem vigência enquanto o contrato não está Ativo.')).toBeInTheDocument()
    const valor = painel('Dados do contrato').getByText('Valor').closest('div')!
    expect(valor).toHaveTextContent('Não informado')
  })

  it('o Prazo indeterminado fica Vigente e sem data de término', async () => {
    entrarComo('usr-helena')
    await abrir('ctr-atlantica-porto')
    const vigencia = painel('Vigência')
    expect(vigencia.getByText('Vigente')).toBeInTheDocument()
    expect(vigencia.getByText('Sem data de término')).toBeInTheDocument()
  })

  it('contrato sem escopos', async () => {
    entrarComo('usr-helena')
    await abrir('ctr-rede-norte-glpi')
    expect(painel('Escopos').getByText('Nenhum escopo neste contrato.')).toBeInTheDocument()
  })

  it('o Histórico lista as mudanças de status', async () => {
    entrarComo('usr-helena')
    await abrir('ctr-vertice-mobilizacao')
    const historico = screen.getByRole('heading', { name: 'Histórico' }).closest('section')!
    expect(historico).toHaveTextContent('Status do contrato')
    expect(historico).toHaveTextContent('De Proposta para Ativo')
  })

  it('a Equipe vinculada vê o contrato sem Editar, sem o menu e sem Novo escopo', async () => {
    entrarComo('usr-rafael')
    await abrir('ctr-vertice-manutencao')
    expect(screen.getByRole('heading', { level: 1, name: 'CT-2025-031' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Editar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Novo escopo/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Novo escopo/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Mais ações' })).not.toBeInTheDocument()
  })

  it('fora do vínculo ou com id que não existe, "não encontrado" (critério 10)', async () => {
    entrarComo('usr-rafael')
    await expect(conteudo('ctr-montareal-montagem')).rejects.toThrow('NEXT_NOT_FOUND')
    entrarComo('usr-helena')
    await expect(conteudo('ctr-nao-existe')).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
