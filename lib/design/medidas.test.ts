import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import { cn, ESPACOS_ENTRE_LETRAS } from '@/lib/utils'

// Medidas só por token (varredura de 14/11/2026, a pedido do Jonathan): espaçamento entre letras, larguras,
// alturas, respiros e cantos saem do tema, e nada fica escrito à mão em px, rem ou em.
const raiz = process.cwd()
const css = readFileSync(join(raiz, 'app/globals.css'), 'utf8')

function arquivos(pasta: string): string[] {
  return readdirSync(pasta).flatMap((nome) => {
    const caminho = join(pasta, nome)
    if (statSync(caminho).isDirectory()) return arquivos(caminho)
    return /\.tsx?$/.test(nome) && !/\.test\.tsx?$/.test(nome) ? [caminho] : []
  })
}

const CLASSE_COM_MEDIDA =
  /(?<=[\s"'`:])(-?(?:w|h|size|min-w|max-w|min-h|max-h|p[xytrblse]?|m[xytrblse]?|gap(?:-[xy])?|space-[xy]|rounded(?:-(?:t|b|l|r|s|e|tl|tr|bl|br))?|tracking|leading|inset(?:-[xy])?|top|left|right|bottom))-\[([^\]\s]+)\]/g

/** Número com unidade, ou `em` sem zero na frente, sem passar por variável nem pela escala de espaçamento. */
const escritoAMao = (valor: string) =>
  /(\d|\.\d)(px|rem|em|%|vh|dvh|svh|vw)/.test(valor) && !/var\(--|--spacing\(/.test(valor)

describe('medidas', () => {
  it('nenhuma medida escrita à mão em app/ e components/', () => {
    const achados: string[] = []
    for (const arquivo of [...arquivos(join(raiz, 'app')), ...arquivos(join(raiz, 'components'))]) {
      for (const m of readFileSync(arquivo, 'utf8').matchAll(CLASSE_COM_MEDIDA)) {
        if (escritoAMao(m[2])) achados.push(`${relative(raiz, arquivo)}: ${m[0]}`)
      }
    }
    expect(achados).toEqual([])
  })

  it('o espaçamento entre letras da escala do padrão (4.2) é token', () => {
    for (const declaracao of ['--tracking-titulo: -0.02em', '--tracking-rotulo: 0.09em', '--tracking-grupo: 0.12em']) {
      expect(css).toContain(declaracao)
    }
  })

  it('a largura da lateral e da gaveta do celular é token (padrão 5)', () => {
    expect(css).toContain('--container-lateral: 212px')
    expect(css).toContain('--container-gaveta: 280px')
  })

  it('o cn conhece o espaçamento entre letras da ELO e troca um pelo outro', () => {
    expect(cn('tracking-rotulo', 'tracking-wide')).toBe('tracking-wide')
    expect(cn('tracking-wide', 'tracking-grupo')).toBe('tracking-grupo')
    const tokens = [...css.matchAll(/--tracking-([a-z0-9-]+):/g)].map((m) => m[1])
    expect([...ESPACOS_ENTRE_LETRAS].sort()).toEqual(tokens.sort())
  })
})

describe('componentes nas telas', () => {
  it('as telas não usam elemento cru de formulário nem de tabela: usam a biblioteca', () => {
    const achados: string[] = []
    for (const arquivo of arquivos(join(raiz, 'app'))) {
      const fonte = readFileSync(arquivo, 'utf8')
      for (const m of fonte.matchAll(/<(button|select|textarea|table|dialog|label|input)\b[^>]*>/g)) {
        if (m[1] === 'input' && /type="hidden"/.test(m[0])) continue
        achados.push(`${relative(raiz, arquivo)}: <${m[1]}>`)
      }
    }
    expect(achados).toEqual([])
  })
})
