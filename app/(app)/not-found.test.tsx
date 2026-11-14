import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import NaoEncontradoNaPlataforma, { metadata } from './not-found'

describe('não encontrado dentro da plataforma', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Não encontrado | Plataforma ELO')
  })

  it('diz que o endereço não está disponível, sem revelar se o registro existe, e leva ao Início', () => {
    render(<NaoEncontradoNaPlataforma />)
    expect(screen.getByRole('heading', { level: 1, name: 'Não encontrado' })).toBeInTheDocument()
    expect(screen.getByText('Este endereço não existe ou não está disponível para você.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir para o Início' })).toHaveAttribute('href', '/inicio')
  })
})
