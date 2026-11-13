import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Tabs, TabsList, TabsTrigger } from './tabs'

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
    expect(classes).toContain('hover:text-foreground')
    // Na aba ativa o sublinhado já é azul-marinho; no desabilitado não há pressionado.
    expect(classes).toContain('not-disabled:not-data-active:active:border-input')
    expect(classes).toContain('not-disabled:active:text-foreground')
  })
})
