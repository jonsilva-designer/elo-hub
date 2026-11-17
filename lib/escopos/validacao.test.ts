import { describe, expect, it } from 'vitest'
import type { Escopo, StatusEscopo } from '@/lib/dados/tipos'
import { avisoDaVigencia, lerDadosEscopo, MENSAGENS_ESCOPO, validarEscopo, type DadosEscopo } from './validacao'

/** Um escopo novo, válido, como o formulário manda. */
const NOVO: DadosEscopo = {
  contratoId: 'ctr-vertice-manutencao',
  nome: 'Treinamento de NR-10',
  descricao: '',
  responsavelId: 'usr-helena',
  status: 'Planejado',
  justificativa: '',
  prioridade: 'Média',
  criticidade: 'Moderada',
  justificativaCriticidade: 'Treinamentos vencem no semestre.',
  inicio: '',
  conclusaoPrevista: '',
  cicloAnteriorId: '',
  observacoes: '',
  especialistaIds: [],
  confirmarAviso: false,
}

const PERMITIDOS = ['usr-helena', 'usr-rafael']

/** O escopo em edição, com o status dado. Só os campos que a validação lê importam. */
const atual = (status: StatusEscopo) => ({ id: 'esc-x', status, criticidade: 'Alta' }) as Escopo

const validar = (dados: Partial<DadosEscopo>, escopo: Escopo | null = null) =>
  validarEscopo({ ...NOVO, ...dados }, { atual: escopo, responsaveisPermitidos: PERMITIDOS })

describe('validarEscopo (parte 3, 5.8; critério 13)', () => {
  it('o escopo novo e válido não tem erro', () => {
    expect(validar({})).toEqual({})
  })

  it('cada campo obrigatório com a mensagem dele', () => {
    expect(validar({ nome: '  ' })).toEqual({ nome: MENSAGENS_ESCOPO.nome })
    expect(validar({ responsavelId: '' })).toEqual({ responsavelId: MENSAGENS_ESCOPO.responsavel })
    expect(validar({ responsavelId: 'usr-marcos' })).toEqual({ responsavelId: MENSAGENS_ESCOPO.responsavelSemVinculo })
    expect(validar({ status: '' })).toEqual({ status: MENSAGENS_ESCOPO.status })
    expect(validar({ status: 'Concluído' })).toEqual({ status: MENSAGENS_ESCOPO.status })
    expect(validar({ prioridade: 'Urgente' })).toEqual({ prioridade: MENSAGENS_ESCOPO.prioridade })
    expect(validar({ criticidade: '' })).toEqual({ criticidade: MENSAGENS_ESCOPO.criticidade })
    expect(validar({ justificativaCriticidade: ' ' })).toEqual({
      justificativaCriticidade: MENSAGENS_ESCOPO.justificativaCriticidade,
    })
  })

  it('data que não existe no calendário', () => {
    expect(validar({ inicio: '2026-02-31', conclusaoPrevista: 'amanhã' })).toEqual({
      inicio: MENSAGENS_ESCOPO.data,
      conclusaoPrevista: MENSAGENS_ESCOPO.data,
    })
  })

  it('a conclusão prevista não pode ser antes do início; no mesmo dia, pode', () => {
    expect(validar({ inicio: '2026-03-10', conclusaoPrevista: '2026-03-09' })).toEqual({
      conclusaoPrevista: MENSAGENS_ESCOPO.conclusaoAntes,
    })
    expect(validar({ inicio: '2026-03-10', conclusaoPrevista: '2026-03-10' })).toEqual({})
    expect(validar({ inicio: '', conclusaoPrevista: '2026-03-09' })).toEqual({})
  })

  it('na edição, a criticidade não é conferida: muda só por Reclassificar', () => {
    expect(validar({ criticidade: '', justificativaCriticidade: '' }, atual('Planejado'))).toEqual({})
  })

  it('de Planejado para Em espera é correção e pede justificativa; para Em andamento, não (RN-22)', () => {
    expect(validar({ status: 'Em espera' }, atual('Planejado'))).toEqual({ justificativa: MENSAGENS_ESCOPO.justificativa })
    expect(validar({ status: 'Em espera', justificativa: 'Cliente pediu pausa.' }, atual('Planejado'))).toEqual({})
    expect(validar({ status: 'Em andamento' }, atual('Planejado'))).toEqual({})
  })

  it('o escopo fechado mantém o status: para reabrir, Reabrir (RN-17)', () => {
    expect(validar({ status: 'Em andamento' }, atual('Concluído'))).toEqual({ status: MENSAGENS_ESCOPO.fechado })
    expect(validar({ status: 'Concluído' }, atual('Concluído'))).toEqual({})
  })
})

describe('avisoDaVigencia (RN-21, CA-05.8)', () => {
  it('diz o término do contrato em dd/mm/aaaa', () => {
    expect(avisoDaVigencia('2026-12-05')).toBe(
      'A conclusão prevista é depois do término da vigência do contrato (05/12/2026). Salvar mesmo assim?',
    )
  })
})

describe('lerDadosEscopo', () => {
  it('lê os campos sem espaços nas pontas, e a confirmação do aviso só com "sim"', () => {
    const fd = new FormData()
    fd.set('nome', '  Treinamento  ')
    fd.set('confirmarAviso', 'sim')
    expect(lerDadosEscopo(fd)).toMatchObject({ nome: 'Treinamento', descricao: '', confirmarAviso: true })
    fd.set('confirmarAviso', 'talvez')
    expect(lerDadosEscopo(fd).confirmarAviso).toBe(false)
  })
})
