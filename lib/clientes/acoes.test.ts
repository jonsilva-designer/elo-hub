import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listarClientes, obterCliente } from '@/lib/dados/clientes'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { excluirCliente, inativarCliente, reativarCliente, salvarCliente } from './acoes'
import { ESTADO_INICIAL_SALVAR_CLIENTE } from './estados'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const SEM_PERMISSAO = 'Você não tem permissão para esta ação.'

function formulario(campos: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [chave, valor] of Object.entries(campos)) fd.set(chave, valor)
  return fd
}

const NOVO = { razaoSocial: 'Nova Empresa Ltda', cnpj: '11.222.333/0001-81', status: 'Prospect' }
const salvar = (campos: Record<string, string>) => salvarCliente(ESTADO_INICIAL_SALVAR_CLIENTE, formulario(campos))

describe('salvarCliente (F02, matriz 4.3)', () => {
  it('a Equipe é recusada, mesmo com dados válidos', async () => {
    entrarComo('usr-rafael')
    const r = await salvar(NOVO)
    expect(r.erroGeral).toBe(SEM_PERMISSAO)
    expect(r.sucesso).toBeUndefined()
  })

  it('recusa o CNPJ de outro cliente, mesmo sem pontuação', async () => {
    entrarComo('usr-helena')
    const r = await salvar({ ...NOVO, cnpj: '21473509000121' })
    expect(r.erros.cnpj).toBe('Já existe um cliente com este CNPJ: Vértice Manutenção.')
    expect(r.valores?.razaoSocial).toBe('Nova Empresa Ltda')
  })

  it('um cadastro válido responde como salvo, avisa que nada é gravado e volta à lista', async () => {
    entrarComo('usr-helena')
    const r = await salvar(NOVO)
    expect(r.erros).toEqual({})
    expect(r.sucesso).toEqual({
      mensagem: 'Cliente salvo. No protótipo, os dados não são gravados.',
      destino: '/clientes',
    })
    expect(await listarClientes()).toHaveLength(8)
  })

  it('na edição, aceita o próprio CNPJ e volta à página do cliente', async () => {
    entrarComo('usr-helena')
    const r = await salvar({
      id: 'cli-vertice',
      razaoSocial: 'Vértice Manutenção Industrial Ltda',
      cnpj: '21473509000121',
      status: 'Ativo',
    })
    expect(r.erros).toEqual({})
    expect(r.sucesso?.destino).toBe('/clientes/cli-vertice')
  })

  it('a edição de um id que não existe é recusada sem dizer por quê', async () => {
    entrarComo('usr-helena')
    expect((await salvar({ ...NOVO, id: 'cli-nao-existe' })).erroGeral).toBe(SEM_PERMISSAO)
  })
})

describe('inativar, reativar e excluir (RN-18, DF-33, matriz 4.3)', () => {
  it('a Equipe é recusada nas três ações, sem saber se o cliente existe', async () => {
    entrarComo('usr-rafael')
    expect(await inativarCliente('cli-vertice')).toEqual({ ok: false, mensagem: SEM_PERMISSAO })
    expect(await reativarCliente('cli-fortec', 'Ativo')).toEqual({ ok: false, mensagem: SEM_PERMISSAO })
    expect(await excluirCliente('cli-limpar', 'Duplicado')).toEqual({ ok: false, mensagem: SEM_PERMISSAO })
  })

  it('inativar a Vértice é recusado e lista a avaliação Em elaboração (CA-18.3)', async () => {
    entrarComo('usr-helena')
    const r = await inativarCliente('cli-vertice')
    expect(r).toMatchObject({
      ok: false,
      mensagem: 'Não é possível inativar este cliente enquanto houver itens abertos ligados a ele.',
    })
    expect(r.ok === false && r.impedimentos?.map((i) => i.href)).toEqual([
      '/avaliacoes/ava-vertice-3',
      '/contratos/ctr-vertice-manutencao',
      '/contratos/ctr-vertice-mobilizacao',
      '/contratos/ctr-vertice-proposta',
    ])
  })

  it('inativar a Ondamar, só com contrato Encerrado, passa, e avisa que nada é gravado', async () => {
    entrarComo('usr-helena')
    expect(await inativarCliente('cli-ondamar')).toEqual({
      ok: true,
      mensagem: 'Cliente inativado. No protótipo, os dados não são gravados.',
    })
  })

  it('o cadastro da ELO não é inativado nem excluído (DF-40)', async () => {
    entrarComo('usr-helena')
    const mensagem = 'O cadastro da ELO não pode ser inativado nem excluído.'
    expect(await inativarCliente('cli-elo')).toEqual({ ok: false, mensagem })
    expect(await excluirCliente('cli-elo', 'x')).toEqual({ ok: false, mensagem })
  })

  it('inativar quem já está inativo é recusado', async () => {
    entrarComo('usr-helena')
    expect(await inativarCliente('cli-fortec')).toEqual({ ok: false, mensagem: 'Este cliente já está inativo.' })
  })

  it('reativar pede Prospect ou Ativo e só vale para o cliente Inativo', async () => {
    entrarComo('usr-helena')
    expect(await reativarCliente('cli-fortec', 'Prospect')).toEqual({
      ok: true,
      mensagem: 'Cliente reativado. No protótipo, os dados não são gravados.',
    })
    for (const status of ['Inativo', 'Xyz', '']) {
      expect(await reativarCliente('cli-fortec', status), status).toEqual({ ok: false, mensagem: 'Escolha Prospect ou Ativo.' })
    }
    expect(await reativarCliente('cli-vertice', 'Ativo')).toEqual({
      ok: false,
      mensagem: 'Só um cliente inativo pode ser reativado.',
    })
  })

  it('excluir só vale sem registros ligados e com justificativa (CA-18.4)', async () => {
    entrarComo('usr-helena')
    expect(await excluirCliente('cli-vertice', 'x')).toEqual({
      ok: false,
      mensagem: 'Este cliente tem registros ligados e não pode ser excluído.',
    })
    expect(await excluirCliente('cli-limpar', '   ')).toEqual({ ok: false, mensagem: 'Escreva a justificativa da exclusão.' })
    expect(await excluirCliente('cli-limpar', 'Cadastro duplicado')).toEqual({
      ok: true,
      mensagem: 'Cliente excluído. No protótipo, os dados não são gravados.',
    })
  })

  it('um id que não existe é recusado como sem permissão', async () => {
    entrarComo('usr-helena')
    expect(await inativarCliente('cli-nao-existe')).toEqual({ ok: false, mensagem: SEM_PERMISSAO })
  })

  it('nada muda nos dados: salvar só simula', async () => {
    entrarComo('usr-helena')
    await inativarCliente('cli-ondamar')
    await excluirCliente('cli-limpar', 'Cadastro duplicado')
    expect((await obterCliente('cli-ondamar'))?.status).toBe('Ativo')
    expect(await obterCliente('cli-limpar')).not.toBeNull()
  })
})

