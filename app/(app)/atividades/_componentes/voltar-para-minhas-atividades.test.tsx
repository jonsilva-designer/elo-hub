import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CHAVE_FILTROS_DAS_ATIVIDADES } from '@/lib/atividades/filtros'
import { VoltarParaMinhasAtividades } from './voltar-para-minhas-atividades'

beforeEach(() => sessionStorage.clear())
afterEach(() => vi.restoreAllMocks())

const link = () => screen.getByRole('link', { name: /Voltar para Minhas atividades/ })

describe('VoltarParaMinhasAtividades (parte 4, 5.7)', () => {
  it('guarda os filtros com uma chave própria', () => {
    expect(CHAVE_FILTROS_DAS_ATIVIDADES).toBe('elo:filtros-atividades')
  })

  it('sem filtros guardados, volta para a lista', () => {
    render(<VoltarParaMinhasAtividades />)
    expect(link()).toHaveAttribute('href', '/minhas-atividades')
  })

  it('volta para a lista com os filtros que estavam aplicados (CA-16.2)', () => {
    sessionStorage.setItem(CHAVE_FILTROS_DAS_ATIVIDADES, 'responsavel=todos&prazo=Atrasada')
    render(<VoltarParaMinhasAtividades />)
    expect(link()).toHaveAttribute('href', '/minhas-atividades?responsavel=todos&prazo=Atrasada')
  })

  it('sem o armazenamento do navegador, volta para a lista', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })
    render(<VoltarParaMinhasAtividades />)
    expect(link()).toHaveAttribute('href', '/minhas-atividades')
  })
})
