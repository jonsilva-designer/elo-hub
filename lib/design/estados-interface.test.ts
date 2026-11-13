import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Tons de passar o mouse e de pressionado (padrão visual, seção 7). Mesmo jeito de ler o CSS que cores.test.ts.
const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8')
const raiz = css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
const tema = css.match(/@theme inline\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''

function declaracao(bloco: string, nome: string) {
  const v = bloco.match(new RegExp(`${nome}:\\s*([^;]+);`))?.[1]
  if (!v) throw new Error(`Variável ausente: ${nome}`)
  return v.trim()
}

/** Lê `color-mix(in oklch, var(--base), black N%)` e devolve a base e o N. */
function escurecimento(valor: string) {
  const m = valor.match(/^color-mix\(in oklch, var\((--[a-z-]+)\), black (\d+(?:\.\d+)?)%\)$/)
  if (!m) throw new Error(`Não é um tom mais escuro de uma variável: ${valor}`)
  return { base: m[1], porcento: Number(m[2]) }
}

const TONS = ['primary', 'destructive'] as const
const TODAS = [
  '--primary-hover',
  '--primary-active',
  '--destructive-hover',
  '--destructive-active',
  '--surface-hover',
  '--surface-active',
  '--input-hover',
]

describe('tons de passar o mouse e de pressionado', () => {
  for (const tom of TONS) {
    it(`${tom}: passar o mouse escurece a base e pressionar escurece mais`, () => {
      const hover = escurecimento(declaracao(raiz, `--${tom}-hover`))
      const active = escurecimento(declaracao(raiz, `--${tom}-active`))
      expect(hover.base).toBe(`--${tom}`)
      expect(active.base).toBe(`--${tom}`)
      expect(hover.porcento).toBeGreaterThan(0)
      expect(active.porcento).toBeGreaterThan(hover.porcento)
    })
  }

  it('superfície neutra (secundário e discreto): passar o mouse é o muted e pressionar o escurece', () => {
    expect(declaracao(raiz, '--surface-hover')).toBe('var(--muted)')
    const active = escurecimento(declaracao(raiz, '--surface-active'))
    expect(active.base).toBe('--muted')
    expect(active.porcento).toBeGreaterThan(0)
  })

  it('a borda do campo escurece o --input', () => {
    const hover = escurecimento(declaracao(raiz, '--input-hover'))
    expect(hover.base).toBe('--input')
    expect(hover.porcento).toBeGreaterThan(0)
  })

  it('nenhum tom tem hex próprio: todos saem das variáveis do padrão', () => {
    for (const v of TODAS) expect(declaracao(raiz, v), v).not.toMatch(/#[0-9a-f]{3,8}\b/i)
  })

  it('o @theme expõe cada tom como cor do Tailwind', () => {
    for (const v of TODAS) expect(declaracao(tema, `--color-${v.slice(2)}`), v).toBe(`var(${v})`)
  })
})

describe('foco da linha de tabela', () => {
  it('a linha clicável tem o contorno por dentro, porque a tabela rola e cortaria o de fora', () => {
    const regra = css.match(/:is\(([^)]*\[role="option"\][^{]*)\):focus-visible\s*\{([^}]*)\}/)
    expect(regra, 'regra do contorno por dentro').not.toBeNull()
    expect(regra![1]).toContain('tr[tabindex]')
    expect(regra![2]).toMatch(/outline-offset:\s*-2px/)
  })
})
