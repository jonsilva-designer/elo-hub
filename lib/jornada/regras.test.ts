import { describe, expect, it } from 'vitest'
import type { LinhaEtapa, StatusEtapa } from '@/lib/dados/tipos'
import {
  ETAPAS,
  MOTIVO_COM_DOCUMENTO,
  MOTIVO_ULTIMA_APLICAVEL,
  etapaAtual,
  etapaPedeJustificativa,
  mudancasDaEtapa,
  podeAtualizarEtapa,
  progressoDaJornada,
} from './regras'

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

describe('mudanças de etapa por perfil (PRD 6.1, DF-24, DF-49, RN-23, critério 16)', () => {
  const aberto = 'Em andamento' as const
  const todasNaoIniciadas = () => jornada('Não iniciada', 'Não iniciada', 'Não iniciada', 'Não iniciada', 'Não iniciada')

  /** Os destinos da etapa Diagnosticar com o status dado, com as outras quatro Não iniciadas. */
  const destinosDe = (status: StatusEtapa, perfil: 'Administrador' | 'Equipe') => {
    const etapas = jornada(status, 'Não iniciada', 'Não iniciada', 'Não iniciada', 'Não iniciada')
    return mudancasDaEtapa(etapas[0], etapas, perfil, aberto)
  }

  it('Não iniciada: a Equipe inicia ou conclui; o Administrador também marca Não aplicável', () => {
    expect(destinosDe('Não iniciada', 'Equipe')).toEqual({ destinos: ['Em andamento', 'Concluída'], motivo: null })
    expect(destinosDe('Não iniciada', 'Administrador')).toEqual({
      destinos: ['Em andamento', 'Concluída', 'Não aplicável'],
      motivo: null,
    })
  })

  it('Em andamento: os dois perfis desfazem o início ou concluem', () => {
    for (const perfil of ['Equipe', 'Administrador'] as const) {
      expect(destinosDe('Em andamento', perfil)).toEqual({ destinos: ['Não iniciada', 'Concluída'], motivo: null })
    }
  })

  it('Concluída: só o Administrador reabre', () => {
    expect(destinosDe('Concluída', 'Equipe')).toEqual({ destinos: [], motivo: null })
    expect(destinosDe('Concluída', 'Administrador')).toEqual({ destinos: ['Não iniciada', 'Em andamento'], motivo: null })
  })

  it('Não aplicável: só o Administrador corrige', () => {
    expect(destinosDe('Não aplicável', 'Equipe')).toEqual({ destinos: [], motivo: null })
    expect(destinosDe('Não aplicável', 'Administrador')).toEqual({
      destinos: ['Não iniciada', 'Em andamento'],
      motivo: null,
    })
  })

  it('a última etapa aplicável não vira Não aplicável (DF-49, ponto de atenção 2)', () => {
    const etapas = jornada('Não iniciada', 'Não aplicável', 'Não aplicável', 'Não aplicável', 'Não aplicável')
    expect(mudancasDaEtapa(etapas[0], etapas, 'Administrador', aberto)).toEqual({
      destinos: ['Em andamento', 'Concluída'],
      motivo: MOTIVO_ULTIMA_APLICAVEL,
    })
  })

  it('etapa com documento não vira Não aplicável (DF-49)', () => {
    const etapas = todasNaoIniciadas()
    expect(mudancasDaEtapa(etapas[0], etapas, 'Administrador', aberto, true)).toEqual({
      destinos: ['Em andamento', 'Concluída'],
      motivo: MOTIVO_COM_DOCUMENTO,
    })
  })

  it('escopo fechado não tem destino, para os dois perfis (RN-23)', () => {
    const etapas = todasNaoIniciadas()
    for (const status of ['Concluído', 'Cancelado'] as const) {
      for (const perfil of ['Equipe', 'Administrador'] as const) {
        expect(mudancasDaEtapa(etapas[0], etapas, perfil, status)).toEqual({ destinos: [], motivo: null })
      }
    }
  })

  it('quem pode atualizar a etapa', () => {
    const etapas = jornada('Concluída', 'Não aplicável', 'Em andamento', 'Não iniciada', 'Não iniciada')
    expect(podeAtualizarEtapa(etapas[0], 'Equipe', aberto)).toBe(false)
    expect(podeAtualizarEtapa(etapas[1], 'Equipe', aberto)).toBe(false)
    expect(podeAtualizarEtapa(etapas[2], 'Equipe', aberto)).toBe(true)
    expect(podeAtualizarEtapa(etapas[3], 'Equipe', aberto)).toBe(true)
    expect(podeAtualizarEtapa(etapas[0], 'Administrador', aberto)).toBe(true)
    expect(podeAtualizarEtapa(etapas[1], 'Administrador', aberto)).toBe(true)
    for (const perfil of ['Equipe', 'Administrador'] as const) {
      expect(podeAtualizarEtapa(etapas[3], perfil, 'Cancelado')).toBe(false)
      expect(podeAtualizarEtapa(etapas[3], perfil, 'Concluído')).toBe(false)
    }
  })

  it('a reabertura e a correção pedem justificativa; as mudanças listadas, não (RN-22)', () => {
    expect(etapaPedeJustificativa('Concluída', 'Em andamento')).toBe(true)
    expect(etapaPedeJustificativa('Concluída', 'Não iniciada')).toBe(true)
    expect(etapaPedeJustificativa('Não aplicável', 'Em andamento')).toBe(true)
    expect(etapaPedeJustificativa('Não iniciada', 'Concluída')).toBe(false)
    expect(etapaPedeJustificativa('Em andamento', 'Concluída')).toBe(false)
    expect(etapaPedeJustificativa('Em andamento', 'Não iniciada')).toBe(false)
    expect(etapaPedeJustificativa('Não aplicável', 'Não iniciada')).toBe(false)
    expect(etapaPedeJustificativa('Não iniciada', 'Não aplicável')).toBe(false)
    expect(etapaPedeJustificativa('Concluída', 'Concluída')).toBe(false)
  })
})
