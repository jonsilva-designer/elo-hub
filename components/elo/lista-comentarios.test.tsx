import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ListaComentarios } from './lista-comentarios'

const COMENTARIO = {
  id: 'c1',
  autor: 'Rafael Souza',
  dataHora: '2026-04-03T10:20:00-03:00',
  tipo: 'Comentário' as const,
  texto: 'Pedi a lista das certidões.',
  nomeEspecialista: '',
  dataContato: null,
}

describe('ListaComentarios (parte 5, 5.13)', () => {
  it('mostra o autor, a data e a hora em fonte de números, e o texto (CA-09.6)', () => {
    const { container } = render(<ListaComentarios comentarios={[COMENTARIO]} />)
    expect(screen.getByText('Rafael Souza')).toBeInTheDocument()
    expect(screen.getByText('Pedi a lista das certidões.')).toBeInTheDocument()
    expect(container.querySelector('.font-mono')).toHaveTextContent('03/04/2026 10:20')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('o contato com especialista mostra o especialista e a data do contato (DF-30)', () => {
    render(
      <ListaComentarios
        comentarios={[
          { ...COMENTARIO, id: 'c2', tipo: 'Contato com especialista', nomeEspecialista: 'Beatriz Fontes', dataContato: '2026-04-06' },
        ]}
      />,
    )
    expect(screen.getByText(/Contato com especialista/)).toHaveTextContent('Contato com especialista · Beatriz Fontes · em 06/04/2026')
  })

  it('sem comentários, o vazio', () => {
    render(<ListaComentarios comentarios={[]} />)
    expect(screen.getByText('Nenhum comentário.')).toBeInTheDocument()
  })
})
