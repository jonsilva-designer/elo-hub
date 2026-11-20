import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CLASSE_ABA, Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

// Achado do Jonathan em 14/11/2026: a lista de abas mostrava setas de rolagem. A aba descia 1px (-mb-px)
// para o sublinhado cobrir a borda da lista, e esse 1px fazia a lista rolar na vertical.
function montar() {
  render(
    <Tabs defaultValue="a">
      <TabsList aria-label="Seções">
        <TabsTrigger value="a">Resumo</TabsTrigger>
        <TabsTrigger value="b">Histórico</TabsTrigger>
      </TabsList>
      <TabsContent value="a">Conteúdo</TabsContent>
    </Tabs>,
  )
}

describe('abas', () => {
  it('a linha de baixo é desenhada por dentro da lista, e a aba não passa da altura dela', () => {
    montar()
    const lista = screen.getByRole('tablist')
    expect(lista.className).toContain('shadow-[inset_0_-1px_0_var(--color-divisoria)]')
    expect(lista).not.toHaveClass('border-b')
    for (const aba of screen.getAllByRole('tab')) expect(aba).not.toHaveClass('-mb-px')
  })

  it('a lista não mostra barra nem setas de rolagem; em tela estreita, rola com o dedo', () => {
    montar()
    const lista = screen.getByRole('tablist')
    expect(lista).toHaveClass('overflow-x-auto', 'overflow-y-hidden', '[scrollbar-width:none]')
  })
})

describe('Abas, passar o mouse e pressionado (padrão 7)', () => {
  it('passar o mouse escurece o texto e pressionar mostra o sublinhado no tom da borda de campo', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Visão geral</TabsTrigger>
          <TabsTrigger value="b">Contratos</TabsTrigger>
        </TabsList>
      </Tabs>,
    )
    const classes = screen.getByRole('tab', { name: 'Contratos' }).className.split(' ')
    expect(classes).toContain('not-data-active:hover:text-foreground')
    // Na aba ativa o sublinhado já é azul-marinho; no desabilitado não há pressionado.
    expect(classes).toContain('not-disabled:not-data-active:active:border-input')
    expect(classes).toContain('not-disabled:not-data-active:active:text-foreground')
  })
})

describe('aba, revisão do código', () => {
  it('passar o mouse ou pressionar a aba ativa não troca o azul-marinho pelo texto comum', () => {
    const classes = CLASSE_ABA.split(' ')
    expect(classes).toContain('not-data-active:hover:text-foreground')
    expect(classes).toContain('not-disabled:not-data-active:active:text-foreground')
    expect(classes).not.toContain('hover:text-foreground')
    expect(classes).not.toContain('not-disabled:active:text-foreground')
  })
})
