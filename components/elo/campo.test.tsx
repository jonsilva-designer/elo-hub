import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Input } from '@/components/ui/input'
import { Campo } from './campo'

describe('Campo', () => {
  it('liga o rótulo, a ajuda e o erro ao campo', () => {
    render(
      <Campo rotulo="Nome do cliente" ajuda="Como aparece nos relatórios" erro="Informe o nome" obrigatorio>
        {(p) => <Input {...p} />}
      </Campo>,
    )
    const campo = screen.getByLabelText(/Nome do cliente/)
    expect(campo).toHaveAccessibleDescription(/Como aparece nos relatórios/)
    expect(campo).toHaveAccessibleDescription(/Informe o nome/)
    expect(campo).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Informe o nome')
  })

  it('marca o obrigatório com texto acessível', () => {
    render(
      <Campo rotulo="Nome do cliente" obrigatorio>
        {(p) => <Input {...p} />}
      </Campo>,
    )
    expect(screen.getByText('(obrigatório)')).toBeInTheDocument()
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true')
  })

  it('sem erro, não marca o campo como inválido', () => {
    render(
      <Campo rotulo="Nome do cliente" ajuda="Dica">
        {(p) => <Input {...p} />}
      </Campo>,
    )
    const campo = screen.getByLabelText('Nome do cliente')
    expect(campo).not.toHaveAttribute('aria-invalid')
    expect(campo).toHaveAccessibleDescription('Dica')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
