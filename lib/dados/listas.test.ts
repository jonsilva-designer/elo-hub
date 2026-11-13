import { describe, expect, it } from 'vitest'
import { listarSegmentos } from './listas'

describe('listarSegmentos (DF-70)', () => {
  it('devolve os 11 segmentos do Apêndice C, na ordem do PRD', async () => {
    expect(await listarSegmentos()).toEqual([
      'Óleo e gás',
      'Portuário e logística',
      'Indústria',
      'Construção e montagem',
      'Manutenção e serviços industriais',
      'Serviços gerais',
      'Offshore e Serviços Marítimos',
      'Infraestrutura',
      'Energia',
      'Mineração',
      'Tecnologia',
    ])
  })

  it('alterar a lista devolvida não altera a próxima leitura', async () => {
    const lista = await listarSegmentos()
    lista.push('Inventado')
    expect(await listarSegmentos()).toHaveLength(11)
  })
})
