import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import NaoEncontrada from './not-found'

describe('página não encontrada', () => {
  it('em português, na moldura pública, com o link para o padrão visual', () => {
    render(<NaoEncontrada />)
    expect(screen.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeInTheDocument()
    expect(screen.getByText('Algumas telas do protótipo ainda estão em construção.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver o padrão visual' })).toHaveAttribute('href', '/designsystem')
    expect(screen.getByAltText('ELO HUB')).toBeInTheDocument()
  })
})
