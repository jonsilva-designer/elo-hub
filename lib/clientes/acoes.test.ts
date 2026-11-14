import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listarClientes } from '@/lib/dados/clientes'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { salvarCliente } from './acoes'
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
