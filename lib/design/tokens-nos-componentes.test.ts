import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

// Mesmo sentido, um só token (padrão 4.1): onde há classe do tema (bg-card, text-primary, border-divisoria...),
// o componente usa a classe, e não var(--elo-...) solto. Ficam soltos só os tons de status, de criticidade
// e de alerta, que não têm classe própria.
const PERMITIDOS = /^--elo-(status-|crit-)/

function arquivos(pasta: string): string[] {
  return readdirSync(pasta).flatMap((nome) => {
    const caminho = join(pasta, nome)
    if (statSync(caminho).isDirectory()) return arquivos(caminho)
    return /\.tsx?$/.test(nome) && !/\.test\.tsx?$/.test(nome) ? [caminho] : []
  })
}

describe('tokens nos componentes', () => {
  it('nenhuma classe usa var(--elo-...) quando há classe do tema', () => {
    const raiz = process.cwd()
    const soltos: string[] = []
    for (const arquivo of [...arquivos(join(raiz, 'components')), ...arquivos(join(raiz, 'app'))]) {
      const fonte = readFileSync(arquivo, 'utf8')
      for (const m of fonte.matchAll(/var\((--elo-[a-z-]+)\)/g)) {
        if (!PERMITIDOS.test(m[1])) soltos.push(`${relative(raiz, arquivo)}: ${m[1]}`)
      }
    }
    expect(soltos).toEqual([])
  })
})
