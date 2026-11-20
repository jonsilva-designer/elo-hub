import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import NaoEncontrada from './not-found'

describe('página não encontrada', () => {
  it('em português, na moldura pública, com o caminho de volta que serve também a quem não entrou (revisão do código)', () => {
    render(<NaoEncontrada />)
    expect(screen.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeInTheDocument()
    expect(screen.getByText('Confira o endereço ou volte ao início.')).toBeInTheDocument()
    // A raiz manda ao Início quem entrou e ao login quem não entrou; o padrão visual exigia login.
    expect(screen.getByRole('link', { name: 'Ir para o início' })).toHaveAttribute('href', '/')
    expect(screen.getByAltText('ELO HUB')).toBeInTheDocument()
  })
})
