import { describe, expect, it } from 'vitest'
import type { StatusDemanda } from '@/lib/dados/tipos'
import {
  acoesDaDemanda,
  correcoesDaDemanda,
  demandaFechada,
  demandaVencida,
  faltaParaAtendimento,
  origemPermitida,
  ORIGENS_DEMANDA,
  podeEncerrar,
  proximoNumero,
  STATUS_DEMANDA,
  STATUS_DEMANDA_ABERTOS,
} from './regras'

const ADMIN = { id: 'usr-helena', perfil: 'Administrador' as const }
const ANA = { id: 'usr-ana', perfil: 'Equipe' as const }
const BRUNO = { id: 'usr-bruno', perfil: 'Equipe' as const }

const demanda = (status: StatusDemanda, atendimento: string | null = null) => ({
  status,
  responsavelTriagemId: 'usr-ana',
  responsavelAtendimentoId: atendimento,
})

describe('listas e status da demanda (F09, PRD 6.1)', () => {
  it('na ordem do PRD; só Encerrada é final', () => {
    expect(STATUS_DEMANDA).toEqual(['Nova', 'Em triagem', 'Em atendimento', 'Aguardando retorno', 'Resolvida', 'Encerrada'])
    expect(STATUS_DEMANDA_ABERTOS).not.toContain('Encerrada')
    expect(demandaFechada('Encerrada')).toBe(true)
    expect(demandaFechada('Resolvida')).toBe(false)
    expect(ORIGENS_DEMANDA).toEqual([
      'Cliente',
      'Interna',
      'Institucional',
      'Especialista',
      'Reunião',
      'E-mail',
      'Telefone/WhatsApp',
      'Outro',
    ])
  })
})

describe('demandaVencida (RN-20, CA-09.5, DF-41)', () => {
  const HOJE = '2027-03-10'
  it('prazo antes de hoje e não resolvida: vencida; prazo hoje, não', () => {
    expect(demandaVencida({ prazo: '2027-03-09', status: 'Em atendimento' }, HOJE)).toBe(true)
    expect(demandaVencida({ prazo: '2027-03-10', status: 'Em atendimento' }, HOJE)).toBe(false)
  })

  it('Aguardando retorno continua vencida; Resolvida, Encerrada e sem prazo, não', () => {
    expect(demandaVencida({ prazo: '2027-03-01', status: 'Aguardando retorno' }, HOJE)).toBe(true)
    expect(demandaVencida({ prazo: '2027-03-01', status: 'Resolvida' }, HOJE)).toBe(false)
    expect(demandaVencida({ prazo: '2027-03-01', status: 'Encerrada' }, HOJE)).toBe(false)
    expect(demandaVencida({ prazo: null, status: 'Nova' }, HOJE)).toBe(false)
  })
})

describe('podeEncerrar (CA-09.8, DF-61)', () => {
  it('sem atendente, a triagem encerra; com atendente, só ele e o Administrador', () => {
    expect(podeEncerrar(demanda('Nova'), ANA)).toBe(true)
    expect(podeEncerrar(demanda('Nova'), BRUNO)).toBe(false)
    expect(podeEncerrar(demanda('Em atendimento', 'usr-bruno'), ANA)).toBe(false)
    expect(podeEncerrar(demanda('Em atendimento', 'usr-bruno'), BRUNO)).toBe(true)
    expect(podeEncerrar(demanda('Em atendimento', 'usr-bruno'), ADMIN)).toBe(true)
  })
})

describe('acoesDaDemanda (PRD 6.1)', () => {
  it('as transições de cada status, para quem pode encerrar', () => {
    expect(acoesDaDemanda(demanda('Nova'), ANA)).toEqual(['iniciar-triagem', 'iniciar-atendimento', 'encerrar-sem-resolver'])
    expect(acoesDaDemanda(demanda('Em triagem'), ANA)).toEqual(['iniciar-atendimento', 'encerrar-sem-resolver'])
    expect(acoesDaDemanda(demanda('Em atendimento', 'usr-ana'), ANA)).toEqual(['aguardar-retorno', 'resolver', 'encerrar-sem-resolver'])
    expect(acoesDaDemanda(demanda('Aguardando retorno', 'usr-ana'), ANA)).toEqual([
      'retomar-atendimento',
      'resolver',
      'encerrar-sem-resolver',
    ])
    expect(acoesDaDemanda(demanda('Resolvida', 'usr-ana'), ANA)).toEqual(['voltar-ao-atendimento', 'encerrar'])
  })

  it('quem não pode encerrar não vê encerrar; só o Administrador reabre a Encerrada', () => {
    expect(acoesDaDemanda(demanda('Resolvida', 'usr-ana'), BRUNO)).toEqual(['voltar-ao-atendimento'])
    expect(acoesDaDemanda(demanda('Encerrada', 'usr-ana'), ANA)).toEqual([])
    expect(acoesDaDemanda(demanda('Encerrada', 'usr-ana'), ADMIN)).toEqual(['reabrir'])
  })

  it('o Administrador também corrige o status da demanda aberta; a Equipe, não (RN-22, CA-17.4)', () => {
    expect(acoesDaDemanda(demanda('Em atendimento', 'usr-ana'), ADMIN)).toEqual([
      'aguardar-retorno',
      'resolver',
      'encerrar-sem-resolver',
      'corrigir-status',
    ])
    expect(acoesDaDemanda(demanda('Resolvida', 'usr-ana'), ADMIN)).toEqual(['voltar-ao-atendimento', 'encerrar', 'corrigir-status'])
    expect(acoesDaDemanda(demanda('Em atendimento', 'usr-ana'), ANA)).not.toContain('corrigir-status')
  })
})

describe('correcoesDaDemanda (RN-22)', () => {
  it('os status abertos que não são mudança listada na 6.1 a partir do atual', () => {
    expect(correcoesDaDemanda('Nova')).toEqual(['Aguardando retorno', 'Resolvida'])
    expect(correcoesDaDemanda('Em triagem')).toEqual(['Nova', 'Aguardando retorno', 'Resolvida'])
    expect(correcoesDaDemanda('Em atendimento')).toEqual(['Nova', 'Em triagem'])
    expect(correcoesDaDemanda('Aguardando retorno')).toEqual(['Nova', 'Em triagem'])
    expect(correcoesDaDemanda('Resolvida')).toEqual(['Nova', 'Em triagem', 'Aguardando retorno'])
  })

  it('a Encerrada não se corrige: volta por Reabrir', () => {
    expect(correcoesDaDemanda('Encerrada')).toEqual([])
  })
})

describe('faltaParaAtendimento (CA-09.2)', () => {
  it('lista o que falta; com tudo, nada', () => {
    expect(faltaParaAtendimento({ categoria: null, criticidade: null, responsavelAtendimentoId: null })).toEqual([
      'Categoria',
      'Criticidade',
      'Responsável pelo atendimento',
    ])
    expect(faltaParaAtendimento({ categoria: 'Outros assuntos', criticidade: 'Baixa', responsavelAtendimentoId: 'usr-ana' })).toEqual([])
  })
})

describe('proximoNumero (DF-11)', () => {
  it('o seguinte do ano, com quatro dígitos; na virada do ano, recomeça', () => {
    expect(proximoNumero(['ELO-2026-0001', 'ELO-2026-0011', 'ELO-2025-0040'], 2026)).toBe('ELO-2026-0012')
    expect(proximoNumero(['ELO-2026-0011'], 2027)).toBe('ELO-2027-0001')
  })
})

describe('origemPermitida (CA-09.15, DF-40)', () => {
  it('Institucional só no cadastro da ELO, que só aceita Institucional', () => {
    expect(origemPermitida('Institucional', true)).toBe(true)
    expect(origemPermitida('Cliente', true)).toBe(false)
    expect(origemPermitida('Institucional', false)).toBe(false)
    expect(origemPermitida('Interna', false)).toBe(true)
    expect(origemPermitida('Feira', false)).toBe(false)
  })
})
