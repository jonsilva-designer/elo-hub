import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AbasCliente } from './abas-cliente'

// Como no Next, o useSearchParams acompanha o endereço, inclusive depois de um replaceState.
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(window.location.search) }))

const ABAS = [
  { valor: 'resumo', rotulo: 'Resumo' },
  { valor: 'maturidade', rotulo: 'Maturidade' },
]
const PAINEIS = { resumo: <p>Painel do resumo</p>, maturidade: <p>Painel da maturidade</p> }

const montar = (inicial: string) => <AbasCliente abas={ABAS} inicial={inicial} paineis={PAINEIS} />

const selecionada = () => screen.getByRole('tab', { selected: true }).textContent

beforeEach(() => window.history.replaceState(null, '', '/clientes/cli-vertice'))

describe('AbasCliente', () => {
  it('o link "Ver maturidade" abre a aba mesmo quando o servidor manda a mesma aba inicial de antes', async () => {
    // Volta de uma avaliação: a página abre na Maturidade.
    window.history.replaceState(null, '', '/clientes/cli-vertice?aba=maturidade')
    const { rerender } = render(montar('maturidade'))
    expect(selecionada()).toBe('Maturidade')

    // A pessoa vai para o Resumo e clica em "Ver maturidade": o endereço volta a ter ?aba=maturidade,
    // e o servidor manda de novo a aba inicial "maturidade", igual à de antes.
    await userEvent.click(screen.getByRole('tab', { name: 'Resumo' }))
    expect(selecionada()).toBe('Resumo')
    window.history.pushState(null, '', '/clientes/cli-vertice?aba=maturidade')
    rerender(montar('maturidade'))

    expect(selecionada()).toBe('Maturidade')
    expect(screen.getByText('Painel da maturidade')).toBeVisible()
  })

  it('trocar de aba não volta para a aba inicial', async () => {
    render(montar('resumo'))
    await userEvent.click(screen.getByRole('tab', { name: 'Maturidade' }))
    expect(selecionada()).toBe('Maturidade')
    expect(window.location.search).toBe('?aba=maturidade')
    await userEvent.click(screen.getByRole('tab', { name: 'Resumo' }))
    expect(selecionada()).toBe('Resumo')
    expect(window.location.search).toBe('')
  })

  it('aba do endereço que o cliente não tem abre o Resumo', () => {
    window.history.replaceState(null, '', '/clientes/cli-elo?aba=maturidade')
    render(<AbasCliente abas={[ABAS[0]]} inicial="resumo" paineis={PAINEIS} />)
    expect(selecionada()).toBe('Resumo')
  })
})

describe('AbasCliente, revisão do código', () => {
  it('trocar de aba mantém os outros parâmetros do endereço', async () => {
    window.history.replaceState(null, '', '/clientes/cli-vertice?origem=alerta')
    render(montar('resumo'))
    await userEvent.click(screen.getByRole('tab', { name: 'Maturidade' }))
    expect(new URLSearchParams(window.location.search).get('origem')).toBe('alerta')
    expect(new URLSearchParams(window.location.search).get('aba')).toBe('maturidade')
    await userEvent.click(screen.getByRole('tab', { name: 'Resumo' }))
    expect(window.location.search).toBe('?origem=alerta')
  })
})
