import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Pagina, { metadata } from '../page'
import { DataDeHoje } from './data-de-hoje'

vi.mock('next/server', () => ({ connection: async () => {} }))

afterEach(() => vi.useRealTimers())

describe('Início provisório', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Início | Plataforma ELO')
  })

  it('mostra o cabeçalho e o estado Em construção', () => {
    render(<Pagina />)
    expect(screen.getByRole('heading', { level: 1, name: 'Início' })).toBeInTheDocument()
    expect(screen.getByText('Em construção')).toBeInTheDocument()
    expect(
      screen.getByText('O painel com os alertas do dia entra numa próxima parte do protótipo.'),
    ).toBeInTheDocument()
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
