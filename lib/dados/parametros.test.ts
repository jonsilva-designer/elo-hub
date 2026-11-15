import { describe, expect, it } from 'vitest'
import { obterDiasDoAlerta } from './parametros'

describe('obterDiasDoAlerta (DF-34, DF-81)', () => {
  it('começa com os 30 dias do Apêndice C', async () => {
    expect(await obterDiasDoAlerta()).toBe(30)
  })
})
