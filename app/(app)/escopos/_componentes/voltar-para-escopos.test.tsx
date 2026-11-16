import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CHAVE_FILTROS_DOS_ESCOPOS } from '@/lib/escopos/filtros'
import { VoltarParaEscopos } from './voltar-para-escopos'

beforeEach(() => sessionStorage.clear())
afterEach(() => vi.restoreAllMocks())

const link = () => screen.getByRole('link', { name: /Voltar para Escopos/ })

describe('VoltarParaEscopos (parte 3, 5.7)', () => {
  it('sem filtros guardados, volta para a lista', () => {
    render(<VoltarParaEscopos />)
    expect(link()).toHaveAttribute('href', '/escopos')
  })

  it('volta para a lista com os filtros que estavam aplicados', () => {
    sessionStorage.setItem(CHAVE_FILTROS_DOS_ESCOPOS, 'busca=ct-2026&criticidade=Crítica')
    render(<VoltarParaEscopos />)
    expect(link()).toHaveAttribute('href', '/escopos?busca=ct-2026&criticidade=Crítica')
  })

  it('sem o armazenamento do navegador, volta para a lista', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })
    render(<VoltarParaEscopos />)
    expect(link()).toHaveAttribute('href', '/escopos')
  })
})
