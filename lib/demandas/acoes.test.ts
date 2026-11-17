import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { registrarDemanda } from './acoes'
import { ESTADO_INICIAL_REGISTRAR_DEMANDA } from './estados'
import { MENSAGENS_DEMANDA } from './validacao'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

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
