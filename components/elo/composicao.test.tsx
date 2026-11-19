import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Composicao } from './composicao'

const PARTES = [
  { rotulo: 'No prazo', valor: 6, href: '/a?prazo=No+prazo' },
  { rotulo: 'Próximas do prazo', valor: 3, href: '/a?prazo=Pr', tom: 'atencao' as const },
  { rotulo: 'Atrasadas', valor: 3, href: '/a?prazo=Atrasada', tom: 'problema' as const },
]
const TOTAL = { rotulo: 'atividades abertas', valor: 12, href: '/a?status=abertas' }

describe('Composicao', () => {
  it('mostra o total e leva à lista dele', () => {
    render(<Composicao total={TOTAL} partes={PARTES} />)
    const total = screen.getByRole('link', { name: '12 atividades abertas' })
    expect(total).toHaveAttribute('href', '/a?status=abertas')
    expect(within(total).getByText('12')).toHaveClass('font-mono')
  })

  it('a barra divide o total na proporção de cada parte', () => {
    render(<Composicao total={TOTAL} partes={PARTES} />)
    const barra = screen.getByRole('img', { name: /atividades abertas/ })
    expect(barra).toHaveAccessibleName('12 atividades abertas: No prazo 6, Próximas do prazo 3, Atrasadas 3')
    const larguras = [...barra.querySelectorAll<HTMLElement>('[data-parte]')].map((p) => p.style.width)
    expect(larguras).toEqual(['50%', '25%', '25%'])
  })

  it('a legenda tem cada parte com o número e o link da lista filtrada', () => {
    render(<Composicao total={TOTAL} partes={PARTES} />)
    expect(screen.getByRole('link', { name: 'Atrasadas: 3' })).toHaveAttribute('href', '/a?prazo=Atrasada')
    expect(screen.getByRole('link', { name: 'Atrasadas: 3' })).toHaveAttribute('data-tom', 'problema')
  })

  it('total zero: a barra fica vazia, sem divisão por zero', () => {
    render(<Composicao total={{ ...TOTAL, valor: 0 }} partes={PARTES.map((p) => ({ ...p, valor: 0 }))} />)
    const barra = screen.getByRole('img', { name: /atividades abertas/ })
    expect(barra.querySelectorAll('[data-parte]')).toHaveLength(0)
  })

  it('o complemento fica numa linha à parte, fora da barra', () => {
    render(
      <Composicao total={TOTAL} partes={PARTES} complemento={{ rotulo: 'Concluídas', valor: 9, href: '/a?status=Conc' }} />,
    )
    expect(screen.getByRole('link', { name: 'Concluídas: 9' })).toHaveAttribute('href', '/a?status=Conc')
    expect(screen.getByRole('img', { name: /atividades abertas/ })).not.toHaveAccessibleName(/Concluídas/)
  })
})
