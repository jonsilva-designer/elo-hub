import { describe, expect, it } from 'vitest'
import { destinoSeguro } from './rotas'

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
