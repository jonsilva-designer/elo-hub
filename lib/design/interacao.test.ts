import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

// Interação básica (padrão 4.8 e 7), achados do Jonathan em 14/11/2026: botões sem mãozinho e o contorno
// de foco aparecendo no clique do mouse.
const raiz = process.cwd()
const css = readFileSync(join(raiz, 'app/globals.css'), 'utf8').replace(/\r\n/g, '\n')

function arquivos(pasta: string): string[] {
  return readdirSync(pasta).flatMap((nome) => {
    const caminho = join(pasta, nome)
    if (statSync(caminho).isDirectory()) return arquivos(caminho)
    return /\.tsx?$/.test(nome) && !/\.test\.tsx?$/.test(nome) ? [caminho] : []
  })
}

describe('cursor', () => {
  it('botões, abas, opções e itens de menu mostram a mãozinho, numa regra da camada base', () => {
    const base = css.match(/@layer base\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
    const regra = base.match(/([^{}]*button:not\(:disabled\)[^{]*)\{([^}]*)\}/)
    expect(regra, 'regra de cursor na camada base').not.toBeNull()
    for (const alvo of ['[role="button"]', '[role="tab"]', '[role="option"]', '[role="menuitem"]', 'summary']) {
      expect(regra![1], alvo).toContain(alvo)
    }
    expect(regra![2]).toMatch(/cursor:\s*pointer/)
  })

  it('nenhum componente força o cursor comum num item clicável', () => {
    const achados: string[] = []
    for (const arquivo of [...arquivos(join(raiz, 'components')), ...arquivos(join(raiz, 'app'))]) {
      if (/\bcursor-default\b/.test(readFileSync(arquivo, 'utf8'))) achados.push(relative(raiz, arquivo))
    }
    expect(achados).toEqual([])
  })
})

describe('contorno de foco só na navegação por teclado (padrão 4.8)', () => {
  it('depois de um clique, o contorno some, menos nos campos de texto', () => {
    const regra = css.match(/(:root\[data-modalidade="ponteiro"\][^{]*):focus-visible\s*\{([^}]*)\}/)
    expect(regra, 'regra do modo ponteiro').not.toBeNull()
    expect(regra![1]).toMatch(/:not\([^)]*input[^)]*textarea/)
    expect(regra![2]).toMatch(/outline:\s*none\s*!important/)
  })

  it('a aba tem o contorno por dentro, porque a lista de abas rola e cortaria o de fora', () => {
    const regra = css.match(/:is\(([^)]*\[role="option"\][^{]*)\):focus-visible\s*\{([^}]*)\}/)
    expect(regra![1]).toContain('[role="tab"]')
    // As abas que são links entre páginas (Configurações) ficam na mesma lista que rola (revisão do código).
    expect(regra![1]).toContain('[data-aba]')
  })
})
