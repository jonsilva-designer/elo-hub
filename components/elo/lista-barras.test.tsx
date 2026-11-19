import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ListaBarras } from './lista-barras'

const ITENS = [
  { rotulo: 'Vigentes', valor: 8, href: '/contratos?vigencia=Vigente' },
  { rotulo: 'Próximos do vencimento', valor: 4, href: '/contratos?vigencia=Pr%C3%B3ximo', tom: 'atencao' as const },
  { rotulo: 'Vencidos', valor: 0, href: '/contratos?vigencia=Vencido', tom: 'problema' as const },
]

const barra = (nome: RegExp) => screen.getByRole('link', { name: nome }).querySelector('[data-barra]') as HTMLElement

describe('ListaBarras', () => {
  it('cada item é um link para a lista filtrada, com o nome e o número', () => {
    render(<ListaBarras itens={ITENS} />)
    const vigentes = screen.getByRole('link', { name: 'Vigentes: 8' })
    expect(vigentes).toHaveAttribute('href', '/contratos?vigencia=Vigente')
    expect(within(vigentes).getByText('8')).toHaveClass('font-mono')
  })

  it('a barra é proporcional ao maior valor; zero não tem barra', () => {
    render(<ListaBarras itens={ITENS} />)
    expect(barra(/Vigentes/).style.width).toBe('100%')
    expect(barra(/Próximos/).style.width).toBe('50%')
    expect(barra(/Vencidos/).style.width).toBe('0%')
  })

  it('o tom pinta a barra e fica no link, como o destaque das listas', () => {
    render(<ListaBarras itens={ITENS} />)
    expect(screen.getByRole('link', { name: /Vencidos/ })).toHaveAttribute('data-tom', 'problema')
    expect(barra(/Próximos/).className).toContain('--elo-status-atencao')
    expect(barra(/Vigentes/).className).toContain('bg-primary')
  })

  it('tudo zero: nenhuma barra, sem divisão por zero', () => {
    render(<ListaBarras itens={ITENS.map((i) => ({ ...i, valor: 0 }))} />)
    expect(barra(/Vigentes/).style.width).toBe('0%')
  })
})
