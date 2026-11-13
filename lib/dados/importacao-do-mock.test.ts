// @vitest-environment node
import { join } from 'node:path'
import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

// As telas leem tudo por lib/dados: a pasta mock é apagada na Etapa 3 (especificação da parte 1, 5.4).
const eslint = new ESLint({ cwd: process.cwd() })

async function regrasAcusadas(codigo: string, arquivo: string) {
  const [resultado] = await eslint.lintText(codigo, { filePath: join(process.cwd(), arquivo) })
  return resultado.messages.map((m) => m.ruleId)
}

describe('importar lib/dados/mock', () => {
  it('é erro de lint fora de lib/dados, com o atalho @/', async () => {
    const regras = await regrasAcusadas("import { USUARIOS } from '@/lib/dados/mock/usuarios'\nexport const x = USUARIOS\n", 'app/exemplo.tsx')
    expect(regras).toContain('no-restricted-imports')
  }, 30_000)

  it('é erro de lint fora de lib/dados, com caminho relativo', async () => {
    const regras = await regrasAcusadas("import { CLIENTES } from '../lib/dados/mock/clientes'\nexport const x = CLIENTES\n", 'components/exemplo.tsx')
    expect(regras).toContain('no-restricted-imports')
  }, 30_000)

  it('é permitido dentro de lib/dados', async () => {
    const regras = await regrasAcusadas("import { USUARIOS } from '@/lib/dados/mock/usuarios'\nexport const x = USUARIOS\n", 'lib/dados/exemplo.ts')
    expect(regras).not.toContain('no-restricted-imports')
  }, 30_000)
})
