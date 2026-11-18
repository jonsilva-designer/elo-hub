import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { atualizarEtapa } from './acoes'
import { ESTADO_INICIAL_ATUALIZAR_ETAPA } from './estados'
import { MENSAGENS_ETAPA } from './validacao'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const SEM_PERMISSAO = 'Você não tem permissão para esta ação.'

function formulario(campos: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [chave, valor] of Object.entries(campos)) fd.set(chave, valor)
  return fd
}

const atualizar = (campos: Record<string, string>) => atualizarEtapa(ESTADO_INICIAL_ATUALIZAR_ETAPA, formulario(campos))

/** As etapas da Regularização documental: Diagnosticar Concluída e Estruturar Em andamento, do Rafael. */
const DOCUMENTAL = { escopoId: 'esc-vertice-documental' }
const ESTRUTURAR = { ...DOCUMENTAL, etapa: 'Estruturar', responsavelId: 'usr-rafael', inicio: '2026-05-04' }
const MONITORAR = { ...DOCUMENTAL, etapa: 'Monitorar', responsavelId: '' }
const DIAGNOSTICAR_DOCUMENTAL = {
  ...DOCUMENTAL,
  etapa: 'Diagnosticar',
  responsavelId: 'usr-rafael',
  inicio: '2026-02-09',
  conclusao: '2026-04-30',
}

/** As etapas da Mobilização: Diagnosticar e Estruturar Não aplicáveis, Implementar Em andamento. */
const MOBILIZACAO = { escopoId: 'esc-vertice-mobilizacao' }

describe('atualizarEtapa pela Equipe (DF-24, matriz 4.3; ponto de atenção 1)', () => {
  it('o Rafael conclui a etapa com a data de conclusão (CA-06.3)', async () => {
    entrarComo('usr-rafael')
    const estado = await atualizar({ ...ESTRUTURAR, status: 'Concluída', conclusao: '2026-11-10' })
    expect(estado).toMatchObject({
      erros: {},
      sucesso: { mensagem: 'Etapa atualizada. No protótipo, os dados não são gravados.' },
    })
  })

  it('concluir sem a data de conclusão é recusado', async () => {
    entrarComo('usr-rafael')
    expect((await atualizar({ ...ESTRUTURAR, status: 'Concluída' })).erros).toEqual({ conclusao: MENSAGENS_ETAPA.conclusao })
  })

  it('o Rafael inicia uma etapa Não iniciada', async () => {
    entrarComo('usr-rafael')
    expect((await atualizar({ ...MONITORAR, status: 'Em andamento', inicio: '2026-11-10' })).sucesso).toBeDefined()
  })

  it('o que é do Administrador, enviado à mão, é recusado sem gravar', async () => {
    entrarComo('usr-rafael')
    expect(await atualizar({ ...MONITORAR, status: 'Não aplicável' })).toMatchObject({ erroGeral: SEM_PERMISSAO })
    expect(await atualizar({ ...DIAGNOSTICAR_DOCUMENTAL, status: 'Em andamento', justificativa: 'Faltou um documento.' })).toMatchObject({
      erroGeral: SEM_PERMISSAO,
    })
    expect(await atualizar({ ...ESTRUTURAR, status: 'Em andamento', responsavelId: 'usr-helena' })).toMatchObject({
      erroGeral: SEM_PERMISSAO,
    })
  })

  it('escopo fora do vínculo ou etapa que não existe: recusa', async () => {
    entrarComo('usr-rafael')
    expect(await atualizar({ escopoId: 'esc-montareal-montagem', etapa: 'Diagnosticar', status: 'Em andamento' })).toMatchObject({
      erroGeral: SEM_PERMISSAO,
    })
    expect(await atualizar({ ...DOCUMENTAL, etapa: 'Começar', status: 'Em andamento' })).toMatchObject({
      erroGeral: SEM_PERMISSAO,
    })
  })
})

describe('atualizarEtapa pelo Administrador (DF-49, RN-22, CN-22.2; pontos de atenção 2 e 5)', () => {
  it('a Helena marca Não aplicável numa Não iniciada', async () => {
    entrarComo('usr-helena')
    expect((await atualizar({ ...MOBILIZACAO, etapa: 'Monitorar', status: 'Não aplicável' })).sucesso).toBeDefined()
  })

  it('etapa com documento não vira Não aplicável (DF-49; parte 6, critério 8)', async () => {
    entrarComo('usr-helena')
    const estado = await atualizar({ ...DOCUMENTAL, etapa: 'Implementar', status: 'Não aplicável', responsavelId: '' })
    expect(estado.erros).toEqual({ status: 'Etapa com documento não vira Não aplicável.' })
    expect(estado.sucesso).toBeUndefined()
  })

  it('Em andamento não vira Não aplicável', async () => {
    entrarComo('usr-helena')
    const estado = await atualizar({
      ...MOBILIZACAO,
      etapa: 'Implementar',
      status: 'Não aplicável',
      responsavelId: 'usr-rafael',
      inicio: '2026-03-05',
    })
    expect(estado.erros).toEqual({ status: MENSAGENS_ETAPA.naoAplicavel })
  })

  it('corrigir uma Não aplicável pede justificativa', async () => {
    entrarComo('usr-helena')
    const diagnosticar = { ...MOBILIZACAO, etapa: 'Diagnosticar', status: 'Em andamento', inicio: '2026-11-10' }
    expect((await atualizar(diagnosticar)).erros).toEqual({ justificativa: MENSAGENS_ETAPA.justificativa })
    expect((await atualizar({ ...diagnosticar, justificativa: 'O contratante não fez o diagnóstico.' })).sucesso).toBeDefined()
  })

  it('reabrir uma Concluída pede a justificativa da reabertura e apaga a conclusão', async () => {
    entrarComo('usr-helena')
    const reabrir = { ...DIAGNOSTICAR_DOCUMENTAL, status: 'Em andamento' }
    expect((await atualizar(reabrir)).erros).toEqual({ justificativa: MENSAGENS_ETAPA.justificativaReabertura })
    const estado = await atualizar({ ...reabrir, justificativa: 'Faltou a certidão estadual.' })
    expect(estado.sucesso).toBeDefined()
    expect(estado.valores?.conclusao).toBe('')
  })

  it('o responsável precisa ter vínculo com o cliente (RN-19)', async () => {
    entrarComo('usr-helena')
    expect((await atualizar({ ...ESTRUTURAR, status: 'Em andamento', responsavelId: 'usr-marcos' })).erros).toEqual({
      responsavelId: MENSAGENS_ETAPA.responsavelSemVinculo,
    })
  })

  it('a Helena troca o responsável e tira o responsável da etapa', async () => {
    entrarComo('usr-helena')
    expect((await atualizar({ ...ESTRUTURAR, status: 'Em andamento', responsavelId: 'usr-helena' })).sucesso).toBeDefined()
    expect((await atualizar({ ...ESTRUTURAR, status: 'Em andamento', responsavelId: '' })).sucesso).toBeDefined()
  })

  it('status fora da lista é recusado', async () => {
    entrarComo('usr-helena')
    expect((await atualizar({ ...MONITORAR, status: 'Pausada' })).erros).toEqual({ status: MENSAGENS_ETAPA.status })
    expect((await atualizar({ ...MONITORAR, status: '' })).erros).toEqual({ status: MENSAGENS_ETAPA.status })
  })

  it('data que não existe no calendário', async () => {
    entrarComo('usr-helena')
    expect((await atualizar({ ...MONITORAR, status: 'Em andamento', inicio: '2026-02-30' })).erros).toEqual({
      inicio: MENSAGENS_ETAPA.data,
    })
  })

  it('escopo Concluído: as etapas não mudam (RN-23)', async () => {
    entrarComo('usr-helena')
    expect(await atualizar({ escopoId: 'esc-atlantica-2025', etapa: 'Evoluir', status: 'Em andamento' })).toMatchObject({
      erroGeral: MENSAGENS_ETAPA.fechado,
    })
  })
})
