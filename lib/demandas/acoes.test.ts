import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { obterDemanda } from '@/lib/dados/demandas'
import { obterInicioDaOperacao } from '@/lib/dados/parametros'
import {
  comentarDemanda,
  corrigirStatusDemanda,
  mudarStatusDemanda,
  reabrirDemanda,
  registrarDemanda,
  salvarDemanda,
} from './acoes'
import { ESTADO_INICIAL_COMENTARIO, ESTADO_INICIAL_REGISTRAR_DEMANDA, ESTADO_INICIAL_SALVAR_DEMANDA } from './estados'
import { MENSAGENS_DEMANDA } from './validacao'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)
vi.mock('@/lib/dados/parametros', async (original) => ({
  ...(await original<typeof import('@/lib/dados/parametros')>()),
  obterInicioDaOperacao: vi.fn(async () => '2026-03-02'),
}))

beforeEach(() => limparCookies())

const SEM_PERMISSAO = 'Você não tem permissão para esta ação.'

const NOVA: Record<string, string> = {
  clienteId: 'cli-vertice',
  origem: 'Cliente',
  assunto: 'Revisão do aditivo de prazo',
  descricao: 'O cliente quer revisar o aditivo antes de assinar.',
  responsavelTriagemId: 'usr-rafael',
}

function formulario(campos: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [chave, valor] of Object.entries(campos)) fd.set(chave, valor)
  return fd
}

const registrar = (campos: Record<string, string>) =>
  registrarDemanda(ESTADO_INICIAL_REGISTRAR_DEMANDA, formulario({ ...NOVA, ...campos }))

describe('registrarDemanda (parte 5, 5.9; F09, F10)', () => {
  it('registra com o próximo número, avisa do e-mail e volta para a fila (CA-09.1, DF-46)', async () => {
    entrarComo('usr-rafael')
    const estado = await registrar({ contratoId: 'ctr-vertice-manutencao', escopoId: 'esc-vertice-documental' })
    expect(estado.erros).toEqual({})
    expect(estado.sucesso?.destino).toBe('/central')
    expect(estado.sucesso?.mensagem).toMatch(
      /^Demanda ELO-\d{4}-\d{4} registrada\. O e-mail de aviso sai para a triagem e para a Central\. No protótipo, os dados não são gravados\.$/,
    )
  })

  it('antes do início oficial da operação, avisa que o e-mail não sai (DF-46, CA-10.5)', async () => {
    vi.mocked(obterInicioDaOperacao).mockResolvedValueOnce(null)
    entrarComo('usr-rafael')
    expect((await registrar({})).sucesso?.mensagem).toMatch(
      /^Demanda ELO-\d{4}-\d{4} registrada\. O e-mail de aviso só sai depois do início oficial da operação\. No protótipo, os dados não são gravados\.$/,
    )
  })

  it('a Equipe registra para cliente Ativo fora dos vínculos, com a triagem de quem tem vínculo (DF-39, CA-09.9)', async () => {
    entrarComo('usr-rafael')
    const estado = await registrar({
      clienteId: 'cli-montareal',
      responsavelTriagemId: 'usr-helena',
      contratoId: 'ctr-montareal-montagem',
    })
    expect(estado.erros).toEqual({})
    // Contrato e escopo de cliente fora dos vínculos não são aceitos, nem enviados à mão (RN-01).
    expect(estado.valores?.contratoId).toBe('')
    expect(estado.sucesso?.mensagem).toContain('A triagem fica com quem tem vínculo com o cliente.')
  })

  it('a triagem precisa ter vínculo com o cliente (RN-19)', async () => {
    entrarComo('usr-rafael')
    expect((await registrar({ clienteId: 'cli-montareal', responsavelTriagemId: 'usr-rafael' })).erros).toEqual({
      responsavelTriagemId: MENSAGENS_DEMANDA.responsavelSemVinculo,
    })
  })

  it('cliente Inativo ou que não existe não é aceito', async () => {
    entrarComo('usr-helena')
    expect((await registrar({ clienteId: 'cli-fortec' })).erros).toEqual({ clienteId: MENSAGENS_DEMANDA.cliente })
    expect((await registrar({ clienteId: 'cli-x' })).erros).toEqual({ clienteId: MENSAGENS_DEMANDA.cliente })
  })

  it('contrato de outro cliente e escopo de outro contrato são recusados (DF-12, RN-02)', async () => {
    entrarComo('usr-helena')
    expect((await registrar({ contratoId: 'ctr-atlantica-porto' })).erros).toEqual({ contratoId: MENSAGENS_DEMANDA.contrato })
    expect((await registrar({ contratoId: 'ctr-vertice-mobilizacao', escopoId: 'esc-vertice-documental' })).erros).toEqual({
      escopoId: MENSAGENS_DEMANDA.escopo,
    })
  })

  it('escopo sem contrato leva o contrato do escopo', async () => {
    entrarComo('usr-helena')
    expect((await registrar({ escopoId: 'esc-vertice-documental' })).valores?.contratoId).toBe('ctr-vertice-manutencao')
  })

  it('a origem Institucional só no cadastro da ELO, que só aceita ela (CA-09.15)', async () => {
    entrarComo('usr-helena')
    expect((await registrar({ origem: 'Institucional' })).erros).toEqual({ origem: MENSAGENS_DEMANDA.institucionalForaDaElo })
    expect(
      (await registrar({ clienteId: 'cli-elo', origem: 'Cliente', responsavelTriagemId: 'usr-helena' })).erros,
    ).toEqual({ origem: MENSAGENS_DEMANDA.eloSoInstitucional })
    expect(
      (await registrar({ clienteId: 'cli-elo', origem: 'Institucional', responsavelTriagemId: 'usr-helena' })).sucesso,
    ).toBeDefined()
  })

  it('os obrigatórios', async () => {
    entrarComo('usr-helena')
    expect((await registrar({ origem: '', assunto: ' ', descricao: '', responsavelTriagemId: '' })).erros).toEqual({
      origem: MENSAGENS_DEMANDA.origem,
      assunto: MENSAGENS_DEMANDA.assunto,
      descricao: MENSAGENS_DEMANDA.descricao,
      responsavelTriagemId: MENSAGENS_DEMANDA.responsavelTriagem,
    })
  })
})

describe('mudarStatusDemanda (PRD 6.1; critérios 7 a 10)', () => {
  it('iniciar o atendimento exige categoria, criticidade e atendente (CA-09.2)', async () => {
    entrarComo('usr-rafael')
    expect(await mudarStatusDemanda('ELO-2026-0010', 'iniciar-atendimento', '')).toEqual({
      ok: false,
      mensagem: 'Falta para iniciar o atendimento: Categoria, Criticidade, Responsável pelo atendimento.',
    })
    expect(await mudarStatusDemanda('ELO-2026-0010', 'iniciar-triagem', '')).toEqual({
      ok: true,
      mensagem: 'Demanda em triagem. No protótipo, os dados não são gravados.',
    })
  })

  it('resolver exige a solução; voltar da Resolvida exige o motivo (CA-09.3, CA-09.11)', async () => {
    entrarComo('usr-rafael')
    expect(await mudarStatusDemanda('ELO-2026-0003', 'resolver', ' ')).toEqual({ ok: false, mensagem: 'Escreva a solução.' })
    expect((await mudarStatusDemanda('ELO-2026-0003', 'resolver', 'Certidões renovadas.')).ok).toBe(true)
    expect(await mudarStatusDemanda('ELO-2026-0005', 'voltar-ao-atendimento', '')).toEqual({
      ok: false,
      mensagem: 'Escreva o motivo da volta ao atendimento.',
    })
    expect((await mudarStatusDemanda('ELO-2026-0005', 'voltar-ao-atendimento', 'O cliente discordou.')).ok).toBe(true)
  })

  it('encerrar a Resolvida exige o retorno; encerrar sem resolver exige a justificativa (CA-09.4, CA-09.8)', async () => {
    entrarComo('usr-rafael')
    expect(await mudarStatusDemanda('ELO-2026-0005', 'encerrar', '')).toEqual({
      ok: false,
      mensagem: 'Escreva o retorno dado ao cliente.',
    })
    expect(await mudarStatusDemanda('ELO-2026-0005', 'encerrar', 'Informado por telefone.')).toEqual({
      ok: true,
      mensagem: 'Demanda encerrada. No protótipo, os dados não são gravados.',
    })
    expect(await mudarStatusDemanda('ELO-2026-0010', 'encerrar-sem-resolver', '')).toEqual({
      ok: false,
      mensagem: 'Escreva a justificativa do encerramento.',
    })
  })

  it('só o atendente ou o Administrador encerram; sem atendente, a triagem (DF-61)', async () => {
    entrarComo('usr-rafael')
    // A ELO-2026-0004 tem a triagem da Helena e o atendimento do Rafael; a 0008, triagem do Rafael e atendimento da Helena.
    expect((await mudarStatusDemanda('ELO-2026-0004', 'encerrar-sem-resolver', 'Desistência.')).ok).toBe(true)
    expect(await mudarStatusDemanda('ELO-2026-0008', 'encerrar-sem-resolver', 'Duplicada.')).toEqual({
      ok: false,
      mensagem: SEM_PERMISSAO,
    })
  })

  it('ação que não vale para o status é recusada; fora do vínculo, sem dizer que a demanda existe (CA-09.9)', async () => {
    entrarComo('usr-rafael')
    expect(await mudarStatusDemanda('ELO-2026-0010', 'resolver', 'x')).toEqual({
      ok: false,
      mensagem: 'Esta mudança não vale para a demanda neste status.',
    })
    expect(await mudarStatusDemanda('ELO-2026-0011', 'iniciar-triagem', '')).toEqual({ ok: false, mensagem: SEM_PERMISSAO })
    expect(await mudarStatusDemanda('ELO-2026-0001', 'reabrir', 'x')).toEqual({ ok: false, mensagem: SEM_PERMISSAO })
  })
})

describe('corrigirStatusDemanda (RN-22, CA-17.4)', () => {
  const ok = { ok: true, mensagem: 'Status corrigido. No protótipo, os dados não são gravados.' }

  it('só o Administrador corrige, com justificativa, para um status fora das mudanças listadas', async () => {
    entrarComo('usr-rafael')
    expect(await corrigirStatusDemanda('ELO-2026-0003', 'Nova', 'Triagem feita por engano.')).toEqual({
      ok: false,
      mensagem: SEM_PERMISSAO,
    })
    entrarComo('usr-helena')
    expect(await corrigirStatusDemanda('ELO-2026-0003', 'Nova', 'Triagem feita por engano.')).toEqual(ok)
    expect(await corrigirStatusDemanda('ELO-2026-0003', 'Nova', '  ')).toEqual({
      ok: false,
      mensagem: 'Escreva a justificativa da correção.',
    })
    expect(await corrigirStatusDemanda('ELO-2026-0003', 'Resolvida', 'Motivo')).toEqual({
      ok: false,
      mensagem: 'Escolha um dos status da correção.',
    })
    expect(await corrigirStatusDemanda('ELO-2026-0005', 'Em triagem', 'Faltou classificar.')).toEqual(ok)
    expect(await corrigirStatusDemanda('ELO-2026-0099', 'Nova', 'Motivo')).toEqual({ ok: false, mensagem: SEM_PERMISSAO })
  })

  it('cumpre as exigências do status de destino', async () => {
    entrarComo('usr-helena')
    expect(await corrigirStatusDemanda('ELO-2026-0009', 'Aguardando retorno', 'Já estava com o cliente.')).toEqual({
      ok: false,
      mensagem: 'Falta para iniciar o atendimento: Categoria, Criticidade, Responsável pelo atendimento.',
    })
    expect(await corrigirStatusDemanda('ELO-2026-0009', 'Resolvida', 'Já tinha sido resolvida por telefone.')).toEqual({
      ok: false,
      mensagem: 'Para passar a Resolvida, a demanda precisa ter a solução.',
    })
  })

  it('a Encerrada não se corrige: volta por Reabrir', async () => {
    entrarComo('usr-helena')
    expect(await corrigirStatusDemanda('ELO-2026-0001', 'Nova', 'Motivo')).toEqual({
      ok: false,
      mensagem: 'A demanda Encerrada volta por Reabrir.',
    })
  })
})

describe('reabrirDemanda (RN-12, RN-17, RN-22; critério 11)', () => {
  it('só o Administrador reabre a Encerrada, com status de volta e justificativa', async () => {
    entrarComo('usr-rafael')
    expect(await reabrirDemanda('ELO-2026-0001', 'Em atendimento', 'Motivo')).toEqual({ ok: false, mensagem: SEM_PERMISSAO })
    entrarComo('usr-helena')
    expect(await reabrirDemanda('ELO-2026-0001', 'Em atendimento', '')).toEqual({
      ok: false,
      mensagem: 'Escreva a justificativa da reabertura.',
    })
    expect(await reabrirDemanda('ELO-2026-0001', 'Encerrada', 'Motivo')).toEqual({ ok: false, mensagem: 'Escolha o status de volta.' })
    expect(await reabrirDemanda('ELO-2026-0001', 'Em atendimento', 'O cliente voltou a perguntar.')).toEqual({
      ok: true,
      mensagem: 'Demanda reaberta. No protótipo, os dados não são gravados.',
    })
    expect(await reabrirDemanda('ELO-2026-0003', 'Nova', 'Motivo')).toEqual({
      ok: false,
      mensagem: 'Só uma demanda Encerrada pode ser reaberta.',
    })
  })

  it('o status de volta precisa cumprir as exigências dele (RN-22)', async () => {
    entrarComo('usr-helena')
    expect(await reabrirDemanda('ELO-2026-0002', 'Em atendimento', 'Não era duplicada.')).toEqual({
      ok: false,
      mensagem: 'Falta para iniciar o atendimento: Categoria, Criticidade, Responsável pelo atendimento.',
    })
    expect((await reabrirDemanda('ELO-2026-0002', 'Nova', 'Não era duplicada.')).ok).toBe(true)
  })
})

/** Os campos de uma demanda que existe, como o formulário de edição manda. */
async function edicao(numero: string, campos: Record<string, string> = {}, especialistas?: string[]) {
  const d = (await obterDemanda(numero))!
  const fd = formulario({
    numero: d.numero,
    contratoId: d.contratoId ?? '',
    escopoId: d.escopoId ?? '',
    origem: d.origem,
    assunto: d.assunto,
    descricao: d.descricao,
    categoria: d.categoria ?? '',
    criticidade: d.criticidade ?? '',
    prazo: d.prazo ?? '',
    responsavelTriagemId: d.responsavelTriagemId,
    responsavelAtendimentoId: d.responsavelAtendimentoId ?? '',
    principalId: d.especialistas.find((e) => e.principal)?.id ?? '',
    ...campos,
  })
  for (const id of especialistas ?? d.especialistas.map((e) => e.id)) fd.append('especialistaIds', id)
  return salvarDemanda(ESTADO_INICIAL_SALVAR_DEMANDA, fd)
}

describe('salvarDemanda (parte 5, 5.11; critérios 12 e 14)', () => {
  it('a triagem completa salva e volta para a demanda', async () => {
    entrarComo('usr-rafael')
    const estado = await edicao('ELO-2026-0010', {
      categoria: 'Dúvida contratual',
      criticidade: 'Moderada',
      responsavelAtendimentoId: 'usr-rafael',
      prazo: '2026-12-01',
    })
    expect(estado.erros).toEqual({})
    expect(estado.sucesso).toEqual({
      mensagem: 'Demanda salva. No protótipo, os dados não são gravados.',
      destino: '/central/ELO-2026-0010',
    })
  })

  it('com mais de um especialista, o principal é obrigatório e é um deles (CA-09.12)', async () => {
    entrarComo('usr-rafael')
    expect((await edicao('ELO-2026-0003', { principalId: '' })).erros).toEqual({ especialistas: MENSAGENS_DEMANDA.principal })
    expect((await edicao('ELO-2026-0003', { principalId: 'esp-contratos' })).erros).toEqual({
      especialistas: MENSAGENS_DEMANDA.principal,
    })
    expect((await edicao('ELO-2026-0003', { principalId: 'esp-esg' })).sucesso).toBeDefined()
  })

  it('vínculo novo só com especialista Ativo; o Inativo já ligado continua (CA-11.2, DF-51)', async () => {
    entrarComo('usr-helena')
    const estado = await edicao('ELO-2026-0006', { principalId: 'esp-financeiro' }, ['esp-financeiro', 'esp-riscos'])
    expect(estado.valores?.especialistaIds).toEqual(['esp-financeiro'])
  })

  it('depois da triagem, categoria, criticidade e atendente não podem sair (CA-09.2)', async () => {
    entrarComo('usr-rafael')
    expect((await edicao('ELO-2026-0003', { categoria: '', criticidade: '', responsavelAtendimentoId: '' })).erros).toEqual({
      categoria: MENSAGENS_DEMANDA.categoria,
      criticidade: MENSAGENS_DEMANDA.criticidade,
      responsavelAtendimentoId: MENSAGENS_DEMANDA.atendimento,
    })
  })

  it('contrato, escopo e origem seguem as regras do registro; prazo inválido é recusado (DF-12, CA-09.15)', async () => {
    entrarComo('usr-helena')
    expect((await edicao('ELO-2026-0010', { contratoId: 'ctr-atlantica-porto' })).erros).toEqual({
      contratoId: MENSAGENS_DEMANDA.contrato,
    })
    expect((await edicao('ELO-2026-0010', { origem: 'Institucional' })).erros).toEqual({
      origem: MENSAGENS_DEMANDA.institucionalForaDaElo,
    })
    expect((await edicao('ELO-2026-0010', { prazo: '2026-02-30' })).erros).toEqual({ prazo: MENSAGENS_DEMANDA.data })
    expect((await edicao('ELO-2026-0010', { responsavelAtendimentoId: 'usr-marcos' })).erros).toEqual({
      responsavelAtendimentoId: MENSAGENS_DEMANDA.responsavelSemVinculo,
    })
  })

  it('a Equipe não edita a Encerrada (RN-17); fora do vínculo, recusa', async () => {
    entrarComo('usr-rafael')
    expect(await edicao('ELO-2026-0001')).toMatchObject({ erroGeral: SEM_PERMISSAO })
    entrarComo('usr-helena')
    expect((await edicao('ELO-2026-0001')).sucesso).toBeDefined()
    entrarComo('usr-rafael')
    const fd = formulario({ numero: 'ELO-2026-0011', origem: 'Cliente', assunto: 'x', descricao: 'x', responsavelTriagemId: 'usr-helena' })
    expect(await salvarDemanda(ESTADO_INICIAL_SALVAR_DEMANDA, fd)).toMatchObject({ erroGeral: SEM_PERMISSAO })
  })
})

const comentar = (campos: Record<string, string>) =>
  comentarDemanda(ESTADO_INICIAL_COMENTARIO, formulario({ numero: 'ELO-2026-0003', tipo: 'Comentário', texto: 'Ok.', ...campos }))

describe('comentarDemanda (CA-09.6, CA-09.13; DF-30)', () => {
  it('a Equipe vinculada comenta a demanda aberta', async () => {
    entrarComo('usr-rafael')
    expect((await comentar({})).sucesso).toBe('Comentário registrado. No protótipo, os dados não são gravados.')
    expect((await comentar({ texto: ' ' })).erros).toEqual({ texto: 'Escreva o comentário.' })
  })

  it('o contato com especialista exige um especialista da demanda e a data do contato', async () => {
    entrarComo('usr-rafael')
    const contato = { tipo: 'Contato com especialista', texto: 'Liguei para a especialista.' }
    expect((await comentar(contato)).erros).toEqual({
      especialistaId: 'Escolha o especialista do contato.',
      dataContato: 'Informe a data do contato.',
    })
    expect((await comentar({ ...contato, especialistaId: 'esp-contratos', dataContato: '2026-11-16' })).erros).toEqual({
      especialistaId: 'Escolha o especialista do contato.',
    })
    expect((await comentar({ ...contato, especialistaId: 'esp-juridico', dataContato: '2026-11-16' })).sucesso).toBeDefined()
  })

  it('a demanda encerrada não recebe comentário; fora do vínculo, recusa sem dizer que existe', async () => {
    entrarComo('usr-helena')
    expect(await comentar({ numero: 'ELO-2026-0001' })).toMatchObject({ erroGeral: 'A demanda encerrada não recebe comentários.' })
    entrarComo('usr-rafael')
    expect(await comentar({ numero: 'ELO-2026-0011' })).toMatchObject({ erroGeral: SEM_PERMISSAO })
  })
})
