import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CHAVE_FILTROS_DOS_ESPECIALISTAS } from '@/lib/especialistas/filtros'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoEspecialistas } from './conteudo-especialistas'

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
  window.history.replaceState(null, '', '/especialistas')
})

afterEach(() => vi.restoreAllMocks())

async function abrir(busca: Record<string, string> = {}) {
  return render(await ConteudoEspecialistas({ searchParams: Promise.resolve(busca) }))
}

const linhas = () => within(screen.getAllByRole('rowgroup')[1]).getAllByRole('row')

describe('lista de especialistas (parte 5, 5.4)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Especialistas | Plataforma ELO')
  })

  it('a Equipe consulta todos, sem Novo especialista (DF-02, matriz 4.3)', async () => {
    entrarComo('usr-rafael')
    const { container } = await abrir()
    expect(container.querySelector('header')).toHaveTextContent('6 especialistas')
    expect(screen.queryByRole('link', { name: /Novo especialista/ })).not.toBeInTheDocument()
    expect(screen.getAllByRole('columnheader').map((c) => c.textContent)).toEqual([
      'Nome',
      'Especialidade',
      'Cidade/UF',
      'Origem',
      'Status',
    ])
  })

  it('o Administrador tem Novo especialista', async () => {
    entrarComo('usr-helena')
    await abrir()
    expect(screen.getByRole('link', { name: /Novo especialista/ })).toHaveAttribute('href', '/especialistas/novo')
  })

  it('a candidatura repetida tem a marca "E-mail já cadastrado" (DF-50); a linha abre o especialista', async () => {
    entrarComo('usr-helena')
    await abrir()
    const [repetida] = linhas()
    expect(within(repetida).getByText('E-mail já cadastrado')).toBeInTheDocument()
    await userEvent.click(repetida)
    expect(push).toHaveBeenCalledWith('/especialistas/esp-suprimentos-2')
  })

  it('o filtro de origem acha as candidaturas do site, e vai para o endereço e para a volta (CA-16.2)', async () => {
    entrarComo('usr-helena')
    const trocar = vi.spyOn(window.history, 'replaceState')
    await abrir()
    await userEvent.click(screen.getByRole('combobox', { name: 'Origem' }))
    await userEvent.click(await screen.findByRole('option', { name: 'Site' }))
    expect(linhas()).toHaveLength(3)
    expect(trocar).toHaveBeenLastCalledWith(null, '', '/especialistas?origem=Site')
    expect(sessionStorage.getItem(CHAVE_FILTROS_DOS_ESPECIALISTAS)).toBe('origem=Site')
  })

  it('o Inativo aparece com o filtro de status do endereço (CA-18.2)', async () => {
    entrarComo('usr-helena')
    await abrir({ status: 'Inativo' })
    expect(linhas()).toHaveLength(1)
    expect(linhas()[0]).toHaveTextContent('Eduardo Salles')
  })
})
