import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
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
      <TooltipProvider>
        <Campo rotulo="Relatório">
          {(p) => <CampoArquivo {...p} aceitar=".pdf" onChange={onChange} />}
        </Campo>
      </TooltipProvider>,
    )
    const arquivo = new File(['x'], 'relatorio.pdf', { type: 'application/pdf' })
    const campo = screen.getByLabelText('Relatório')
    expect(campo).toHaveAttribute('accept', '.pdf')
    await userEvent.upload(campo, arquivo)
    expect(screen.getByText('relatorio.pdf')).toBeInTheDocument()
    expect(onChange).toHaveBeenCalledWith(arquivo)
  })

  it('sem arquivo, não há como remover', () => {
    render(<CampoArquivo id="a" onChange={() => {}} />)
    expect(screen.queryByRole('button', { name: 'Remover arquivo' })).not.toBeInTheDocument()
  })

  it('"Remover arquivo" limpa o campo e entrega null', async () => {
    const onChange = vi.fn()
    render(
      <TooltipProvider>
        <Campo rotulo="Relatório">
          {(p) => <CampoArquivo {...p} onChange={onChange} />}
        </Campo>
      </TooltipProvider>,
    )
    const campo = screen.getByLabelText('Relatório') as HTMLInputElement
    await userEvent.upload(campo, new File(['x'], 'relatorio.pdf', { type: 'application/pdf' }))
    const remover = screen.getByRole('button', { name: 'Remover arquivo' })
    expect(remover).toHaveAttribute('type', 'button')
    await userEvent.click(remover)
    expect(onChange).toHaveBeenLastCalledWith(null)
    expect(campo.files).toHaveLength(0)
    expect(screen.getByText('Nenhum arquivo escolhido')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remover arquivo' })).not.toBeInTheDocument()
    expect(campo).toHaveFocus()
  })

  it('o botão escurece ao passar o mouse e mais ao pressionar, só com o campo habilitado', () => {
    render(<CampoArquivo id="a" onChange={() => {}} />)
    const classes = screen.getByText('Escolher arquivo').className.split(' ')
    expect(classes).toContain('peer-enabled:hover:bg-surface-hover')
    expect(classes).toContain('peer-enabled:active:bg-surface-active')
    for (const c of classes.filter((c) => /(^|:)(hover|active):/.test(c))) {
      expect(c.startsWith('peer-enabled:'), c).toBe(true)
    }
  })
})
