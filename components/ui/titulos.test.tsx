import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from './alert-dialog'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './dialog'
import { Empty, EmptyHeader, EmptyTitle } from './empty'

// Títulos de janela e de estado vazio seguem o título de seção (padrão 4.2): 15px, negrito, azul-marinho.
const TITULO_DE_SECAO = ['text-[15px]', 'font-bold', 'text-primary']

function classes(el: HTMLElement) {
  return el.className.split(' ')
}

describe('títulos no estilo de título de seção', () => {
  it('janela de confirmação', () => {
    render(
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
          <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>,
    )
    const titulo = screen.getByText('Excluir documento?')
    expect(classes(titulo)).toEqual(expect.arrayContaining(TITULO_DE_SECAO))
    expect(classes(titulo)).not.toContain('font-medium')
  })

  it('janela', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Novo cliente</DialogTitle>
          <DialogDescription>Preencha os dados do cliente.</DialogDescription>
        </DialogContent>
      </Dialog>,
    )
    const titulo = screen.getByText('Novo cliente')
    expect(classes(titulo)).toEqual(expect.arrayContaining(TITULO_DE_SECAO))
    expect(classes(titulo)).not.toContain('font-medium')
  })

  it('estado vazio', () => {
    render(
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Nenhum contrato cadastrado</EmptyTitle>
        </EmptyHeader>
      </Empty>,
    )
    const titulo = screen.getByText('Nenhum contrato cadastrado')
    expect(classes(titulo)).toEqual(expect.arrayContaining(TITULO_DE_SECAO))
    expect(classes(titulo)).not.toContain('font-medium')
  })
})
