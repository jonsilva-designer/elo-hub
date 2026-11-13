import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MolduraPublica } from './moldura-publica'

describe('MolduraPublica', () => {
  it('mostra o logo e os filhos', () => {
    render(
      <MolduraPublica>
        <p>Conteúdo público</p>
      </MolduraPublica>,
    )
    expect(screen.getByText('Conteúdo público')).toBeInTheDocument()
    expect(screen.getByAltText('ELO HUB')).toBeInTheDocument()
  })
})
