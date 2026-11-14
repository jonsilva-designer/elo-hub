import { fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ModalidadeDeFoco } from './modalidade-de-foco'

const modalidade = () => document.documentElement.dataset.modalidade

afterEach(() => {
  delete document.documentElement.dataset.modalidade
})

describe('ModalidadeDeFoco (padrão 4.8)', () => {
  it('um clique marca a página como ponteiro', () => {
    render(<ModalidadeDeFoco />)
    fireEvent.pointerDown(document.body)
    expect(modalidade()).toBe('ponteiro')
  })

  it('uma tecla volta a marcar teclado', () => {
    render(<ModalidadeDeFoco />)
    fireEvent.pointerDown(document.body)
    fireEvent.keyDown(document.body, { key: 'Tab' })
    expect(modalidade()).toBe('teclado')
  })

  it('só a tecla de modificação, como Ctrl ou Alt sozinhos, não muda nada', () => {
    render(<ModalidadeDeFoco />)
    fireEvent.pointerDown(document.body)
    fireEvent.keyDown(document.body, { key: 'Control', ctrlKey: true })
    expect(modalidade()).toBe('ponteiro')
  })

  it('ao sair da tela, para de acompanhar', () => {
    const { unmount } = render(<ModalidadeDeFoco />)
    unmount()
    fireEvent.pointerDown(document.body)
    expect(modalidade()).toBeUndefined()
  })
})
