import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ehUltimoAdministradorAtivo, emailValido } from '@/lib/usuarios/regras'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { itensAbertosDoUsuario, listarUsuarios, obterUsuario, responsaveisParaRedistribuir } from './usuarios-configuracao'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

describe('usuários na configuração (F01)', () => {
  it('só o Administrador lê os usuários, com os vínculos (CA-01.2, CA-01.4)', async () => {
    entrarComo('usr-rafael')
    expect(await listarUsuarios()).toEqual([])
    expect(await obterUsuario('usr-helena')).toBeNull()
    expect(await itensAbertosDoUsuario('usr-rafael')).toEqual([])
    entrarComo('usr-helena')
    const usuarios = await listarUsuarios()
    expect(usuarios.map((u) => u.nome)).toEqual(['Helena Prado', 'Marcos Lima', 'Rafael Souza'])
    expect((await obterUsuario('usr-rafael'))?.clientes.map((c) => c.nome)).toEqual(['Atlântica Portos', 'Rede Norte TI', 'Vértice Manutenção'])
    expect(await obterUsuario('usr-nao-existe')).toBeNull()
  })

  it('o último Administrador ativo (DF-37, CA-01.8)', () => {
    const helena = { id: 'a', perfil: 'Administrador', status: 'Ativo' } as const
    const outro = { id: 'b', perfil: 'Administrador', status: 'Ativo' } as const
    const inativo = { id: 'c', perfil: 'Administrador', status: 'Inativo' } as const
    expect(ehUltimoAdministradorAtivo('a', [helena, inativo])).toBe(true)
    expect(ehUltimoAdministradorAtivo('a', [helena, outro])).toBe(false)
    expect(ehUltimoAdministradorAtivo('c', [helena, inativo])).toBe(false)
  })

  it('e-mail válido', () => {
    expect(emailValido('ana.souza@elogovernance.com.br')).toBe(true)
    expect(emailValido('ana@')).toBe(false)
    expect(emailValido('ana souza@x.com')).toBe(false)
  })

  it('os itens abertos sob a responsabilidade do usuário, de cada tipo, com o link (RN-18, DF-36)', async () => {
    entrarComo('usr-helena')
    const itens = await itensAbertosDoUsuario('usr-rafael')
    const tipos = new Set(itens.map((i) => i.tipo))
    for (const tipo of ['Escopo', 'Etapa', 'Plano', 'Atividade', 'Demanda', 'Avaliação']) expect(tipos, tipo).toContain(tipo)
    expect(itens.find((i) => i.descricao === 'Protocolar a renovação da licença de operação')).toMatchObject({
      tipo: 'Atividade',
      cliente: 'Vértice Manutenção',
      href: '/atividades/atv-licencas-protocolo/editar',
    })
    expect(itens.every((i) => i.status !== 'Concluída' && i.status !== 'Encerrada' && i.status !== 'Concluído')).toBe(true)
    const daRedeNorte = await itensAbertosDoUsuario('usr-rafael', 'cli-rede-norte')
    expect(daRedeNorte.length).toBeGreaterThan(0)
    expect(daRedeNorte.every((i) => i.clienteId === 'cli-rede-norte')).toBe(true)
    expect(await itensAbertosDoUsuario('usr-marcos')).toEqual([])
  })

  it('quem pode receber os itens: os Administradores e a Equipe ativa vinculada a todos os clientes, menos a própria pessoa (RN-19)', async () => {
    entrarComo('usr-helena')
    expect((await responsaveisParaRedistribuir('usr-rafael', ['cli-vertice'])).map((u) => u.nome)).toEqual(['Helena Prado'])
    expect((await responsaveisParaRedistribuir('usr-helena', ['cli-vertice', 'cli-atlantica'])).map((u) => u.nome)).toEqual([
      'Rafael Souza',
    ])
    expect((await responsaveisParaRedistribuir('usr-helena', ['cli-montareal'])).map((u) => u.nome)).toEqual([])
  })
})
