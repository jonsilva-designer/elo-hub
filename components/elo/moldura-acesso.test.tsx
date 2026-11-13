import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MolduraAcesso } from './moldura-acesso'

function renderizar(className?: string) {
  return render(
    <MolduraAcesso titulo="Entrar" descricao="Acesse a Plataforma ELO com seu e-mail e senha." className={className}>
      <p>Conteúdo do formulário</p>
    </MolduraAcesso>,
  )
}

const classes = (el: Element) => (el as HTMLElement).className.split(' ')

describe('MolduraAcesso', () => {
  it('mostra o logo, o título, a descrição e os filhos', () => {
    renderizar()
    const logo = screen.getByAltText('ELO HUB')
    expect(logo).toHaveAttribute('loading', 'eager')
    // Sem esticar na largura da coluna: centralizado no celular, à esquerda em tela larga, na largura do conteúdo.
    expect(classes(logo)).toContain('w-auto')
    expect(classes(logo.parentElement!)).toEqual(
      expect.arrayContaining(['flex', 'max-w-sm', 'justify-center', 'lg:landscape:justify-start']),
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Entrar' })).toBeInTheDocument()
    expect(screen.getByText('Acesse a Plataforma ELO com seu e-mail e senha.')).toBeInTheDocument()
    expect(screen.getByText('Conteúdo do formulário')).toBeInTheDocument()
  })

  it('a imagem dos elos é decorativa e só aparece em tela larga e deitada', () => {
    const { container } = renderizar()
    const involucro = container.querySelector('[data-imagem-acesso]') as HTMLElement
    expect(classes(involucro)).toEqual(expect.arrayContaining(['hidden', 'lg:landscape:block']))
    const imagem = involucro.querySelector('img') as HTMLImageElement
    expect(imagem).toHaveAttribute('alt', '')
    expect(imagem.closest('.rounded-xl')).not.toBeNull()
  })

  it('divide a tela em duas colunas iguais em tela larga e deitada, e ocupa a tela toda', () => {
    const { container } = renderizar()
    expect(classes(container.firstElementChild!)).toEqual(
      expect.arrayContaining(['grid', 'lg:landscape:grid-cols-2', 'min-h-dvh']),
    )
  })

  it('aceita className para caber num quadro reduzido', () => {
    const { container } = renderizar('min-h-0')
    const raiz = classes(container.firstElementChild!)
    expect(raiz).toContain('min-h-0')
    expect(raiz).not.toContain('min-h-dvh')
  })

  it('o formulário fica direto sobre o fundo papel, sem cartão', () => {
    const { container } = renderizar()
    const raiz = container.firstElementChild!
    let el: Element | null = screen.getByText('Conteúdo do formulário')
    while (el && el !== raiz) {
      expect(classes(el)).not.toContain('bg-card')
      el = el.parentElement
    }
  })
})
