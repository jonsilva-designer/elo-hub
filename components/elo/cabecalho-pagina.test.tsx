import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CabecalhoPagina } from './cabecalho-pagina'

describe('CabecalhoPagina', () => {
  it('mostra título h1, contexto e ações', () => {
    render(<CabecalhoPagina titulo="Contratos" contexto="24 vigentes" acoes={<button>Novo</button>} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Contratos' })).toBeInTheDocument()
    expect(screen.getByText('24 vigentes')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Novo' })).toBeInTheDocument()
  })

  it('funciona só com o título', () => {
    render(<CabecalhoPagina titulo="Início" />)
    expect(screen.getByRole('heading', { level: 1, name: 'Início' })).toBeInTheDocument()
  })
})
