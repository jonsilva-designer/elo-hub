import { describe, expect, it } from 'vitest'
import type { LinhaEtapa, StatusEtapa } from '@/lib/dados/tipos'
import { MOTIVO_ULTIMA_APLICAVEL } from './regras'
import { lerDadosEtapa, MENSAGENS_ETAPA, validarEtapa, type DadosEtapa } from './validacao'

const etapa = (status: StatusEtapa): LinhaEtapa => ({
  etapa: 'Diagnosticar',
  status,
  responsavelId: null,
  inicio: null,
  conclusao: null,
  observacoes: '',
})

const DADOS: DadosEtapa = {
  escopoId: 'esc-x',
  etapa: 'Diagnosticar',
  status: 'Em andamento',
  responsavelId: '',
  inicio: '',
  conclusao: '',
  observacoes: '',
  justificativa: '',
}

const validar = (
  dados: Partial<DadosEtapa>,
  atual: StatusEtapa,
  destinos: StatusEtapa[],
  motivo: string | null = null,
) => validarEtapa({ ...DADOS, ...dados }, { atual: etapa(atual), destinos, motivo, responsaveisPermitidos: ['usr-helena'] })

describe('validarEtapa (parte 3, 5.10)', () => {
  it('as mensagens', () => {
    expect(MENSAGENS_ETAPA.ultimaAplicavel).toBe('Pelo menos uma etapa precisa continuar aplicável.')
    expect(MENSAGENS_ETAPA.fechado).toBe('As etapas não mudam com o escopo fechado.')
  })

  it('a última etapa aplicável não vira Não aplicável (DF-49; ponto de atenção 2)', () => {
    expect(validar({ status: 'Não aplicável' }, 'Não iniciada', ['Em andamento', 'Concluída'], MOTIVO_ULTIMA_APLICAVEL)).toEqual({
      status: MENSAGENS_ETAPA.ultimaAplicavel,
    })
  })

  it('Em andamento e Concluída não viram Não aplicável', () => {
    expect(validar({ status: 'Não aplicável' }, 'Em andamento', ['Não iniciada', 'Concluída'])).toEqual({
      status: MENSAGENS_ETAPA.naoAplicavel,
    })
    expect(validar({ status: 'Não aplicável', justificativa: 'x' }, 'Concluída', ['Não iniciada', 'Em andamento'])).toEqual({
      status: MENSAGENS_ETAPA.naoAplicavel,
    })
  })

  it('o mesmo status sempre pode ficar', () => {
    expect(validar({ status: 'Em andamento' }, 'Em andamento', ['Não iniciada', 'Concluída'])).toEqual({})
  })

  it('o responsável fora do vínculo; vazio pode', () => {
    expect(validar({ responsavelId: 'usr-marcos' }, 'Não iniciada', ['Em andamento'])).toEqual({
      responsavelId: MENSAGENS_ETAPA.responsavelSemVinculo,
    })
    expect(validar({ responsavelId: '' }, 'Não iniciada', ['Em andamento'])).toEqual({})
  })

  it('Concluída pede a data de conclusão; data que não existe dá erro', () => {
    expect(validar({ status: 'Concluída' }, 'Em andamento', ['Concluída'])).toEqual({ conclusao: MENSAGENS_ETAPA.conclusao })
    expect(validar({ status: 'Concluída', conclusao: '2026-13-01' }, 'Em andamento', ['Concluída'])).toEqual({
      conclusao: MENSAGENS_ETAPA.data,
    })
  })
})

describe('lerDadosEtapa', () => {
  it('lê os campos sem espaços nas pontas', () => {
    const fd = new FormData()
    fd.set('etapa', ' Estruturar ')
    fd.set('observacoes', '  Reunião marcada ')
    expect(lerDadosEtapa(fd)).toEqual({ ...DADOS, escopoId: '', etapa: 'Estruturar', status: '', observacoes: 'Reunião marcada' })
  })
})
