import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CHAVE_FILTROS_DA_LISTA } from '@/lib/clientes/filtros'
import { VoltarParaClientes } from './voltar-para-clientes'

beforeEach(() => sessionStorage.clear())
afterEach(() => vi.restoreAllMocks())

const link = () => screen.getByRole('link', { name: /Voltar para Clientes/ })

describe('VoltarParaClientes (CA-16.2)', () => {
  it('sem filtros guardados, volta para a lista', () => {
    render(<VoltarParaClientes />)
    expect(link()).toHaveAttribute('href', '/clientes')
  })

  it('volta para a lista com os filtros que estavam aplicados', () => {
    sessionStorage.setItem(CHAVE_FILTROS_DA_LISTA, 'busca=vert&status=Inativo')
    render(<VoltarParaClientes />)
    expect(link()).toHaveAttribute('href', '/clientes?busca=vert&status=Inativo')
  })

  it('sem o armazenamento do navegador, volta para a lista', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })
    render(<VoltarParaClientes />)
    expect(link()).toHaveAttribute('href', '/clientes')
  })
})
