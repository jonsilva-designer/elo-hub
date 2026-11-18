import { beforeEach, describe, expect, it, vi } from 'vitest'
import { obterParametros } from '@/lib/dados/parametros'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { salvarParametros } from './acoes'
import { ESTADO_INICIAL_PARAMETROS } from './estados'
import { MENSAGENS_PARAMETROS } from './validacao'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const VALIDOS: Record<string, string> = {
  diasProximoDoPrazo: '5',
  diasDoAlerta: '30',
  remetenteDemanda: 'atendimento@elogovernance.com.br',
  remetenteSite: 'site@elogovernance.com.br',
  referenciaBaixa: '',
  referenciaModerada: '10',
  referenciaAlta: '5',
  referenciaCritica: '2',
  inicioOperacao: '2026-12-01',
}

function formulario(campos: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [chave, valor] of Object.entries(campos)) fd.set(chave, valor)
  return fd
}

const salvar = (campos: Record<string, string>) => salvarParametros(ESTADO_INICIAL_PARAMETROS, formulario({ ...VALIDOS, ...campos }))

describe('parâmetros (parte 8, 4.3; DF-81, Apêndice C)', () => {
  it('os valores do Apêndice C, com o início da operação já registrado nos fictícios; só o Administrador lê (CA-01.2)', async () => {
    entrarComo('usr-rafael')
    expect(await obterParametros()).toBeNull()
    entrarComo('usr-helena')
    expect(await obterParametros()).toEqual({
      diasProximoDoPrazo: 5,
      diasDoAlerta: 30,
      remetenteDemanda: 'atendimento@elogovernance.com.br',
      remetenteSite: 'atendimento@elogovernance.com.br',
      referencias: {},
      inicioOperacao: '2026-03-02',
    })
  })

  it('a Equipe é recusada (CA-01.4)', async () => {
    entrarComo('usr-rafael')
    expect((await salvar({})).erroGeral).toBe('Você não tem permissão para esta ação.')
  })

  it('salva os válidos, com a referência vazia e o início no futuro', async () => {
    entrarComo('usr-helena')
    const estado = await salvar({})
    expect(estado.erros).toEqual({})
    expect(estado.sucesso).toBe('Parâmetros salvos. No protótipo, os dados não são gravados.')
    expect((await salvar({ inicioOperacao: '' })).erros).toEqual({})
  })

  it('recusa fora das regras, com mensagem no campo (DF-21, DF-22, DF-46, DF-81)', async () => {
    entrarComo('usr-helena')
    const estado = await salvar({
      diasProximoDoPrazo: '0',
      diasDoAlerta: '91',
      remetenteDemanda: 'atendimento@gmail.com',
      remetenteSite: 'site@elogovernance.com.br.fake.com',
      referenciaModerada: '0',
      referenciaAlta: '2,5',
      inicioOperacao: '2026-02-30',
    })
    expect(estado.erros).toEqual({
      diasProximoDoPrazo: MENSAGENS_PARAMETROS.dias,
      diasDoAlerta: MENSAGENS_PARAMETROS.dias,
      remetenteDemanda: MENSAGENS_PARAMETROS.remetente,
      remetenteSite: MENSAGENS_PARAMETROS.remetente,
      referenciaModerada: MENSAGENS_PARAMETROS.referencia,
      referenciaAlta: MENSAGENS_PARAMETROS.referencia,
      inicioOperacao: MENSAGENS_PARAMETROS.data,
    })
    expect((await salvar({ diasDoAlerta: '1' })).erros).toEqual({})
    expect((await salvar({ diasDoAlerta: '90' })).erros).toEqual({})
    expect((await salvar({ remetenteSite: 'SITE@ELOGOVERNANCE.COM.BR' })).erros).toEqual({})
  })
})
