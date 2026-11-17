import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoMinhasAtividades } from './conteudo-minhas-atividades'

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
  window.history.replaceState(null, '', '/minhas-atividades')
})

async function abrir(busca: Record<string, string> = {}) {
  return render(await ConteudoMinhasAtividades({ searchParams: Promise.resolve(busca) }))
}

const linhas = () => within(screen.getAllByRole('rowgroup')[1]).getAllByRole('row')

describe('Minhas atividades (parte 4, 5.8)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Minhas atividades | Plataforma ELO')
  })

  it('o Rafael abre com as dele, as atrasadas e as próximas no topo, sem Exportar (CA-08.4, CA-16.3)', async () => {
    entrarComo('usr-rafael')
    const { container } = await abrir()
    expect(screen.getByRole('heading', { level: 1, name: 'Minhas atividades' })).toBeInTheDocument()
    expect(container.querySelector('header')).toHaveTextContent('8 atividades')
    const [primeira, segunda] = linhas()
    expect(primeira).toHaveTextContent('Protocolar a renovação da licença de operação')
    expect(within(primeira).getByText('Atrasada')).toBeInTheDocument()
    expect(primeira).toHaveTextContent('Vértice Manutenção')
    expect(primeira).toHaveTextContent('Regularização das licenças')
    expect(within(segunda).getByText('Próxima do prazo')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Exportar/ })).not.toBeInTheDocument()
  })

  it('a linha abre a edição com a origem; a fechada não abre para a Equipe', async () => {
    entrarComo('usr-rafael')
    await abrir()
    await userEvent.click(linhas()[0])
    expect(push).toHaveBeenCalledWith('/atividades/atv-licencas-protocolo/editar?origem=minhas-atividades')
    expect(linhas()[7]).not.toHaveAttribute('tabindex')
  })

  it('a Helena abre com as 4 dela e tem Exportar; com todos os responsáveis, as 12', async () => {
    entrarComo('usr-helena')
    const { container, unmount } = await abrir()
    expect(container.querySelector('header')).toHaveTextContent('4 atividades')
    expect(screen.getByRole('button', { name: /Exportar/ })).toBeInTheDocument()
    unmount()
    const todas = await abrir({ responsavel: 'todos' })
    expect(todas.container.querySelector('header')).toHaveTextContent('12 atividades')
  })

  it('o filtro de responsável começa na pessoa que entrou', async () => {
    entrarComo('usr-rafael')
    await abrir()
    expect(screen.getByRole('combobox', { name: 'Responsável' })).toHaveTextContent('Rafael Souza')
  })
})
