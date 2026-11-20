import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useFiltrosDaLista } from './filtros-da-lista'

type Filtros = { status: string }
const escrever = (f: Filtros) => (f.status ? `status=${f.status}` : '')

// O Next mantém a lista montada quando só a busca do endereço muda (revisão do código, 20/11/2026).
describe('useFiltrosDaLista', () => {
  it('quando os filtros do endereço mudam de valor, a lista volta a eles', () => {
    const { result, rerender } = renderHook(({ iniciais }) => useFiltrosDaLista(iniciais, escrever), {
      initialProps: { iniciais: { status: 'Cancelado' } },
    })
    expect(result.current[0]).toEqual({ status: 'Cancelado' })
    rerender({ iniciais: { status: '' } })
    expect(result.current[0]).toEqual({ status: '' })
  })

  it('com os mesmos filtros do endereço num objeto novo, o que a pessoa escolheu fica', () => {
    const { result, rerender } = renderHook(({ iniciais }) => useFiltrosDaLista(iniciais, escrever), {
      initialProps: { iniciais: { status: '' } },
    })
    act(() => result.current[1]({ status: 'Ativo' }))
    rerender({ iniciais: { status: '' } })
    expect(result.current[0]).toEqual({ status: 'Ativo' })
  })
})
