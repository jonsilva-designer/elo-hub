import { describe, expect, it } from 'vitest'
import { decidirRota, destinoSeguro } from './rotas'

describe('destinoSeguro', () => {
  it.each(['/designsystem', '/clientes?aba=contratos', '/login-antigo'])('mantém o caminho interno %s', (destino) => {
    expect(destinoSeguro(destino)).toBe(destino)
  })

  it.each([
    ['outro site sem protocolo', '//site.com'],
    ['outro site com protocolo', 'https://site.com'],
    ['barra invertida, que o navegador lê como //', '/\\site.com'],
    ['tabulação, que o navegador apaga', '/\t/site.com'],
    ['quebra de linha', '/\n/site.com'],
    ['javascript', 'javascript:alert(1)'],
    ['sem barra no começo', 'inicio'],
    ['vazio', ''],
    ['o próprio login', '/login'],
    ['o login com busca', '/login?destino=/x'],
    ['o login com âncora', '/login#topo'],
    ['o login com barra no fim', '/login/'],
  ])('troca por /inicio: %s', (_caso, destino) => {
    expect(destinoSeguro(destino)).toBe('/inicio')
  })

  it.each([null, undefined, ['/designsystem'], 42])('troca por /inicio o que não é texto: %j', (destino) => {
    expect(destinoSeguro(destino)).toBe('/inicio')
  })
})

describe('decidirRota (proxy)', () => {
  it('rota protegida sem cookie vai ao login, com o caminho pedido', () => {
    expect(decidirRota('/inicio', '', false)).toBe('/login?destino=%2Finicio')
  })

  it('leva a busca junto no destino', () => {
    expect(decidirRota('/clientes/cli-vertice', '?aba=contratos', false)).toBe(
      '/login?destino=%2Fclientes%2Fcli-vertice%3Faba%3Dcontratos',
    )
  })

  it('/designsystem pede login', () => {
    expect(decidirRota('/designsystem', '', false)).toBe('/login?destino=%2Fdesignsystem')
    expect(decidirRota('/designsystem', '', true)).toBeNull()
  })

  it.each(['/login', '/recuperar-senha', '/definir-senha', '/site', '/site/diagnostico', '/site/especialista'])(
    '%s fica aberta, com e sem cookie',
    (caminho) => {
      expect(decidirRota(caminho, '', false)).toBeNull()
      expect(decidirRota(caminho, '', true)).toBeNull()
    },
  )

  it('/sitex não é do site e pede login', () => {
    expect(decidirRota('/sitex', '', false)).toBe('/login?destino=%2Fsitex')
  })

  it('a raiz segue o cookie', () => {
    expect(decidirRota('/', '', true)).toBe('/inicio')
    expect(decidirRota('/', '', false)).toBe('/login')
  })
})
