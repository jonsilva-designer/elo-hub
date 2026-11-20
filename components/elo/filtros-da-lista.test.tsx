import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useFiltrosDaLista } from './filtros-da-lista'


// O Next mantém a lista montada quando só a busca do endereço muda (revisão do código, 20/11/2026).
describe('useFiltrosDaLista', () => {
  it('quando os filtros do endereço mudam de valor, a lista volta a eles', () => {
    const { result, rerender } = renderHook(({ iniciais }) => useFiltrosDaLista(iniciais), {
      initialProps: { iniciais: { status: 'Cancelado' } },
    })
    expect(result.current[0]).toEqual({ status: 'Cancelado' })
    rerender({ iniciais: { status: '' } })
    expect(result.current[0]).toEqual({ status: '' })
  })

  it('depois de a pessoa escolher um filtro, o link do menu para a lista sem filtros limpa a escolha', () => {
    const { result, rerender } = renderHook(({ iniciais }) => useFiltrosDaLista(iniciais), {
      initialProps: { iniciais: { status: '' } },
    })
    act(() => result.current[1]({ status: 'Inativo' }))
    // O menu leva à lista sem filtros: o servidor manda os filtros vazios de novo, num objeto novo.
    rerender({ iniciais: { status: '' } })
    expect(result.current[0]).toEqual({ status: '' })
  })

  it('a escolha da pessoa não traz página nova, e não é desfeita', () => {
    const { result, rerender } = renderHook(({ iniciais }) => useFiltrosDaLista(iniciais), {
      initialProps: { iniciais: { status: '' } },
    })
    const pagina = { status: '' }
    rerender({ iniciais: pagina })
    act(() => result.current[1]({ status: 'Ativo' }))
    // Sem página nova do servidor, o mesmo objeto de filtros continua chegando.
    rerender({ iniciais: pagina })
    expect(result.current[0]).toEqual({ status: 'Ativo' })
  })
})
