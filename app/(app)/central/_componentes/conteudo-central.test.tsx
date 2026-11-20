import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CHAVE_FILTROS_DAS_DEMANDAS } from '@/lib/demandas/filtros'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoCentral } from './conteudo-central'
import { VoltarParaCentral } from './voltar-para-central'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => {
  limparCookies()
  push.mockReset()
  sessionStorage.clear()
  window.history.replaceState(null, '', '/central')
})

afterEach(() => vi.restoreAllMocks())

async function abrir(busca: Record<string, string> = {}) {
  return render(await ConteudoCentral({ searchParams: Promise.resolve(busca) }))
}

const linhas = () => within(screen.getAllByRole('rowgroup')[1]).getAllByRole('row')

describe('fila de demandas (parte 5, 5.8)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Central ELO | Plataforma ELO')
  })

  it('o Rafael vê as 9 dos clientes dele, com Nova demanda e sem Exportar (RN-01, CA-16.3)', async () => {
    entrarComo('usr-rafael')
    const { container } = await abrir()
    expect(screen.getByRole('heading', { level: 1, name: 'Central ELO' })).toBeInTheDocument()
    expect(container.querySelector('header')).toHaveTextContent('9 demandas')
    expect(screen.getByRole('link', { name: /Nova demanda/ })).toHaveAttribute('href', '/central/nova')
    expect(screen.queryByRole('button', { name: /Exportar/ })).not.toBeInTheDocument()
    expect(screen.queryByText('ELO-2026-0011')).not.toBeInTheDocument()
  })

  it('a Helena vê as 11 e tem Exportar; a vencida tem a marca e a barra', async () => {
    entrarComo('usr-helena')
    await abrir()
    expect(linhas()).toHaveLength(11)
    expect(screen.getByRole('button', { name: /Exportar/ })).toBeInTheDocument()
    const vencida = screen.getByText('ELO-2026-0003').closest('tr')!
    expect(within(vencida).getByText('Vencida')).toBeInTheDocument()
    expect(vencida).toHaveAttribute('data-destaque', 'problema')
  })

  it('a linha abre a demanda; o filtro de status vai para o endereço e para a volta (CA-16.2)', async () => {
    entrarComo('usr-helena')
    await abrir({ status: 'Resolvida' })
    expect(linhas()).toHaveLength(1)
    expect(sessionStorage.getItem(CHAVE_FILTROS_DAS_DEMANDAS)).toBe('status=Resolvida')
    await userEvent.click(linhas()[0])
    expect(push).toHaveBeenCalledWith('/central/ELO-2026-0005')
  })

  it('o período fica alinhado aos outros filtros: o rótulo vai dentro do campo, e não em cima', async () => {
    entrarComo('usr-helena')
    render(await ConteudoCentral({ searchParams: Promise.resolve({}) }))
    const filtros = within(screen.getByRole('group', { name: 'Filtros' }))
    const de = filtros.getByRole('textbox', { name: 'Aberta de' })
    const ate = filtros.getByRole('textbox', { name: 'Aberta até' })
    expect(de.closest('[data-slot="input-group"]')).toHaveTextContent('Aberta de')
    expect(ate.closest('[data-slot="input-group"]')).toHaveTextContent('até')
    expect(filtros.queryByText('Até', { selector: 'label' })).not.toBeInTheDocument()
  })

  it('Limpar filtros apaga também a data digitada pela metade (revisão do código)', async () => {
    entrarComo('usr-helena')
    render(await ConteudoCentral({ searchParams: Promise.resolve({}) }))
    const de = within(screen.getByRole('group', { name: 'Filtros' })).getByRole('textbox', { name: 'Aberta de' })
    await userEvent.type(de, '10/05')
    await userEvent.type(screen.getByRole('textbox', { name: 'Buscar' }), 'nada com esse texto')
    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    expect(within(screen.getByRole('group', { name: 'Filtros' })).getByRole('textbox', { name: 'Aberta de' })).toHaveValue('')
  })

  it('a volta para a Central leva os filtros guardados', () => {
    sessionStorage.setItem(CHAVE_FILTROS_DAS_DEMANDAS, 'status=Nova')
    render(<VoltarParaCentral />)
    expect(screen.getByRole('link', { name: 'Voltar para Central ELO' })).toHaveAttribute('href', '/central?status=Nova')
  })
})
