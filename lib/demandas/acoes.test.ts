import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { mudarStatusDemanda, reabrirDemanda, registrarDemanda } from './acoes'
import { ESTADO_INICIAL_REGISTRAR_DEMANDA } from './estados'
import { MENSAGENS_DEMANDA } from './validacao'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

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
