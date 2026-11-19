import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { obterInicioDaOperacao } from '@/lib/dados/parametros'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoInicio } from './conteudo-inicio'
import { DataDeHoje } from './data-de-hoje'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
}))
vi.mock('@/lib/dados/parametros', async (original) => ({
  ...(await original<typeof import('@/lib/dados/parametros')>()),
  obterInicioDaOperacao: vi.fn(),
}))

beforeEach(() => {
  limparCookies()
  push.mockReset()
  vi.mocked(obterInicioDaOperacao).mockResolvedValue('2026-11-02')
})

afterEach(() => vi.useRealTimers())

const regiao = (nome: string) => within(screen.getByRole('region', { name: nome }))

describe('Início (parte 7, 4.2 e 4.3; F13, F15)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Início | Plataforma ELO')
  })

  it('os números da carteira levam às listas filtradas (CA-13.3)', async () => {
    entrarComo('usr-helena')
    render(await ConteudoInicio())
    expect(screen.getByRole('link', { name: /Clientes ativos/ })).toHaveAttribute('href', '/clientes?status=Ativo&carteira=sim')
    expect(screen.getByRole('link', { name: /Vencidos/ })).toHaveAttribute('href', '/contratos?vigencia=Vencido')
    expect(screen.getByRole('link', { name: /Vencidos/ })).toHaveAttribute('data-tom', 'problema')
    expect(screen.getByRole('link', { name: /Atrasadas/ })).toHaveAttribute('href', '/minhas-atividades?responsavel=todos&prazo=Atrasada')
    expect(regiao('Escopos').getByRole('link', { name: /Em andamento/ })).toHaveAttribute('href', '/escopos?status=Em+andamento')
    expect(regiao('Etapa atual dos escopos abertos').getByRole('link', { name: /Implementar/ })).toHaveAttribute(
      'href',
      '/escopos?status=Planejado,Em+andamento,Em+espera&etapa=Implementar',
    )
    expect(regiao('Central ELO').getByRole('link', { name: /Crítica/ })).toHaveAttribute(
      'href',
      '/central?status=Nova,Em+triagem,Em+atendimento,Aguardando+retorno,Resolvida&criticidade=Cr%C3%ADtica',
    )
  })

  it('os quatro números principais ficam numa faixa só, sem um card solto para cada (revisão do Jonathan)', async () => {
    entrarComo('usr-helena')
    render(await ConteudoInicio())
    const faixa = regiao('Números da carteira')
    for (const nome of [/Clientes ativos/, /Escopos/, /Atividades abertas/, /Demandas abertas/]) {
      expect(faixa.getByRole('link', { name: nome })).toBeInTheDocument()
    }
  })

  it('Contratos e Atividades são gráficos de barras, cada barra levando à lista filtrada', async () => {
    entrarComo('usr-helena')
    render(await ConteudoInicio())
    for (const [painel, nomes] of [
      ['Contratos', [/Vigentes/, /Próximos do vencimento/, /Vencidos/, /Suspensos/]],
      ['Atividades', [/Abertas/, /Concluídas/, /Atrasadas/, /Próximas do prazo/]],
    ] as const) {
      for (const nome of nomes) {
        expect(regiao(painel).getByRole('link', { name: nome }).querySelector('[data-barra]'), `${painel} ${nome}`).not.toBeNull()
      }
    }
    expect(regiao('Atividades').getByRole('link', { name: /Concluídas/ })).toHaveAttribute('data-tom', 'concluido')
  })

  it('Escopos e Central ELO separam os grupos com título (por status, por criticidade, etapa atual)', async () => {
    entrarComo('usr-helena')
    render(await ConteudoInicio())
    for (const grupo of ['Por status', 'Por criticidade', 'Etapa atual dos escopos abertos']) {
      expect(regiao('Escopos').getByRole('region', { name: grupo })).toBeInTheDocument()
    }
    for (const grupo of ['Por status', 'Por criticidade']) {
      expect(regiao('Central ELO').getByRole('region', { name: grupo })).toBeInTheDocument()
    }
  })

  it('os alertas, dos mais críticos para os menos; a linha abre o registro (CA-15.1, CA-15.5)', async () => {
    entrarComo('usr-helena')
    render(await ConteudoInicio())
    const linhas = within(regiao('Alertas').getAllByRole('rowgroup')[1]).getAllByRole('row')
    expect(linhas[0]).toHaveTextContent('Crítica')
    const protocolo = regiao('Alertas').getByText('Protocolar a renovação da licença de operação').closest('tr')!
    expect(protocolo).toHaveTextContent('Atividade atrasada')
    await userEvent.click(protocolo)
    expect(push).toHaveBeenCalledWith('/atividades/atv-licencas-protocolo/editar')
  })

  it('os códigos dos registros dos alertas saem na fonte dos números (padrão visual)', async () => {
    entrarComo('usr-helena')
    render(await ConteudoInicio())
    const vencido = regiao('Alertas').getByText('Contrato vencido').closest('tr')!
    expect(vencido.querySelector('.font-mono')).toHaveTextContent('CT-2025-077')
  })

  it('a Equipe não vê números nem alertas da Montareal (CA-13.2, CA-15.3)', async () => {
    entrarComo('usr-rafael')
    render(await ConteudoInicio())
    expect(regiao('Alertas').queryByText('Montareal')).not.toBeInTheDocument()
    expect(regiao('Alertas').getByText('Protocolar a renovação da licença de operação')).toBeInTheDocument()
  })

  it('antes do início oficial da operação, o aviso no lugar dos alertas (DF-46, CA-15.7)', async () => {
    vi.mocked(obterInicioDaOperacao).mockResolvedValue(null)
    entrarComo('usr-helena')
    render(await ConteudoInicio())
    expect(regiao('Alertas').getByText('Os alertas aparecem depois do início oficial da operação.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Clientes ativos/ })).toBeInTheDocument()
  })
})

describe('DataDeHoje', () => {
  it('mostra a data de Brasília, mesmo quando em UTC já é o dia seguinte', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-14T01:30:00Z'))
    render(await DataDeHoje())
    const data = screen.getByText('13/11/2026')
    expect(data.className).toContain('font-mono')
  })
})
