// @vitest-environment node
import { NextRequest } from 'next/server'
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server'
import { describe, expect, it } from 'vitest'
import { config, proxy } from './proxy'

describe('proxy', () => {
  it('sem cookie, manda a rota protegida ao login com o destino', () => {
    const resposta = proxy(new NextRequest('http://localhost/inicio'))
    expect(resposta.status).toBe(307)
    expect(resposta.headers.get('location')).toBe('http://localhost/login?destino=%2Finicio')
  })

  it('com o cookie, deixa seguir', () => {
    const resposta = proxy(
      new NextRequest('http://localhost/inicio', { headers: { cookie: 'elo_sessao=usr-helena' } }),
    )
    expect(resposta.headers.get('location')).toBeNull()
  })

  it.each(['/_next/static/x.js', '/_next/image', '/marca/logo-elo.png', '/favicon.ico'])(
    'não roda em arquivos estáticos: %s',
    (url) => {
      expect(unstable_doesMiddlewareMatch({ config, url })).toBe(false)
    },
  )

  it.each(['/inicio', '/', '/designsystem', '/login'])('roda nas páginas: %s', (url) => {
    expect(unstable_doesMiddlewareMatch({ config, url })).toBe(true)
  })
})
