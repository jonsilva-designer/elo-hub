import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { CHAVE_FILTROS_DOS_ESPECIALISTAS } from '@/lib/especialistas/filtros'
import { enderecoDosEspecialistas, VoltarParaEspecialistas } from './voltar-para-especialistas'

beforeEach(() => sessionStorage.clear())

const link = () => screen.getByRole('link', { name: /Voltar para Especialistas/ })

describe('VoltarParaEspecialistas (parte 5, 5.4)', () => {
  it('sem filtros guardados, volta para a lista', () => {
    render(<VoltarParaEspecialistas />)
    expect(link()).toHaveAttribute('href', '/especialistas')
  })

  it('volta para a lista com os filtros que estavam aplicados', () => {
    sessionStorage.setItem(CHAVE_FILTROS_DOS_ESPECIALISTAS, 'origem=Site')
    render(<VoltarParaEspecialistas />)
    expect(link()).toHaveAttribute('href', '/especialistas?origem=Site')
  })
})

describe('enderecoDosEspecialistas, revisão do código', () => {
  it('a lista com os filtros guardados, para voltar depois de excluir ou cadastrar', () => {
    sessionStorage.setItem(CHAVE_FILTROS_DOS_ESPECIALISTAS, 'origem=Site')
    expect(enderecoDosEspecialistas()).toBe('/especialistas?origem=Site')
    sessionStorage.clear()
    expect(enderecoDosEspecialistas()).toBe('/especialistas')
  })
})
