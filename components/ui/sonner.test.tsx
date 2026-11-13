import { act, render, screen } from '@testing-library/react'
import { toast } from 'sonner'
import { describe, expect, it } from 'vitest'
import { Toaster } from './sonner'

describe('Toaster', () => {
  it('a área dos avisos e o botão de fechar têm nomes em português', async () => {
    const { container } = render(<Toaster closeButton />)
    act(() => {
      toast('Salvo')
    })
    expect(await screen.findByRole('button', { name: 'Fechar aviso' })).toBeInTheDocument()
    const area = screen.getByRole('region', { name: /^Avisos/ })
    expect(area).toBeInTheDocument()
    const textos = [container.innerHTML, document.body.innerHTML].join(' ')
    expect(textos).not.toMatch(/Notifications|Close toast/)
  })
})
