import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import { cn, TAMANHOS_DE_TEXTO } from '@/lib/utils'

// Tamanho de texto só por token (padrão 4.2): a escala fica num lugar só, em app/globals.css,
// e mudar um papel da escala (o texto secundário, por exemplo) muda em toda a plataforma.
const raiz = process.cwd()
const css = readFileSync(join(raiz, 'app/globals.css'), 'utf8')

function arquivos(pasta: string): string[] {
  return readdirSync(pasta).flatMap((nome) => {
    const caminho = join(pasta, nome)
    if (statSync(caminho).isDirectory()) return arquivos(caminho)
    return /\.tsx?$/.test(nome) && !/\.test\.tsx?$/.test(nome) ? [caminho] : []
  })
}

describe('tamanhos de texto', () => {
  it('nenhum tamanho de texto escrito à mão', () => {
    const achados: string[] = []
    for (const arquivo of [...arquivos(join(raiz, 'app')), ...arquivos(join(raiz, 'components'))]) {
      const fonte = readFileSync(arquivo, 'utf8')
      for (const m of fonte.matchAll(/text-\[\d[^\]]*\]|text-\(length:[^)]*\)/g)) {
        achados.push(`${relative(raiz, arquivo)}: ${m[0]}`)
      }
    }
    expect(achados).toEqual([])
  })

  it('os tokens têm os valores da escala do padrão (4.2)', () => {
    for (const declaracao of [
      '--text-titulo-pagina: 26px',
      '--text-titulo-painel: 15px',
      '--text-secundario: 13px',
      '--text-rotulo: 11px',
      '--text-grupo: 10.5px',
      '--text-indicador: 30px',
    ]) {
      expect(css).toContain(declaracao)
    }
  })

  it('nenhum token de tamanho tem o nome de uma cor', () => {
    const tamanhos = [...css.matchAll(/--text-([a-z0-9-]+):/g)].map((m) => m[1])
    const cores = new Set([...css.matchAll(/--color-([a-z0-9-]+):/g)].map((m) => m[1]))
    expect(tamanhos.length).toBeGreaterThan(0)
    expect(tamanhos.filter((nome) => cores.has(nome))).toEqual([])
  })
})

// O cn junta as classes e descarta a que conflita. Sem conhecer os tokens de tamanho, ele lê
// text-titulo-painel como cor e o apaga ao lado de text-primary.
describe('cn com os tokens de tamanho', () => {
  it('mantém o tamanho ao lado de uma cor de texto', () => {
    expect(cn('text-titulo-painel font-bold text-primary').split(' ')).toEqual(
      expect.arrayContaining(['text-titulo-painel', 'text-primary']),
    )
    expect(cn('text-secundario text-muted-foreground').split(' ')).toEqual(
      expect.arrayContaining(['text-secundario', 'text-muted-foreground']),
    )
  })

  it('troca um tamanho por outro, como faz com os do Tailwind', () => {
    expect(cn('text-secundario', 'text-sm')).toBe('text-sm')
    expect(cn('text-sm', 'text-titulo-pagina')).toBe('text-titulo-pagina')
  })

  it('conhece todos os tokens de tamanho do globals.css', () => {
    const tamanhos = [...css.matchAll(/--text-([a-z0-9-]+):/g)].map((m) => m[1])
    expect([...TAMANHOS_DE_TEXTO].sort()).toEqual(tamanhos.sort())
  })
})
