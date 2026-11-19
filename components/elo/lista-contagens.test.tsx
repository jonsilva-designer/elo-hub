import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ListaContagens } from './lista-contagens'

describe('ListaContagens', () => {
  it('uma linha por item, com o nome e o número, levando à lista filtrada', () => {
    render(
      <ListaContagens
        itens={[
          { rotulo: 'Em andamento', valor: 4, href: '/escopos?status=Em+andamento' },
          { rotulo: 'Planejado', valor: 0, href: '/escopos?status=Planejado' },
        ]}
      />,
    )
    const linha = screen.getByRole('link', { name: 'Em andamento: 4' })
    expect(linha).toHaveAttribute('href', '/escopos?status=Em+andamento')
    expect(within(linha).getByText('4')).toHaveClass('font-mono')
    expect(screen.getByRole('link', { name: 'Planejado: 0' })).toBeInTheDocument()
    expect(linha.querySelector('[data-barra]')).toBeNull()
  })
})
