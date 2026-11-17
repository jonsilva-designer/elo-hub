import { beforeEach, describe, expect, it, vi } from 'vitest'
import { obterAtividade } from '@/lib/dados/atividades'
import { obterPlano } from '@/lib/dados/planos'
import { somarDias } from '@/lib/formato'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { excluirAtividade, salvarAtividade } from './acoes'
import { ESTADO_INICIAL_SALVAR_ATIVIDADE } from './estados'
import { MENSAGENS_ATIVIDADE } from './validacao'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const SEM_PERMISSAO = 'Você não tem permissão para esta ação.'

/** Uma atividade nova no plano de indicadores da Atlântica (sem prazo de vigência: prazo indeterminado). */
const NOVA: Record<string, string> = {
  planoId: 'pla-atlantica-indicadores',
  nome: 'Levantar os dados de produtividade',
  responsavelId: 'usr-rafael',
  prazo: '2026-12-10',
  prioridade: 'Média',
  status: 'Não iniciada',
}

function formulario(campos: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [chave, valor] of Object.entries(campos)) fd.set(chave, valor)
  return fd
}

const salvar = (campos: Record<string, string>) =>
  salvarAtividade(ESTADO_INICIAL_SALVAR_ATIVIDADE, formulario({ ...NOVA, ...campos }))

/** Os campos de uma atividade que existe, como o formulário de edição manda. */
async function edicao(id: string, campos: Record<string, string> = {}) {
  const a = (await obterAtividade(id))!
  return {
    id: a.id,
    planoId: '',
    nome: a.nome,
    responsavelId: a.responsavelId,
    executor: a.executor,
    prazo: a.prazo,
    prioridade: a.prioridade,
    status: a.status,
    ...campos,
  }
}

describe('salvarAtividade (parte 4, 5.7; critérios 6, 7, 9, 10, 11, 16 e 17)', () => {
  it('o Rafael cadastra num plano de cliente vinculado e volta ao plano, com o aviso de que nada foi gravado', async () => {
    entrarComo('usr-rafael')
    const estado = await salvar({ executor: 'Equipe de operação do cliente' })
    expect(estado.erros).toEqual({})
    expect(estado.valores?.executor).toBe('Equipe de operação do cliente')
    expect(estado.sucesso).toEqual({
      mensagem: 'Atividade salva. No protótipo, os dados não são gravados.',
      destino: '/planos/pla-atlantica-indicadores',
    })
  })

  it('aberta a partir de Minhas atividades, volta para lá', async () => {
    entrarComo('usr-rafael')
    expect((await salvar({ origem: 'minhas-atividades' })).sucesso?.destino).toBe('/minhas-atividades')
  })

  it('plano fora do vínculo ou que não existe: recusa, sem dizer qual', async () => {
    entrarComo('usr-rafael')
    expect(await salvar({ planoId: 'pla-montareal-estruturas' })).toMatchObject({ erroGeral: SEM_PERMISSAO })
    expect(await salvar({ planoId: 'pla-nao-existe' })).toMatchObject({ erroGeral: SEM_PERMISSAO })
    expect(await salvar({ id: 'atv-estruturas-inspecao' })).toMatchObject({ erroGeral: SEM_PERMISSAO })
  })

  it('plano fechado não recebe atividade nova (RN-23)', async () => {
    entrarComo('usr-helena')
    expect(await salvar({ planoId: 'pla-atlantica-fechamento' })).toMatchObject({ erroGeral: MENSAGENS_ATIVIDADE.planoFechado })
  })

  it('obrigatórios, prioridade forjada e responsável sem vínculo, mesmo enviados à mão (DF-10, RN-19)', async () => {
    entrarComo('usr-helena')
    expect((await salvar({ prazo: '', prioridade: 'Urgente' })).erros).toEqual({
      prazo: MENSAGENS_ATIVIDADE.prazo,
      prioridade: MENSAGENS_ATIVIDADE.prioridade,
    })
    expect((await salvar({ responsavelId: 'usr-marcos' })).erros).toEqual({
      responsavelId: MENSAGENS_ATIVIDADE.responsavelSemVinculo,
    })
  })

  it('prazo depois do prazo do plano: avisa e salva com a confirmação (RN-21, CA-08.7)', async () => {
    entrarComo('usr-rafael')
    const plano = (await obterPlano('pla-vertice-licencas'))!
    const campos = await edicao('atv-licencas-auditoria')
    const estado = await salvar(campos)
    expect(estado.aviso).toContain('O prazo é depois do prazo do plano')
    expect(estado.sucesso).toBeUndefined()
    expect(estado.aviso).toContain(plano.prazo!.split('-').reverse().join('/'))
    expect((await salvar({ ...campos, confirmarAviso: 'sim' })).sucesso).toBeDefined()
  })

  it('prazo depois do término da vigência: avisa (RN-21)', async () => {
    entrarComo('usr-helena')
    const estado = await salvar(await edicao('atv-mobilizacao-treinamento'))
    expect(estado.aviso).toContain('O prazo é depois do término da vigência do contrato')
  })

  it('contrato em Proposta não avisa pela vigência', async () => {
    entrarComo('usr-helena')
    const estado = await salvar({ planoId: 'pla-vertice-desenvolvimento', prazo: '2027-03-31' })
    expect(estado.aviso).toBeUndefined()
    expect(estado.sucesso).toBeDefined()
  })

  it('prazo no passado é aceito (EC-31)', async () => {
    entrarComo('usr-rafael')
    expect((await salvar({ prazo: somarDias('2026-01-01', 0) })).sucesso).toBeDefined()
  })

  it('a Equipe não muda a atividade fechada, nem enviando à mão (RN-17)', async () => {
    entrarComo('usr-rafael')
    expect(await salvar(await edicao('atv-licencas-levantamento', { status: 'Em andamento' }))).toMatchObject({
      erroGeral: SEM_PERMISSAO,
    })
    expect(await salvar(await edicao('atv-licencas-alvara'))).toMatchObject({ erroGeral: SEM_PERMISSAO })
  })

  it('a Equipe conclui a atividade aberta', async () => {
    entrarComo('usr-rafael')
    expect((await salvar(await edicao('atv-licencas-protocolo', { status: 'Concluída' }))).sucesso).toBeDefined()
  })

  it('a Helena reabre com justificativa; sem ela, erro (RN-22, CN-22.2)', async () => {
    entrarComo('usr-helena')
    const reabrir = await edicao('atv-licencas-levantamento', { status: 'Em andamento' })
    expect((await salvar(reabrir)).erros).toEqual({ justificativa: MENSAGENS_ATIVIDADE.justificativa })
    expect((await salvar({ ...reabrir, justificativa: 'Faltou a licença do depósito.' })).sucesso).toBeDefined()
  })

  it('com o plano fechado, a reabertura é recusada (RN-23)', async () => {
    entrarComo('usr-helena')
    const reabrir = await edicao('atv-fechamento-relatorio', { status: 'Em andamento', justificativa: 'Motivo' })
    expect(await salvar(reabrir)).toMatchObject({ erroGeral: MENSAGENS_ATIVIDADE.reabrirComPlanoFechado })
  })

  it('na edição, o plano é o da atividade', async () => {
    entrarComo('usr-rafael')
    const estado = await salvar(await edicao('atv-licencas-vistoria', { planoId: 'pla-atlantica-indicadores' }))
    expect(estado.valores?.planoId).toBe('pla-vertice-licencas')
  })
})

describe('excluirAtividade (RN-13, DF-33; critério 15)', () => {
  it('a Helena exclui com justificativa; sem ela, recusa', async () => {
    entrarComo('usr-helena')
    expect(await excluirAtividade('atv-licencas-alvara', 'Registrada em duplicidade.')).toEqual({
      ok: true,
      mensagem: 'Atividade excluída. No protótipo, os dados não são gravados.',
    })
    expect(await excluirAtividade('atv-licencas-alvara', ' ')).toEqual({
      ok: false,
      mensagem: 'Escreva a justificativa da exclusão.',
    })
  })

  it('a Equipe não exclui (CA-18.1); fora do vínculo, a mesma recusa', async () => {
    entrarComo('usr-rafael')
    expect(await excluirAtividade('atv-licencas-alvara', 'Motivo')).toEqual({ ok: false, mensagem: SEM_PERMISSAO })
    entrarComo('usr-helena')
    expect(await excluirAtividade('atv-nao-existe', 'Motivo')).toEqual({ ok: false, mensagem: SEM_PERMISSAO })
  })
})
