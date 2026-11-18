import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoVisaoExecutiva } from './conteudo-visao-executiva'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => {
  limparCookies()
  push.mockReset()
})

const conteudo = (id: string, busca: Record<string, string> = {}) =>
  ConteudoVisaoExecutiva({ params: Promise.resolve({ id }), searchParams: Promise.resolve(busca) })

async function abrir(id: string, busca: Record<string, string> = {}) {
  return render(<TooltipProvider>{await conteudo(id, busca)}</TooltipProvider>)
}

const painel = (titulo: string) => within(screen.getByRole('region', { name: titulo }))

describe('Visão Executiva (parte 7, 4.4; F14)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Visão Executiva | Plataforma ELO')
  })

  it('o cabeçalho tem a volta para o cliente, o nome, as datas e o filtro; os blocos vêm na ordem de F14 (CA-14.1)', async () => {
    entrarComo('usr-helena')
    const { container } = await abrir('cli-vertice')
    expect(screen.getByRole('link', { name: 'Voltar para Vértice Manutenção' })).toHaveAttribute('href', '/clientes/cli-vertice')
    expect(screen.getByRole('heading', { level: 1, name: 'Visão Executiva' })).toBeInTheDocument()
    const cabecalho = within(container.querySelector('header')!)
    expect(cabecalho.getByText('Vértice Manutenção')).toBeInTheDocument()
    expect(cabecalho.getByText(/Textos atualizados em/)).toHaveTextContent('04/11/2026')
    expect(screen.getByRole('combobox', { name: 'Contrato' })).toHaveTextContent('Todos os contratos')
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Escopos e situação atual',
      'Jornada ELO',
      'Planos de ação',
      'Atividades pendentes',
      'Demandas',
      'Entregas realizadas',
      'Próximos prazos',
      'Pendências',
      'Maturidade',
      'Principais resultados',
      'Observações executivas',
      'Próximos passos',
    ])
  })

  it('os blocos com os dados do cliente e nada do que não pode sair (CA-14.5)', async () => {
    entrarComo('usr-helena')
    const { container } = await abrir('cli-vertice')
    expect(painel('Escopos e situação atual').getByText('Regularização documental')).toBeInTheDocument()
    expect(painel('Jornada ELO').getByText('Regularização documental').closest('tr')).toHaveTextContent('Estruturar')
    expect(painel('Atividades pendentes').getByText('Ana Ribeiro (SSMA do cliente)')).toBeInTheDocument()
    expect(painel('Demandas').getByText('ELO-2026-0003')).toBeInTheDocument()
    expect(painel('Pendências').getByText('Protocolar a renovação da licença de operação')).toBeInTheDocument()
    expect(painel('Maturidade').getByText('15/09/2026')).toBeInTheDocument()
    expect(painel('Próximos passos').getByText(/Renovar a licença de operação/)).toBeInTheDocument()
    expect(painel('Próximos passos').getByText(/Atualizado por Helena Prado em/)).toBeInTheDocument()
    for (const proibido of ['Beatriz Fontes', 'Sócio muito receptivo', 'Três certidões vencem', 'Contrato principal da Vértice']) {
      expect(container).not.toHaveTextContent(proibido)
    }
  })

  it('o Administrador e a Equipe vinculada editam cada texto (CA-14.7)', async () => {
    entrarComo('usr-rafael')
    await abrir('cli-vertice')
    await userEvent.click(painel('Próximos passos').getByRole('button', { name: 'Editar Próximos passos' }))
    const janela = within(await screen.findByRole('alertdialog'))
    const campo = janela.getByRole('textbox', { name: 'Próximos passos' })
    expect(campo).toHaveValue('Renovar a licença de operação, implantar o controle de validade e decidir a renovação do contrato de mobilização.')
    await userEvent.clear(campo)
    await userEvent.type(campo, 'Assinar o segundo aditivo.')
    await userEvent.click(janela.getByRole('button', { name: 'Salvar' }))
    await vi.waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
  })

  it('o texto não escrito mostra o vazio, sem autor', async () => {
    entrarComo('usr-rafael')
    await abrir('cli-rede-norte')
    expect(painel('Principais resultados').getByText('Ainda não escrito.')).toBeInTheDocument()
  })

  it('o filtro por contrato recorta os blocos e troca o endereço (CA-14.6)', async () => {
    entrarComo('usr-helena')
    await abrir('cli-vertice', { contrato: 'ctr-vertice-mobilizacao' })
    expect(screen.getByRole('combobox', { name: 'Contrato' })).toHaveTextContent('CT-2026-044')
    expect(painel('Escopos e situação atual').queryByText('Regularização documental')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('combobox', { name: 'Contrato' }))
    await userEvent.click(await screen.findByRole('option', { name: 'Todos os contratos' }))
    expect(push).toHaveBeenCalledWith('/clientes/cli-vertice/visao-executiva')
  })

  it('tela cheia para a projeção (CA-14.2)', async () => {
    entrarComo('usr-helena')
    const pedir = vi.fn().mockResolvedValue(undefined)
    document.documentElement.requestFullscreen = pedir
    await abrir('cli-vertice')
    await userEvent.click(screen.getByRole('button', { name: 'Tela cheia' }))
    expect(pedir).toHaveBeenCalled()
  })

  it('fora do vínculo, o cadastro da ELO ou id que não existe: não encontrado (CA-14.4)', async () => {
    entrarComo('usr-rafael')
    await expect(conteudo('cli-montareal')).rejects.toThrow('NEXT_NOT_FOUND')
    entrarComo('usr-helena')
    await expect(conteudo('cli-elo')).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(conteudo('cli-nao-existe')).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
