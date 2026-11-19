import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CHAVE_FILTROS_DOS_ESCOPOS } from '@/lib/escopos/filtros'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoEscopos } from './conteudo-escopos'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => {
  limparCookies()
  sessionStorage.clear()
  window.history.replaceState(null, '', '/escopos')
})

async function renderizar(busca: Record<string, string> = {}) {
  return render(await ConteudoEscopos({ searchParams: Promise.resolve(busca) }))
}

const linhas = () => within(screen.getAllByRole('rowgroup')[1]).getAllByRole('row')

/** A linha da tabela que mostra o nome do escopo. */
const linhaDo = (nome: string) => screen.getByText(nome).closest('tr')!

/** O nome do escopo em cada linha, na ordem da tabela. */
const nomes = () => linhas().map((l) => l.querySelector('[data-slot="texto"]')?.textContent)

describe('lista de escopos (parte 3, 5.7)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Escopos | Plataforma ELO')
  })

  it('a Helena vê os 10 escopos, da Crítica para a Baixa, com os fechados no fim (critérios 1 e 11)', async () => {
    entrarComo('usr-helena')
    const { container } = await renderizar()
    expect(container.querySelector('header')).toHaveTextContent('10 escopos')
    expect(nomes()).toEqual([
      'Mobilização de equipe',
      'Implantação do monitoramento remoto',
      'Regularização documental',
      'Montagem eletromecânica',
      'Programa de qualidade',
      'Diagnóstico para nova proposta',
      'Gestão do contrato portuário, ciclo 2026',
      'Adequação de SSMA',
      'Gestão do contrato portuário, ciclo 2025',
      'Apoio marítimo à Bacia de Campos',
    ])
  })

  it('sem Novo escopo e sem Exportar: o escopo nasce no contrato', async () => {
    entrarComo('usr-helena')
    await renderizar()
    expect(screen.queryByRole('link', { name: /Novo escopo/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Exportar/ })).not.toBeInTheDocument()
  })

  it('o Rafael vê os 8 dos clientes vinculados (critério 9)', async () => {
    entrarComo('usr-rafael')
    await renderizar()
    expect(linhas()).toHaveLength(8)
    expect(screen.queryByText('Montagem eletromecânica')).not.toBeInTheDocument()
  })

  it('mostra o código do contrato, o planejamento e a etapa atual com o progresso (CA-05.9, CA-06.10)', async () => {
    entrarComo('usr-helena')
    await renderizar()
    const diagnostico = linhaDo('Diagnóstico para nova proposta')
    expect(within(diagnostico).getByText('PR-2026-052')).toHaveClass('font-mono')
    expect(within(diagnostico).getByText('Planejamento')).toBeInTheDocument()
    expect(within(linhaDo('Mobilização de equipe')).queryByText('Planejamento')).not.toBeInTheDocument()
    expect(linhaDo('Mobilização de equipe')).toHaveTextContent('Implementar · 0 de 3')
  })

  it('escolher o cliente deixa no filtro Contrato só os contratos dele e vai para o endereço (critério 12)', async () => {
    entrarComo('usr-helena')
    const trocar = vi.spyOn(window.history, 'replaceState')
    await renderizar()
    await userEvent.click(screen.getByRole('combobox', { name: 'Cliente' }))
    await userEvent.click(await screen.findByRole('option', { name: 'Atlântica Portos' }))
    expect(trocar).toHaveBeenLastCalledWith(null, '', '/escopos?cliente=cli-atlantica')
    expect(sessionStorage.getItem(CHAVE_FILTROS_DOS_ESCOPOS)).toBe('cliente=cli-atlantica')
    expect(linhas()).toHaveLength(3)
    await userEvent.click(screen.getByRole('combobox', { name: 'Contrato' }))
    const opcoes = (await screen.findAllByRole('option')).map((o) => o.textContent)
    expect(opcoes).toEqual(['Todos os contratos', 'CT-2024-008', 'CT-2026-019'])
  })

  it('começa com os filtros do endereço (CA-16.2)', async () => {
    entrarComo('usr-helena')
    await renderizar({ criticidade: 'Crítica' })
    expect(nomes()).toEqual(['Mobilização de equipe'])
  })
})
