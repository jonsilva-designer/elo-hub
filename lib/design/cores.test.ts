import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { razaoDeContraste } from './contraste'
import { CORES, PARES_DE_CONTRASTE } from './cores'
import { PALETA } from './paleta'

const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8')

describe('paleta para fora do CSS', () => {
  it('cada cor do PDF é igual à variável --elo-* de mesmo nome', () => {
    for (const [nome, hex] of Object.entries(PALETA)) {
      expect(css.toLowerCase(), nome).toContain(`--elo-${nome}: ${hex.toLowerCase()};`)
    }
  })
})
const raiz = css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
const variaveis = new Map<string, string>()
for (const m of raiz.matchAll(/(--elo-[a-z-]+):\s*(#[0-9A-Fa-f]{6})\s*;/g)) {
  variaveis.set(m[1], m[2])
}

const valor = (token: string) => {
  const v = variaveis.get(token)
  if (!v) throw new Error(`Token ausente no CSS: ${token}`)
  return v
}

describe('razaoDeContraste', () => {
  it('dourado sobre azul-marinho fica em cerca de 4,64', () => {
    expect(razaoDeContraste('#BD903F', '#182F4F')).toBeCloseTo(4.64, 1)
  })
  it('cores iguais dão 1', () => {
    expect(razaoDeContraste('#FFFFFF', '#FFFFFF')).toBe(1)
  })
  it('dourado sobre branco não passa como texto', () => {
    expect(razaoDeContraste('#BD903F', '#FFFFFF')).toBeLessThan(4.5)
  })
  it('não depende da ordem dos argumentos', () => {
    expect(razaoDeContraste('#182F4F', '#FFFFFF')).toBeCloseTo(
      razaoDeContraste('#FFFFFF', '#182F4F'),
      10,
    )
  })
})

describe('variáveis do :root', () => {
  it('fixa as cores da marca da especificação', () => {
    expect(valor('--elo-azul-marinho').toUpperCase()).toBe('#182F4F')
    expect(valor('--elo-dourado').toUpperCase()).toBe('#BD903F')
    expect(valor('--elo-papel').toUpperCase()).toBe('#FAF8F4')
  })
  it('todo token de CORES existe no CSS', () => {
    for (const cor of CORES) expect(variaveis.has(cor.token), cor.token).toBe(true)
  })
  it('só azul-marinho e dourado são provisórios', () => {
    for (const cor of CORES) {
      const esperado = cor.token === '--elo-azul-marinho' || cor.token === '--elo-dourado'
      expect(cor.provisoria, cor.token).toBe(esperado)
    }
  })
  it('lista as 14 cores', () => {
    expect(CORES).toHaveLength(14)
  })
})

describe('PARES_DE_CONTRASTE', () => {
  it('tem pares', () => {
    expect(PARES_DE_CONTRASTE.length).toBeGreaterThanOrEqual(17)
  })
  for (const par of PARES_DE_CONTRASTE) {
    it(`${par.descricao} atinge ${par.minimo}`, () => {
      expect(razaoDeContraste(valor(par.frente), valor(par.fundo))).toBeGreaterThanOrEqual(par.minimo)
    })
  }
})
