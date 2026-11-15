import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CHAVE_FILTROS_DOS_CONTRATOS } from '@/lib/contratos/filtros'
import { VoltarParaContratos } from './voltar-para-contratos'

beforeEach(() => sessionStorage.clear())
afterEach(() => vi.restoreAllMocks())

const link = () => screen.getByRole('link', { name: /Voltar para Contratos/ })

describe('VoltarParaContratos (parte 3, 5.6)', () => {
  it('sem filtros guardados, volta para a lista', () => {
    render(<VoltarParaContratos />)
    expect(link()).toHaveAttribute('href', '/contratos')
  })

  it('volta para a lista com os filtros que estavam aplicados', () => {
    sessionStorage.setItem(CHAVE_FILTROS_DOS_CONTRATOS, 'busca=ct-2025&status=Ativo')
    render(<VoltarParaContratos />)
    expect(link()).toHaveAttribute('href', '/contratos?busca=ct-2025&status=Ativo')
  })

  it('sem o armazenamento do navegador, volta para a lista', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })
    render(<VoltarParaContratos />)
    expect(link()).toHaveAttribute('href', '/contratos')
  })
})
