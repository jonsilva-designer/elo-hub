import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { cancelarPlano, concluirPlano, excluirPlano, reabrirPlano, salvarPlano } from './acoes'
import { ESTADO_INICIAL_SALVAR_PLANO } from './estados'
import { MENSAGENS_PLANO } from './validacao'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const SEM_PERMISSAO = 'Você não tem permissão para esta ação.'

/** Um plano novo no ciclo 2026 da Atlântica, válido, como o formulário manda. */
const NOVO: Record<string, string> = {
  escopoId: 'esc-atlantica-2026',
  nome: 'Treinamento dos operadores',
  responsavelId: 'usr-rafael',
  status: 'Aberto',
}

function formulario(campos: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [chave, valor] of Object.entries(campos)) fd.set(chave, valor)
  return fd
}

const salvar = (campos: Record<string, string>) => salvarPlano(ESTADO_INICIAL_SALVAR_PLANO, formulario({ ...NOVO, ...campos }))

/** A edição do plano das licenças, com os dados dele. */
const EDICAO_LICENCAS = {
  id: 'pla-vertice-licencas',
  escopoId: '',
  nome: 'Regularização das licenças',
  status: 'Em andamento',
}

describe('salvarPlano (parte 4, 5.6; critérios 6, 7, 8 e 10)', () => {
  it('o Rafael cadastra num escopo de cliente vinculado e volta ao escopo, com o aviso de que nada foi gravado', async () => {
    entrarComo('usr-rafael')
    const estado = await salvar({})
    expect(estado.erros).toEqual({})
    expect(estado.sucesso).toEqual({
      mensagem: 'Plano salvo. No protótipo, os dados não são gravados.',
      destino: '/escopos/esc-atlantica-2026',
    })
  })

  it('escopo fora do vínculo ou que não existe: recusa, sem dizer qual', async () => {
    entrarComo('usr-rafael')
    expect(await salvar({ escopoId: 'esc-montareal-montagem' })).toMatchObject({ erroGeral: SEM_PERMISSAO })
    expect(await salvar({ escopoId: 'esc-nao-existe' })).toMatchObject({ erroGeral: SEM_PERMISSAO })
    expect(await salvar({ id: 'pla-montareal-estruturas' })).toMatchObject({ erroGeral: SEM_PERMISSAO })
  })

  it('escopo fechado não recebe plano novo (RN-23)', async () => {
    entrarComo('usr-helena')
    expect(await salvar({ escopoId: 'esc-atlantica-2025' })).toMatchObject({ erroGeral: MENSAGENS_PLANO.escopoFechado })
  })

  it('obrigatórios e responsável sem vínculo, mesmo enviado à mão (RN-19)', async () => {
    entrarComo('usr-helena')
    expect((await salvar({ nome: '', responsavelId: '' })).erros).toEqual({
      nome: MENSAGENS_PLANO.nome,
      responsavelId: MENSAGENS_PLANO.responsavel,
    })
    expect((await salvar({ responsavelId: 'usr-marcos' })).erros).toEqual({
      responsavelId: MENSAGENS_PLANO.responsavelSemVinculo,
    })
  })

  it('a avaliação de outro cliente volta vazia; a do mesmo cliente fica (RN-02, DF-80)', async () => {
    entrarComo('usr-helena')
    expect((await salvar({ avaliacaoId: 'ava-vertice-2' })).valores?.avaliacaoId).toBe('')
    expect((await salvar({ avaliacaoId: 'ava-atlantica-1' })).valores?.avaliacaoId).toBe('ava-atlantica-1')
  })

  it('na edição, o escopo é o do plano, e salvo volta ao plano', async () => {
    entrarComo('usr-rafael')
    const estado = await salvar({ ...EDICAO_LICENCAS, escopoId: 'esc-atlantica-2026' })
    expect(estado.valores?.escopoId).toBe('esc-vertice-documental')
    expect(estado.sucesso?.destino).toBe('/planos/pla-vertice-licencas')
  })

  it('a Equipe não edita o plano fechado; a Helena edita, sem mudar o status (RN-17)', async () => {
    entrarComo('usr-rafael')
    const fechado = { id: 'pla-atlantica-fechamento', nome: 'Fechamento do ciclo 2025', status: 'Concluído' }
    expect(await salvar(fechado)).toMatchObject({ erroGeral: SEM_PERMISSAO })
    entrarComo('usr-helena')
    expect((await salvar(fechado)).sucesso).toBeDefined()
    expect((await salvar({ ...fechado, status: 'Aberto' })).erros).toEqual({ status: MENSAGENS_PLANO.fechado })
  })
})

describe('concluirPlano e cancelarPlano (RN-18; critério 12)', () => {
  it('a atividade aberta impede concluir, com a lista', async () => {
    entrarComo('usr-rafael')
    const resultado = await concluirPlano('pla-vertice-licencas')
    expect(resultado).toMatchObject({
      ok: false,
      mensagem: 'Não é possível concluir este plano enquanto houver atividades abertas.',
    })
    expect(resultado.ok ? [] : resultado.impedimentos?.map((i) => i.descricao)).toEqual([
      'Protocolar a renovação da licença de operação',
      'Agendar a vistoria do órgão ambiental',
      'Preparar a auditoria interna dos documentos',
    ])
  })

  it('sem atividade aberta, a Equipe conclui e cancela (6.1)', async () => {
    entrarComo('usr-rafael')
    expect(await concluirPlano('pla-atlantica-indicadores')).toEqual({
      ok: true,
      mensagem: 'Plano concluído. No protótipo, os dados não são gravados.',
    })
    expect(await cancelarPlano('pla-atlantica-indicadores')).toEqual({
      ok: true,
      mensagem: 'Plano cancelado. No protótipo, os dados não são gravados.',
    })
  })

  it('o plano fechado não é concluído nem cancelado de novo', async () => {
    entrarComo('usr-helena')
    expect(await concluirPlano('pla-atlantica-fechamento')).toEqual({ ok: false, mensagem: 'Só um plano aberto pode ser concluído.' })
    expect(await cancelarPlano('pla-rede-norte-implantacao')).toEqual({ ok: false, mensagem: 'Só um plano aberto pode ser cancelado.' })
  })

  it('fora do vínculo ou com id que não existe: recusa, sem dizer qual', async () => {
    entrarComo('usr-rafael')
    expect(await concluirPlano('pla-montareal-estruturas')).toEqual({ ok: false, mensagem: SEM_PERMISSAO })
    expect(await cancelarPlano('pla-nao-existe')).toEqual({ ok: false, mensagem: SEM_PERMISSAO })
  })
})

describe('reabrirPlano (RN-17, RN-22, RN-23; critérios 11 e 14)', () => {
  it('a Helena reabre o Cancelado para um status aberto, com justificativa', async () => {
    entrarComo('usr-helena')
    expect(await reabrirPlano('pla-rede-norte-implantacao', 'Em andamento', 'O aditivo foi assinado.')).toEqual({
      ok: true,
      mensagem: 'Plano reaberto. No protótipo, os dados não são gravados.',
    })
    expect(await reabrirPlano('pla-rede-norte-implantacao', 'Em andamento', ' ')).toEqual({
      ok: false,
      mensagem: 'Escreva a justificativa da reabertura.',
    })
    expect(await reabrirPlano('pla-rede-norte-implantacao', 'Concluído', 'Motivo')).toEqual({
      ok: false,
      mensagem: 'Escolha o status de volta.',
    })
  })

  it('a Equipe não reabre (CN-17.1)', async () => {
    entrarComo('usr-rafael')
    expect(await reabrirPlano('pla-rede-norte-implantacao', 'Aberto', 'Motivo')).toEqual({ ok: false, mensagem: SEM_PERMISSAO })
  })

  it('só o fechado é reaberto; com o escopo fechado, recusa (RN-23)', async () => {
    entrarComo('usr-helena')
    expect(await reabrirPlano('pla-vertice-licencas', 'Aberto', 'Motivo')).toEqual({
      ok: false,
      mensagem: 'Só um plano Concluído ou Cancelado pode ser reaberto.',
    })
    expect(await reabrirPlano('pla-atlantica-fechamento', 'Aberto', 'Motivo')).toEqual({
      ok: false,
      mensagem: 'O escopo está fechado. Reabra o escopo antes.',
    })
  })
})

describe('excluirPlano (RN-13, DF-33; critério 15)', () => {
  it('a Helena exclui o plano sem atividades, com justificativa', async () => {
    entrarComo('usr-helena')
    expect(await excluirPlano('pla-atlantica-indicadores', 'Criado por engano.')).toEqual({
      ok: true,
      mensagem: 'Plano excluído. No protótipo, os dados não são gravados.',
    })
    expect(await excluirPlano('pla-atlantica-indicadores', '')).toEqual({
      ok: false,
      mensagem: 'Escreva a justificativa da exclusão.',
    })
  })

  it('o plano com atividades não é excluído', async () => {
    entrarComo('usr-helena')
    expect(await excluirPlano('pla-vertice-licencas', 'Motivo')).toEqual({
      ok: false,
      mensagem: 'Este plano tem atividades e não pode ser excluído.',
    })
  })

  it('a Equipe não exclui (CA-18.1)', async () => {
    entrarComo('usr-rafael')
    expect(await excluirPlano('pla-atlantica-indicadores', 'Motivo')).toEqual({ ok: false, mensagem: SEM_PERMISSAO })
  })
})
