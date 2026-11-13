import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Regras globais do globals.css que valem para todos os componentes. Mesmo jeito de ler o CSS que cores.test.ts.
const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8').replace(/\r\n/g, '\n')

/** O CSS sem os blocos `@layer ... { }`: o que sobra fica fora de camada e vence as classes do Tailwind. */
function foraDeCamadas(texto: string) {
  let saida = ''
  let i = 0
  while (i < texto.length) {
    const inicio = texto.indexOf('@layer', i)
    if (inicio === -1) {
      saida += texto.slice(i)
      break
    }
    saida += texto.slice(i, inicio)
    let j = texto.indexOf('{', inicio)
    let nivel = 1
    while (nivel > 0 && ++j < texto.length) {
      if (texto[j] === '{') nivel++
      else if (texto[j] === '}') nivel--
    }
    i = j + 1
  }
  return saida
}

/** Corpo da regra cujo seletor é exatamente `seletor`, fora de camada. */
function regra(seletor: string) {
  const escapado = seletor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return foraDeCamadas(css).match(new RegExp(`(?:^|\\}|\\*/)\\s*${escapado}\\s*\\{([^}]*)\\}`))?.[1]
}

describe('ícones', () => {
  it('todo ícone Lucide tem traço 1,6 (padrão 4.7), numa regra fora de camada', () => {
    const corpo = regra('svg.lucide')
    expect(corpo, 'regra svg.lucide fora de camada').toBeDefined()
    expect(corpo).toMatch(/stroke-width:\s*1\.6\s*;/)
  })
})
