import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Painel } from './painel'

describe('Painel', () => {
  it('é uma região nomeada pelo título, com contagem, ação e conteúdo', () => {
    render(
      <Painel titulo="Alertas" contagem="3 itens" acao={<button>Ver todos</button>}>
        <p>conteúdo</p>
      </Painel>,
    )
    const regiao = screen.getByRole('region', { name: 'Alertas' })
    expect(screen.getByRole('heading', { level: 2, name: 'Alertas' })).toBeInTheDocument()
    expect(regiao).toHaveTextContent('3 itens')
    expect(screen.getByRole('button', { name: 'Ver todos' })).toBeInTheDocument()
    expect(screen.getByText('conteúdo')).toBeInTheDocument()
  })
})
