import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Perfil } from '@/lib/dados/tipos'
import { cookiesFalsos, destinoDe, entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { definirSenha, entrar, entrarComoPerfil, pedirRecuperacao, sair } from './acoes'
import { ESTADO_INICIAL_DEFINIR_SENHA, ESTADO_INICIAL_ENTRAR, ESTADO_INICIAL_RECUPERACAO } from './estados'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => (await import('@/lib/testes/next-falso')).moduloNavigation)

beforeEach(() => limparCookies())

function form(campos: Record<string, string>) {
  const dados = new FormData()
  for (const [nome, valor] of Object.entries(campos)) dados.set(nome, valor)
  return dados
}

const sessao = () => cookiesFalsos.get('elo_sessao')?.value

const HELENA = 'helena.prado@elogovernance.com.br'

describe('entrar', () => {
  it('com campos vazios, devolve os erros por campo e não grava cookie', async () => {
    const estado = await entrar(ESTADO_INICIAL_ENTRAR, form({ email: '', senha: '', destino: '/inicio' }))
    expect(estado.erros).toEqual({ email: 'Informe o e-mail.', senha: 'Informe a senha.' })
    expect(estado.erroGeral).toBeUndefined()
    expect(sessao()).toBeUndefined()
  })

  it('com erro num campo, devolve o e-mail digitado para o campo não ficar vazio', async () => {
    const estado = await entrar(ESTADO_INICIAL_ENTRAR, form({ email: HELENA, senha: '', destino: '/inicio' }))
    expect(estado.email).toBe(HELENA)
    expect(estado.erros).toEqual({ senha: 'Informe a senha.' })
  })

  it('com e-mail desconhecido, diz que e-mail ou senha estão incorretos e não grava cookie (F01)', async () => {
    const estado = await entrar(
      ESTADO_INICIAL_ENTRAR,
      form({ email: 'ninguem@elogovernance.com.br', senha: 'x', destino: '/inicio' }),
    )
    expect(estado.erroGeral).toBe('E-mail ou senha incorretos.')
    expect(estado.email).toBe('ninguem@elogovernance.com.br')
    expect(sessao()).toBeUndefined()
  })

  it('com o usuário inativo, nega o acesso e não grava cookie (CA-01.3)', async () => {
    const estado = await entrar(
      ESTADO_INICIAL_ENTRAR,
      form({ email: 'marcos.lima@elogovernance.com.br', senha: 'x', destino: '/inicio' }),
    )
    expect(estado.erroGeral).toBe('Acesso negado: este usuário está inativo. Fale com o Administrador da ELO.')
    expect(sessao()).toBeUndefined()
  })

  it('com tudo certo, grava a sessão e vai ao destino', async () => {
    const destino = await destinoDe(entrar(ESTADO_INICIAL_ENTRAR, form({ email: HELENA, senha: 'x', destino: '/designsystem' })))
    expect(destino).toBe('/designsystem')
    expect(sessao()).toBe('usr-helena')
  })

  it.each(['//site.com', '/login', ''])('troca o destino %j por /inicio', async (destino) => {
    expect(await destinoDe(entrar(ESTADO_INICIAL_ENTRAR, form({ email: HELENA, senha: 'x', destino })))).toBe('/inicio')
  })

  it('sem o campo destino, vai a /inicio', async () => {
    expect(await destinoDe(entrar(ESTADO_INICIAL_ENTRAR, form({ email: HELENA, senha: 'x' })))).toBe('/inicio')
  })

  it('encontra o usuário com maiúsculas e espaços nas pontas', async () => {
    await destinoDe(
      entrar(ESTADO_INICIAL_ENTRAR, form({ email: '  HELENA.PRADO@ELOGOVERNANCE.COM.BR ', senha: 'x', destino: '/inicio' })),
    )
    expect(sessao()).toBe('usr-helena')
  })
})

describe('entrarComoPerfil (botões do protótipo)', () => {
  it('Administrador entra como a Helena e vai ao destino', async () => {
    expect(await destinoDe(entrarComoPerfil('Administrador', '/inicio'))).toBe('/inicio')
    expect(sessao()).toBe('usr-helena')
  })

  it('Equipe entra como o Rafael e vai ao destino', async () => {
    expect(await destinoDe(entrarComoPerfil('Equipe', '/designsystem'))).toBe('/designsystem')
    expect(sessao()).toBe('usr-rafael')
  })

  it('respeita o destino seguro', async () => {
    expect(await destinoDe(entrarComoPerfil('Equipe', '//site.com'))).toBe('/inicio')
  })

  it('um perfil forjado não grava cookie e volta ao login', async () => {
    expect(await destinoDe(entrarComoPerfil('Root' as Perfil, '/inicio'))).toBe('/login')
    expect(sessao()).toBeUndefined()
  })
})

describe('sair', () => {
  it('apaga a sessão e vai ao login (F01)', async () => {
    entrarComo('usr-helena')
    expect(await destinoDe(sair())).toBe('/login')
    expect(sessao()).toBeUndefined()
  })
})

describe('pedirRecuperacao (CA-01.5)', () => {
  it('dá a mesma resposta para e-mail cadastrado e não cadastrado', async () => {
    const cadastrado = await pedirRecuperacao(ESTADO_INICIAL_RECUPERACAO, form({ email: HELENA }))
    const naoCadastrado = await pedirRecuperacao(
      ESTADO_INICIAL_RECUPERACAO,
      form({ email: 'ninguem@elogovernance.com.br' }),
    )
    expect(cadastrado).toMatchObject({ enviado: true })
    expect(cadastrado.erro).toBeUndefined()
    expect({ ...naoCadastrado, email: '' }).toEqual({ ...cadastrado, email: '' })
  })

  it('recusa o e-mail inválido e o vazio', async () => {
    expect(await pedirRecuperacao(ESTADO_INICIAL_RECUPERACAO, form({ email: 'helena' }))).toMatchObject({
      erro: 'Informe um e-mail válido.',
      enviado: false,
    })
    expect(await pedirRecuperacao(ESTADO_INICIAL_RECUPERACAO, form({ email: '' }))).toMatchObject({
      erro: 'Informe o e-mail.',
      enviado: false,
    })
  })
})

describe('definirSenha', () => {
  it('recusa a senha curta', async () => {
    const estado = await definirSenha(ESTADO_INICIAL_DEFINIR_SENHA, form({ senha: 'curta', confirmacao: 'curta' }))
    expect(estado.erros).toEqual({ senha: 'A senha precisa ter pelo menos 8 caracteres.' })
  })

  it('recusa senhas diferentes', async () => {
    const estado = await definirSenha(
      ESTADO_INICIAL_DEFINIR_SENHA,
      form({ senha: '12345678', confirmacao: '87654321' }),
    )
    expect(estado.erros).toEqual({ confirmacao: 'As senhas não são iguais.' })
  })

  it('com tudo certo, vai ao login com o aviso, sem gravar nada', async () => {
    const destino = await destinoDe(
      definirSenha(ESTADO_INICIAL_DEFINIR_SENHA, form({ senha: '12345678', confirmacao: '12345678' })),
    )
    expect(destino).toBe('/login?aviso=senha-definida')
    expect(sessao()).toBeUndefined()
  })
})
