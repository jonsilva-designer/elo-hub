import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BarraFiltros } from './barra-filtros'

describe('BarraFiltros', () => {
  it('digitar em Buscar chama aoBuscar', async () => {
    const u = userEvent.setup()
    const aoBuscar = vi.fn()
    render(<BarraFiltros busca="" aoBuscar={aoBuscar} />)
    await u.type(screen.getByRole('textbox', { name: 'Buscar' }), 'a')
    expect(aoBuscar).toHaveBeenCalledWith('a')
  })

  it('mostra o valor da busca e o slot de filtros', () => {
    render(<BarraFiltros busca="horizonte" aoBuscar={() => {}} filtros={<span>Meu filtro</span>} />)
    expect(screen.getByRole('textbox', { name: 'Buscar' })).toHaveValue('horizonte')
    expect(screen.getByText('Meu filtro')).toBeInTheDocument()
  })

  it('Exportar só aparece com aoExportar e o chama', async () => {
    const u = userEvent.setup()
    const aoExportar = vi.fn()
    const { rerender } = render(<BarraFiltros busca="" aoBuscar={() => {}} />)
    expect(screen.queryByRole('button', { name: 'Exportar' })).not.toBeInTheDocument()
    rerender(<BarraFiltros busca="" aoBuscar={() => {}} aoExportar={aoExportar} />)
    await u.click(screen.getByRole('button', { name: 'Exportar' }))
    expect(aoExportar).toHaveBeenCalledTimes(1)
  })
})
