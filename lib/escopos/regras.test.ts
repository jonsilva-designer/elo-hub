import { describe, expect, it } from 'vitest'
import type { LinhaEtapa } from '@/lib/dados/tipos'
import { ETAPAS } from '@/lib/jornada/regras'
import {
  CRITICIDADES,
  PRIORIDADES,
  STATUS_ESCOPO,
  STATUS_ESCOPO_ABERTOS,
  escopoFechado,
  jornadaMexida,
  transicaoListadaEscopo,
} from './regras'

/** As 5 etapas que o sistema cria com o escopo: Não iniciadas e vazias. */
const etapasNovas = (): LinhaEtapa[] =>
  ETAPAS.map((etapa) => ({ etapa, status: 'Não iniciada', responsavelId: null, inicio: null, conclusao: null, observacoes: '' }))

describe('regras do escopo (PRD 6.1, RN-17)', () => {
  it('as listas na ordem do PRD', () => {
    expect(STATUS_ESCOPO).toEqual(['Planejado', 'Em andamento', 'Em espera', 'Concluído', 'Cancelado'])
    expect(STATUS_ESCOPO_ABERTOS).toEqual(['Planejado', 'Em andamento', 'Em espera'])
    expect(CRITICIDADES).toEqual(['Baixa', 'Moderada', 'Alta', 'Crítica'])
    expect(PRIORIDADES).toEqual(['Baixa', 'Média', 'Alta'])
  })

  it('Concluído e Cancelado são fechados; os outros, abertos', () => {
    expect(escopoFechado('Concluído')).toBe(true)
    expect(escopoFechado('Cancelado')).toBe(true)
    for (const s of STATUS_ESCOPO_ABERTOS) expect(escopoFechado(s)).toBe(false)
  })

  it('as transições listadas e o mesmo status passam', () => {
    expect(transicaoListadaEscopo('Planejado', 'Em andamento')).toBe(true)
    expect(transicaoListadaEscopo('Em andamento', 'Em espera')).toBe(true)
    expect(transicaoListadaEscopo('Em espera', 'Em andamento')).toBe(true)
    expect(transicaoListadaEscopo('Planejado', 'Planejado')).toBe(true)
  })

  it('voltar para Planejado é correção', () => {
    expect(transicaoListadaEscopo('Em andamento', 'Planejado')).toBe(false)
    expect(transicaoListadaEscopo('Em espera', 'Planejado')).toBe(false)
  })

  it('a Jornada recém-criada não conta como mexida (5.9, Excluir)', () => {
    expect(jornadaMexida(etapasNovas())).toBe(false)
  })

  it('uma observação, um responsável ou uma etapa Não aplicável contam como mexida', () => {
    const comObservacao = etapasNovas()
    comObservacao[2] = { ...comObservacao[2], observacoes: 'Reunião marcada' }
    expect(jornadaMexida(comObservacao)).toBe(true)

    const comResponsavel = etapasNovas()
    comResponsavel[0] = { ...comResponsavel[0], responsavelId: 'usr-rafael' }
    expect(jornadaMexida(comResponsavel)).toBe(true)

    const naoAplicavel = etapasNovas()
    naoAplicavel[4] = { ...naoAplicavel[4], status: 'Não aplicável' }
    expect(jornadaMexida(naoAplicavel)).toBe(true)
  })
})
