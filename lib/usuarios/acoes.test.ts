import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { inativarUsuario, reativarUsuario, redistribuirItens, salvarUsuario } from './acoes'
import { ESTADO_INICIAL_USUARIO } from './estados'
import { MENSAGENS_USUARIO } from './validacao'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

const SEM_PERMISSAO = 'Você não tem permissão para esta ação.'
const NAO_GRAVA = 'No protótipo, os dados não são gravados.'

function formulario(campos: Record<string, string | string[]>): FormData {
  const fd = new FormData()
  for (const [chave, valor] of Object.entries(campos)) {
    for (const v of Array.isArray(valor) ? valor : [valor]) fd.append(chave, v)
  }
  return fd
}

const salvar = (campos: Record<string, string | string[]>) => salvarUsuario(ESTADO_INICIAL_USUARIO, formulario(campos))

const NOVA = { nome: 'Ana Ribeiro', email: 'ana.ribeiro@elogovernance.com.br', perfil: 'Equipe', clienteIds: ['cli-vertice', 'cli-ondamar'] }
const RAFAEL = {
  id: 'usr-rafael',
  nome: 'Rafael Souza',
  email: 'rafael.souza@elogovernance.com.br',
  perfil: 'Equipe',
  clienteIds: ['cli-vertice', 'cli-atlantica', 'cli-rede-norte'],
}

describe('salvarUsuario (parte 8, 4.1; F01)', () => {
  it('a Equipe é recusada no cadastro e na edição (CA-01.4)', async () => {
    entrarComo('usr-rafael')
    expect((await salvar(NOVA)).erroGeral).toBe(SEM_PERMISSAO)
    expect((await salvar(RAFAEL)).erroGeral).toBe(SEM_PERMISSAO)
  })

  it('cadastra a Equipe com os clientes; o convite sai para o e-mail (DF-04, DF-23)', async () => {
    entrarComo('usr-helena')
    expect((await salvar(NOVA)).sucesso).toEqual({
      mensagem: `Usuário cadastrado. O convite sai para ana.ribeiro@elogovernance.com.br. ${NAO_GRAVA}`,
      destino: '/configuracoes/usuarios',
    })
    expect((await salvar({ ...NOVA, perfil: 'Administrador', clienteIds: [] })).erros).toEqual({})
  })

  it('recusa sem os obrigatórios, e-mail inválido ou repetido, e Equipe sem cliente', async () => {
    entrarComo('usr-helena')
    expect((await salvar({})).erros).toEqual({
      nome: MENSAGENS_USUARIO.nome,
      email: MENSAGENS_USUARIO.email,
      perfil: MENSAGENS_USUARIO.perfil,
    })
    expect((await salvar({ ...NOVA, email: 'ana@' })).erros).toEqual({ email: MENSAGENS_USUARIO.email })
    expect((await salvar({ ...NOVA, email: 'RAFAEL.SOUZA@elogovernance.com.br' })).erros).toEqual({ email: MENSAGENS_USUARIO.emailRepetido })
    expect((await salvar({ ...NOVA, clienteIds: [] })).erros).toEqual({ clienteIds: MENSAGENS_USUARIO.clientes })
    expect((await salvar({ ...NOVA, clienteIds: ['cli-inventado'] })).erros).toEqual({ clienteIds: MENSAGENS_USUARIO.clientes })
  })

  it('edita: o próprio e-mail não conta como repetido, e o vínculo novo entra', async () => {
    entrarComo('usr-helena')
    const estado = await salvar({ ...RAFAEL, clienteIds: [...RAFAEL.clienteIds, 'cli-ondamar'] })
    expect(estado.erros).toEqual({})
    expect(estado.sucesso).toEqual({ mensagem: `Usuário salvo. ${NAO_GRAVA}`, destino: '/configuracoes/usuarios/usr-rafael' })
  })

  it('não tira o vínculo com cliente onde a pessoa responde por itens abertos, e lista os itens (DF-36, CA-01.7)', async () => {
    entrarComo('usr-helena')
    const estado = await salvar({ ...RAFAEL, clienteIds: ['cli-vertice', 'cli-atlantica'] })
    expect(estado.erroGeral).toBe(MENSAGENS_USUARIO.vinculoComItens('Rede Norte TI'))
    expect(estado.impedimentos?.length).toBeGreaterThan(0)
    expect(estado.impedimentos?.every((i) => i.clienteId === 'cli-rede-norte')).toBe(true)
  })

  it('o último Administrador ativo não passa para Equipe (DF-37, CA-01.8)', async () => {
    entrarComo('usr-helena')
    const estado = await salvar({
      id: 'usr-helena',
      nome: 'Helena Prado',
      email: 'helena.prado@elogovernance.com.br',
      perfil: 'Equipe',
      clienteIds: ['cli-vertice'],
    })
    expect(estado.erros).toEqual({ perfil: MENSAGENS_USUARIO.ultimoAdministrador })
  })

  it('id que não existe recebe a mesma recusa', async () => {
    entrarComo('usr-helena')
    expect((await salvar({ ...RAFAEL, id: 'usr-nao-existe' })).erroGeral).toBe(SEM_PERMISSAO)
  })
})

describe('inativar, reativar e redistribuir (DF-36, DF-37; CA-01.7 a CA-01.9)', () => {
  const ok = (frase: string) => ({ ok: true, mensagem: `${frase} ${NAO_GRAVA}` })

  it('a Equipe é recusada em tudo (CA-01.4)', async () => {
    entrarComo('usr-rafael')
    expect(await inativarUsuario('usr-marcos')).toEqual({ ok: false, mensagem: SEM_PERMISSAO })
    expect(await reativarUsuario('usr-marcos')).toEqual({ ok: false, mensagem: SEM_PERMISSAO })
    expect(await redistribuirItens('usr-rafael', ['atividade:atv-licencas-protocolo'], 'usr-helena')).toEqual({
      ok: false,
      mensagem: SEM_PERMISSAO,
    })
  })

  it('o último Administrador ativo não é inativado (CA-01.8)', async () => {
    entrarComo('usr-helena')
    expect(await inativarUsuario('usr-helena')).toEqual({ ok: false, mensagem: MENSAGENS_USUARIO.ultimoInativado })
  })

  it('com itens abertos, não inativa e lista os itens (CA-01.7)', async () => {
    entrarComo('usr-helena')
    const resultado = await inativarUsuario('usr-rafael')
    expect(resultado).toMatchObject({ ok: false, mensagem: MENSAGENS_USUARIO.comItens })
    expect(resultado.ok === false && resultado.impedimentos?.length).toBeGreaterThan(5)
  })

  it('reativa o inativo; o que já está no status recebe a recusa', async () => {
    entrarComo('usr-helena')
    expect(await reativarUsuario('usr-marcos')).toEqual(ok('Usuário reativado.'))
    expect(await reativarUsuario('usr-rafael')).toEqual({ ok: false, mensagem: 'O usuário já está ativo.' })
    expect(await inativarUsuario('usr-marcos')).toEqual({ ok: false, mensagem: 'O usuário já está inativo.' })
  })

  it('redistribui os itens escolhidos para quem tem vínculo com o cliente de cada um (CA-01.9, RN-19)', async () => {
    entrarComo('usr-helena')
    const itens = ['atividade:atv-licencas-protocolo', 'escopo:esc-vertice-documental']
    expect(await redistribuirItens('usr-rafael', itens, 'usr-helena')).toEqual(ok('Itens redistribuídos.'))
    expect(await redistribuirItens('usr-rafael', [], 'usr-helena')).toEqual({ ok: false, mensagem: MENSAGENS_USUARIO.itens })
    expect(await redistribuirItens('usr-rafael', ['item:inventado'], 'usr-helena')).toEqual({ ok: false, mensagem: MENSAGENS_USUARIO.itens })
    expect(await redistribuirItens('usr-rafael', itens, '')).toEqual({ ok: false, mensagem: MENSAGENS_USUARIO.novoResponsavel })
    expect(await redistribuirItens('usr-rafael', itens, 'usr-marcos')).toEqual({ ok: false, mensagem: MENSAGENS_USUARIO.semVinculo })
    expect(await redistribuirItens('usr-rafael', itens, 'usr-rafael')).toEqual({ ok: false, mensagem: MENSAGENS_USUARIO.semVinculo })
  })
})
