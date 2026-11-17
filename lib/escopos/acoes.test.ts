import { beforeEach, describe, expect, it, vi } from 'vitest'
import { hojeEmBrasilia, somarDias } from '@/lib/formato'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import {
  cancelarEscopo,
  concluirEscopo,
  excluirEscopo,
  moverEscopo,
  reabrirEscopo,
  reclassificarCriticidade,
  salvarEscopo,
} from './acoes'
import { ESTADO_INICIAL_SALVAR_ESCOPO } from './estados'
import { MENSAGENS_ESCOPO } from './validacao'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const SEM_PERMISSAO = 'Você não tem permissão para esta ação.'

/** Um escopo novo no contrato de manutenção da Vértice, válido, como o formulário manda. */
const NOVO: Record<string, string> = {
  contratoId: 'ctr-vertice-manutencao',
  nome: 'Treinamento de NR-10',
  responsavelId: 'usr-rafael',
  status: 'Planejado',
  prioridade: 'Média',
  criticidade: 'Moderada',
  justificativaCriticidade: 'Treinamentos vencem no semestre.',
}

function formulario(campos: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [chave, valor] of Object.entries(campos)) fd.set(chave, valor)
  return fd
}

const salvar = (campos: Record<string, string>) => salvarEscopo(ESTADO_INICIAL_SALVAR_ESCOPO, formulario({ ...NOVO, ...campos }))

/** A edição da Regularização documental, com os dados dela. */
const EDICAO_DOCUMENTAL = {
  id: 'esc-vertice-documental',
  nome: 'Regularização documental',
  status: 'Em andamento',
  prioridade: 'Alta',
}

describe('salvarEscopo (parte 3, 5.8; critérios 9, 13, 14, 20 e 21)', () => {
  it('o Rafael é recusado no cadastro e na edição', async () => {
    entrarComo('usr-rafael')
    expect(await salvar({})).toMatchObject({ erroGeral: SEM_PERMISSAO })
    expect(await salvar(EDICAO_DOCUMENTAL)).toMatchObject({ erroGeral: SEM_PERMISSAO })
  })

  it('contrato ou escopo que não existe: recusa, sem dizer que não existe', async () => {
    entrarComo('usr-helena')
    expect(await salvar({ contratoId: 'ctr-nao-existe' })).toMatchObject({ erroGeral: SEM_PERMISSAO })
    expect(await salvar({ id: 'esc-nao-existe' })).toMatchObject({ erroGeral: SEM_PERMISSAO })
  })

  it('o cadastro pede a criticidade e a justificativa dela (CA-05.1)', async () => {
    entrarComo('usr-helena')
    const estado = await salvar({ criticidade: '', justificativaCriticidade: '' })
    expect(estado.erros).toEqual({
      criticidade: MENSAGENS_ESCOPO.criticidade,
      justificativaCriticidade: MENSAGENS_ESCOPO.justificativaCriticidade,
    })
    expect(estado.sucesso).toBeUndefined()
  })

  it('criticidade fora da lista conta como vazia', async () => {
    entrarComo('usr-helena')
    expect((await salvar({ criticidade: 'Gravíssima' })).erros).toEqual({ criticidade: MENSAGENS_ESCOPO.criticidade })
  })

  it('o responsável precisa ter vínculo com o cliente (RN-19)', async () => {
    entrarComo('usr-helena')
    expect((await salvar({ responsavelId: 'usr-marcos' })).erros).toEqual({
      responsavelId: MENSAGENS_ESCOPO.responsavelSemVinculo,
    })
  })

  it('o ciclo anterior de outro cliente volta vazio (DF-57, RN-02)', async () => {
    entrarComo('usr-helena')
    const estado = await salvar({ cicloAnteriorId: 'esc-montareal-montagem' })
    expect(estado.valores?.cicloAnteriorId).toBe('')
    expect(estado.sucesso).toBeDefined()
  })

  it('o ciclo anterior do mesmo cliente fica', async () => {
    entrarComo('usr-helena')
    expect((await salvar({ cicloAnteriorId: 'esc-vertice-qualidade' })).valores?.cicloAnteriorId).toBe('esc-vertice-qualidade')
  })

  it('o escopo nasce aberto (6.1)', async () => {
    entrarComo('usr-helena')
    expect((await salvar({ status: 'Concluído' })).erros).toEqual({ status: MENSAGENS_ESCOPO.status })
  })

  it('salvo no cadastro: volta para o contrato, com o aviso de que nada foi gravado', async () => {
    entrarComo('usr-helena')
    const estado = await salvar({})
    expect(estado).toMatchObject({
      erros: {},
      sucesso: {
        mensagem: 'Escopo salvo. No protótipo, os dados não são gravados.',
        destino: '/contratos/ctr-vertice-manutencao',
      },
    })
  })

  it('contrato Encerrado não recebe escopo (RN-23)', async () => {
    entrarComo('usr-helena')
    expect(await salvar({ contratoId: 'ctr-ondamar-apoio' })).toMatchObject({ erroGeral: MENSAGENS_ESCOPO.contratoFechado })
  })
})

describe('aviso da RN-21 (CA-05.8; ponto de atenção 3)', () => {
  const hoje = hojeEmBrasilia(new Date())
  const terminoDaMobilizacao = somarDias(hoje, 20)
  const naMobilizacao = (campos: Record<string, string>) =>
    salvar({ contratoId: 'ctr-vertice-mobilizacao', ...campos })

  it('conclusão prevista depois do término: devolve o aviso, sem salvar', async () => {
    entrarComo('usr-helena')
    const estado = await naMobilizacao({ conclusaoPrevista: somarDias(hoje, 21) })
    const [ano, mes, dia] = terminoDaMobilizacao.split('-')
    expect(estado.aviso).toBe(
      `A conclusão prevista é depois do término da vigência do contrato (${dia}/${mes}/${ano}). Salvar mesmo assim?`,
    )
    expect(estado.erros).toEqual({})
    expect(estado.sucesso).toBeUndefined()
    expect(estado.valores?.conclusaoPrevista).toBe(somarDias(hoje, 21))
  })

  it('"Salvar mesmo assim" salva', async () => {
    entrarComo('usr-helena')
    const estado = await naMobilizacao({ conclusaoPrevista: somarDias(hoje, 21), confirmarAviso: 'sim' })
    expect(estado.aviso).toBeUndefined()
    expect(estado.sucesso?.destino).toBe('/contratos/ctr-vertice-mobilizacao')
  })

  it('conclusão prevista no próprio dia do término não dá aviso', async () => {
    entrarComo('usr-helena')
    const estado = await naMobilizacao({ conclusaoPrevista: terminoDaMobilizacao })
    expect(estado.aviso).toBeUndefined()
    expect(estado.sucesso).toBeDefined()
  })

  it('Prazo indeterminado e contrato em Proposta não dão aviso', async () => {
    entrarComo('usr-helena')
    for (const contratoId of ['ctr-atlantica-porto', 'ctr-vertice-proposta']) {
      const estado = await salvar({ contratoId, conclusaoPrevista: '2030-06-28' })
      expect(estado.aviso, contratoId).toBeUndefined()
      expect(estado.sucesso, contratoId).toBeDefined()
    }
  })

  it('o aviso só vem com o resto certo', async () => {
    entrarComo('usr-helena')
    const estado = await naMobilizacao({ conclusaoPrevista: somarDias(hoje, 21), nome: '' })
    expect(estado.erros).toEqual({ nome: MENSAGENS_ESCOPO.nome })
    expect(estado.aviso).toBeUndefined()
  })
})

describe('edição do escopo', () => {
  it('a criticidade do formulário é ignorada: muda só por Reclassificar', async () => {
    entrarComo('usr-helena')
    const estado = await salvar({ ...EDICAO_DOCUMENTAL, criticidade: 'Baixa', justificativaCriticidade: 'outra' })
    expect(estado.sucesso?.destino).toBe('/escopos/esc-vertice-documental')
    expect(estado.valores?.criticidade).toBe('Alta')
  })

  it('o contrato é o do escopo, e o do formulário é ignorado', async () => {
    entrarComo('usr-helena')
    const estado = await salvar({ ...EDICAO_DOCUMENTAL, contratoId: 'ctr-ondamar-apoio' })
    expect(estado.valores?.contratoId).toBe('ctr-vertice-manutencao')
    expect(estado.sucesso).toBeDefined()
  })

  it('o ciclo anterior não pode ser o próprio escopo', async () => {
    entrarComo('usr-helena')
    expect((await salvar({ ...EDICAO_DOCUMENTAL, cicloAnteriorId: 'esc-vertice-documental' })).valores?.cicloAnteriorId).toBe('')
  })

  it('o ciclo anterior não pode ser o ciclo seguinte, que já aponta para este escopo (CA-05.10)', async () => {
    entrarComo('usr-helena')
    const estado = await salvar({
      id: 'esc-atlantica-2025',
      nome: 'Gestão do contrato portuário, ciclo 2025',
      status: 'Concluído',
      cicloAnteriorId: 'esc-atlantica-2026',
    })
    expect(estado.valores?.cicloAnteriorId).toBe('')
  })

  it('vínculo novo só com especialista Ativo; o Inativo já ligado continua (CA-11.2, DF-51)', async () => {
    entrarComo('usr-helena')
    const fd = formulario({ ...NOVO })
    for (const id of ['esp-juridico', 'esp-riscos', 'esp-financeiro', 'esp-nao-existe']) fd.append('especialistaIds', id)
    expect((await salvarEscopo(ESTADO_INICIAL_SALVAR_ESCOPO, fd)).valores?.especialistaIds).toEqual(['esp-juridico'])
    const edicao = formulario({
      ...NOVO,
      id: 'esc-vertice-mobilizacao',
      nome: 'Mobilização de equipe',
      status: 'Em andamento',
      prioridade: 'Alta',
      confirmarAviso: 'sim',
    })
    for (const id of ['esp-financeiro', 'esp-esg']) edicao.append('especialistaIds', id)
    expect((await salvarEscopo(ESTADO_INICIAL_SALVAR_ESCOPO, edicao)).valores?.especialistaIds).toEqual([
      'esp-financeiro',
      'esp-esg',
    ])
  })

  it('o escopo Concluído não muda de status pela edição (RN-17)', async () => {
    entrarComo('usr-helena')
    const estado = await salvar({
      id: 'esc-atlantica-2025',
      nome: 'Gestão do contrato portuário, ciclo 2025',
      responsavelId: 'usr-rafael',
      status: 'Em andamento',
      prioridade: 'Média',
    })
    expect(estado.erros).toEqual({ status: MENSAGENS_ESCOPO.fechado })
  })
})

describe('ações do escopo: só o Administrador (matriz 4.3; critério 9)', () => {
  it('o Rafael é recusado nas seis ações, mesmo num escopo da Vértice', async () => {
    entrarComo('usr-rafael')
    const id = 'esc-vertice-qualidade'
    for (const resultado of [
      await reclassificarCriticidade(id, 'Alta', 'Motivo'),
      await concluirEscopo(id, '2026-11-15'),
      await cancelarEscopo(id),
      await reabrirEscopo('esc-atlantica-2025', 'Em andamento', 'Motivo'),
      await moverEscopo(id, 'ctr-vertice-mobilizacao'),
      await excluirEscopo(id, 'Motivo'),
    ]) {
      expect(resultado).toEqual({ ok: false, mensagem: SEM_PERMISSAO })
    }
  })

  it('escopo que não existe ou id que não é texto: a mesma recusa', async () => {
    entrarComo('usr-helena')
    expect(await cancelarEscopo('esc-nao-existe')).toEqual({ ok: false, mensagem: SEM_PERMISSAO })
    expect(await cancelarEscopo(42 as unknown as string)).toEqual({ ok: false, mensagem: SEM_PERMISSAO })
  })
})

describe('reclassificarCriticidade (F05, CA-05.2)', () => {
  it('pede a justificativa e uma criticidade da lista', async () => {
    entrarComo('usr-helena')
    expect(await reclassificarCriticidade('esc-vertice-qualidade', 'Alta', '  ')).toEqual({
      ok: false,
      mensagem: 'Escreva a justificativa da criticidade.',
    })
    expect(await reclassificarCriticidade('esc-vertice-qualidade', 'Urgente', 'Motivo')).toEqual({
      ok: false,
      mensagem: 'Escolha a criticidade.',
    })
    expect(await reclassificarCriticidade('esc-vertice-qualidade', 'Alta', 'A auditoria deu prazo.')).toEqual({
      ok: true,
      mensagem: 'Criticidade reclassificada. No protótipo, os dados não são gravados.',
    })
  })

  it('o escopo fechado não muda de criticidade', async () => {
    entrarComo('usr-helena')
    expect(await reclassificarCriticidade('esc-atlantica-2025', 'Alta', 'Motivo')).toEqual({
      ok: false,
      mensagem: 'A criticidade de um escopo fechado não muda.',
    })
  })
})

describe('concluirEscopo e cancelarEscopo (DF-59, critério 18)', () => {
  it('a etapa Em andamento impede concluir, com a lista', async () => {
    entrarComo('usr-helena')
    const resultado = await concluirEscopo('esc-vertice-documental', '2026-11-15')
    expect(resultado).toMatchObject({
      ok: false,
      mensagem: 'Não é possível concluir este escopo enquanto houver etapas Em andamento ou planos abertos.',
    })
    expect(resultado.ok ? [] : resultado.impedimentos?.map((i) => i.descricao)).toEqual([
      'Estruturar',
      'Regularização das licenças',
    ])
  })

  it('concluir pede a data efetiva, que precisa existir', async () => {
    entrarComo('usr-helena')
    const semData = { ok: false, mensagem: 'Informe a data efetiva de conclusão.' }
    expect(await concluirEscopo('esc-vertice-qualidade', '')).toEqual(semData)
    expect(await concluirEscopo('esc-vertice-qualidade', '2026-02-30')).toEqual(semData)
    expect(await concluirEscopo('esc-vertice-qualidade', '2026-11-15')).toEqual({
      ok: true,
      mensagem: 'Escopo concluído. No protótipo, os dados não são gravados.',
    })
  })

  it('a data efetiva não pode ser antes do início do escopo', async () => {
    entrarComo('usr-helena')
    expect(await concluirEscopo('esc-rede-norte-rmm', '2026-04-10')).toEqual({
      ok: false,
      mensagem: 'A data efetiva não pode ser antes do início do escopo.',
    })
    expect((await concluirEscopo('esc-rede-norte-rmm', '2026-04-13')).ok).toBe(true)
  })

  it('as etapas Não iniciadas não impedem concluir', async () => {
    entrarComo('usr-helena')
    expect((await concluirEscopo('esc-rede-norte-rmm', '2026-11-15')).ok).toBe(true)
  })

  it('a etapa Em andamento impede cancelar; sem ela, cancela', async () => {
    entrarComo('usr-helena')
    const cancelar = await cancelarEscopo('esc-vertice-mobilizacao')
    expect(cancelar).toMatchObject({
      ok: false,
      mensagem: 'Não é possível cancelar este escopo enquanto houver etapas Em andamento ou planos abertos.',
    })
    expect(cancelar.ok ? [] : cancelar.impedimentos?.map((i) => i.tipo)).toEqual(['Etapa da Jornada', 'Plano de ação'])
    expect(await cancelarEscopo('esc-vertice-qualidade')).toEqual({
      ok: true,
      mensagem: 'Escopo cancelado. No protótipo, os dados não são gravados.',
    })
  })

  it('o escopo fechado não é concluído nem cancelado de novo', async () => {
    entrarComo('usr-helena')
    expect(await concluirEscopo('esc-atlantica-2025', '2026-11-15')).toEqual({
      ok: false,
      mensagem: 'Só um escopo aberto pode ser concluído.',
    })
    expect(await cancelarEscopo('esc-atlantica-ssma')).toEqual({ ok: false, mensagem: 'Só um escopo aberto pode ser cancelado.' })
  })
})

describe('reabrirEscopo (RN-17, RN-22, RN-23)', () => {
  it('reabre o Concluído para um status aberto, com justificativa', async () => {
    entrarComo('usr-helena')
    expect(await reabrirEscopo('esc-atlantica-2025', 'Em andamento', 'Novo pedido')).toEqual({
      ok: true,
      mensagem: 'Escopo reaberto. No protótipo, os dados não são gravados.',
    })
    expect(await reabrirEscopo('esc-atlantica-2025', 'Concluído', 'Novo pedido')).toEqual({
      ok: false,
      mensagem: 'Escolha o status de volta.',
    })
    expect(await reabrirEscopo('esc-atlantica-2025', 'Em andamento', ' ')).toEqual({
      ok: false,
      mensagem: 'Escreva a justificativa da reabertura.',
    })
  })

  it('só o Concluído e o Cancelado são reabertos', async () => {
    entrarComo('usr-helena')
    expect(await reabrirEscopo('esc-vertice-qualidade', 'Planejado', 'x')).toEqual({
      ok: false,
      mensagem: 'Só um escopo Concluído ou Cancelado pode ser reaberto.',
    })
  })

  it('com o contrato Encerrado, recusa: o contrato é reaberto antes (RN-23)', async () => {
    entrarComo('usr-helena')
    expect(await reabrirEscopo('esc-ondamar-apoio', 'Em andamento', 'Novo pedido')).toEqual({
      ok: false,
      mensagem: 'O contrato está fechado. Reabra o contrato antes.',
    })
  })
})

describe('moverEscopo (DF-45; ponto de atenção 4)', () => {
  it('move para outro contrato aberto do mesmo cliente', async () => {
    entrarComo('usr-helena')
    expect(await moverEscopo('esc-vertice-documental', 'ctr-vertice-mobilizacao')).toEqual({
      ok: true,
      mensagem: 'Escopo movido. No protótipo, os dados não são gravados.',
    })
  })

  it('o próprio contrato, outro cliente ou um contrato que não existe: recusa', async () => {
    entrarComo('usr-helena')
    for (const destino of ['ctr-vertice-manutencao', 'ctr-montareal-montagem', 'ctr-nao-existe']) {
      expect(await moverEscopo('esc-vertice-documental', destino), destino).toEqual({
        ok: false,
        mensagem: 'Escolha outro contrato aberto do mesmo cliente.',
      })
    }
  })

  it('contrato fechado do mesmo cliente não recebe o escopo (RN-23)', async () => {
    entrarComo('usr-helena')
    expect(await moverEscopo('esc-montareal-montagem', 'ctr-montareal-pintura')).toEqual({
      ok: false,
      mensagem: 'Escolha outro contrato aberto do mesmo cliente.',
    })
  })

  it('o escopo fechado também pode mudar de contrato, e o destino aberto pode estar Suspenso', async () => {
    entrarComo('usr-helena')
    expect((await moverEscopo('esc-atlantica-2025', 'ctr-atlantica-ssma')).ok).toBe(true)
  })
})

describe('excluirEscopo (RN-13, DF-33; critério 19)', () => {
  it('a Jornada mexida impede excluir', async () => {
    entrarComo('usr-helena')
    expect(await excluirEscopo('esc-vertice-documental', 'x')).toEqual({
      ok: false,
      mensagem: 'Este escopo tem registros ligados e não pode ser excluído.',
    })
  })

  it('pede a justificativa; com ela, exclui', async () => {
    entrarComo('usr-helena')
    expect(await excluirEscopo('esc-vertice-qualidade', '  ')).toEqual({
      ok: false,
      mensagem: 'Escreva a justificativa da exclusão.',
    })
    expect(await excluirEscopo('esc-vertice-qualidade', 'Cadastrado em duplicidade.')).toEqual({
      ok: true,
      mensagem: 'Escopo excluído. No protótipo, os dados não são gravados.',
    })
  })
})
