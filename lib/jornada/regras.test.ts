import { describe, expect, it } from 'vitest'
import type { LinhaEtapa, StatusEtapa } from '@/lib/dados/tipos'
import { ETAPAS, etapaAtual, progressoDaJornada } from './regras'

/** As 5 etapas, na ordem, com os status dados. */
const jornada = (...status: StatusEtapa[]): LinhaEtapa[] =>
  ETAPAS.map((etapa, i) => ({
    etapa,
    status: status[i],
    responsavelId: null,
    inicio: null,
    conclusao: status[i] === 'Concluída' ? '2026-10-01' : null,
    observacoes: '',
  }))

describe('Jornada ELO (RN-08, DF-28, critério 15)', () => {
  it('as etapas oficiais, na ordem', () => {
    expect(ETAPAS).toEqual(['Diagnosticar', 'Estruturar', 'Implementar', 'Monitorar', 'Evoluir'])
  })

  it('sem etapa iniciada: Não iniciada, com as 5 aplicáveis (CN-08.1)', () => {
    const etapas = jornada('Não iniciada', 'Não iniciada', 'Não iniciada', 'Não iniciada', 'Não iniciada')
    expect(etapaAtual(etapas)).toBe('Não iniciada')
    expect(progressoDaJornada(etapas)).toEqual({ concluidas: 0, aplicaveis: 5 })
  })

  it('a Em andamento vale mais que uma Concluída mais adiante (CN-08.2)', () => {
    const etapas = jornada('Concluída', 'Em andamento', 'Concluída', 'Não iniciada', 'Não iniciada')
    expect(etapaAtual(etapas)).toBe('Estruturar')
    expect(progressoDaJornada(etapas)).toEqual({ concluidas: 2, aplicaveis: 5 })
  })

  it('começa em Implementar com as duas primeiras Não aplicáveis, que não contam (CN-08.3)', () => {
    const etapas = jornada('Não aplicável', 'Não aplicável', 'Em andamento', 'Não iniciada', 'Não iniciada')
    expect(etapaAtual(etapas)).toBe('Implementar')
    expect(progressoDaJornada(etapas)).toEqual({ concluidas: 0, aplicaveis: 3 })
  })

  it('sem nenhuma em andamento, vale a última Concluída', () => {
    expect(etapaAtual(jornada('Concluída', 'Concluída', 'Não iniciada', 'Não iniciada', 'Não iniciada'))).toBe('Estruturar')
  })

  it('com duas em andamento, vale a mais avançada', () => {
    expect(etapaAtual(jornada('Concluída', 'Em andamento', 'Não iniciada', 'Em andamento', 'Não iniciada'))).toBe('Monitorar')
  })
})
