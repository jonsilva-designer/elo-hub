import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Campo } from './campo'
import { CampoArquivo } from './campo-arquivo'

describe('CampoArquivo', () => {
  it('começa sem arquivo', () => {
    render(<CampoArquivo id="a" onChange={() => {}} />)
    expect(screen.getByText('Nenhum arquivo escolhido')).toBeInTheDocument()
    expect(screen.getByText('Escolher arquivo')).toBeInTheDocument()
  })

  it('mostra o nome do arquivo e entrega o arquivo', async () => {
    const onChange = vi.fn()
    render(
      <Campo rotulo="Relatório">
        {(p) => <CampoArquivo {...p} aceitar=".pdf" onChange={onChange} />}
      </Campo>,
    )
    const arquivo = new File(['x'], 'relatorio.pdf', { type: 'application/pdf' })
    const campo = screen.getByLabelText('Relatório')
    expect(campo).toHaveAttribute('accept', '.pdf')
    await userEvent.upload(campo, arquivo)
    expect(screen.getByText('relatorio.pdf')).toBeInTheDocument()
    expect(onChange).toHaveBeenCalledWith(arquivo)
  })
})
