import { describe, expect, it } from 'vitest'
import type { AvaliacaoMaturidade, LinhaDimensao } from '@/lib/dados/tipos'
import { formatarMedia, lerMedia, maturidadeDoCliente, oQueFaltaParaConcluir } from './regras'

const linha = (dimensao: string, nivel: LinhaDimensao['nivel']): LinhaDimensao => ({ dimensao, nivel, media: null, lacuna: '' })

function avaliacao(parcial: Partial<AvaliacaoMaturidade> & Pick<AvaliacaoMaturidade, 'id'>): AvaliacaoMaturidade {
  return {
    clienteId: 'cli-x',
    ordem: 1,
    data: '2026-01-10',
    avaliadorId: 'usr-helena',
    contratoId: null,
    status: 'Concluída',
    maturidadeGeral: 'Básica',
    prontidao: 'Pronto',
    dimensoes: [linha('Capacidade técnica', 'Básica')],
    pontosFortes: '',
    lacunasPrioritarias: '',
    recomendacao: '',
    observacoesInternas: '',
    ...parcial,
  }
}

describe('maturidadeDoCliente (RN-25, CA-20.4)', () => {
  it('a inicial é a concluída de data menor, mesmo vindo depois na lista', () => {
    const antiga = avaliacao({ id: 'a', data: '2026-03-10', ordem: 2 })
    const nova = avaliacao({ id: 'b', data: '2026-09-15', ordem: 1 })
    const r = maturidadeDoCliente([nova, antiga])!
    expect(r.inicial.id).toBe('a')
    expect(r.atual.id).toBe('b')
  })

  it('na mesma data, vale a ordem de criação', () => {
    const segunda = avaliacao({ id: 'segunda', data: '2026-05-05', ordem: 7 })
    const primeira = avaliacao({ id: 'primeira', data: '2026-05-05', ordem: 3 })
    const r = maturidadeDoCliente([segunda, primeira])!
    expect(r.inicial.id).toBe('primeira')
    expect(r.atual.id).toBe('segunda')
  })

  it('uma Em elaboração mais recente não conta como atual', () => {
    const concluida = avaliacao({ id: 'c', data: '2026-03-10' })
    const rascunho = avaliacao({ id: 'r', data: '2026-11-05', ordem: 9, status: 'Em elaboração' })
    const r = maturidadeDoCliente([concluida, rascunho])!
    expect(r.atual.id).toBe('c')
  })

  it('com uma só concluída, ela é a inicial e a atual', () => {
    const unica = avaliacao({ id: 'u' })
    const r = maturidadeDoCliente([unica])!
    expect(r.inicial.id).toBe('u')
    expect(r.atual.id).toBe('u')
  })

  it('sem concluída, não há comparação', () => {
    expect(maturidadeDoCliente([])).toBeNull()
    expect(maturidadeDoCliente([avaliacao({ id: 'r', status: 'Em elaboração' })])).toBeNull()
  })

  it('a dimensão que falta numa das duas aparece como Não avaliada', () => {
    const inicial = avaliacao({ id: 'i', data: '2026-03-10', dimensoes: [linha('Capacidade técnica', 'Básica')] })
    const atual = avaliacao({
      id: 'a',
      data: '2026-09-15',
      dimensoes: [linha('Capacidade técnica', 'Consistente'), linha('Integridade e informação', 'Básica')],
    })
    expect(maturidadeDoCliente([inicial, atual])!.dimensoes).toEqual([
      { dimensao: 'Capacidade técnica', inicial: 'Básica', atual: 'Consistente' },
      { dimensao: 'Integridade e informação', inicial: 'Não avaliada', atual: 'Básica' },
    ])
  })

  it('a dimensão que só a inicial tem vai para o fim', () => {
    const inicial = avaliacao({
      id: 'i',
      data: '2026-03-10',
      dimensoes: [linha('Dimensão antiga', 'Inicial'), linha('Capacidade técnica', 'Básica')],
    })
    const atual = avaliacao({ id: 'a', data: '2026-09-15', dimensoes: [linha('Capacidade técnica', 'Avançada')] })
    expect(maturidadeDoCliente([inicial, atual])!.dimensoes.map((d) => [d.dimensao, d.inicial, d.atual])).toEqual([
      ['Capacidade técnica', 'Básica', 'Avançada'],
      ['Dimensão antiga', 'Inicial', 'Não avaliada'],
    ])
  })
})

describe('oQueFaltaParaConcluir (CA-20.2)', () => {
  it('lista as dimensões sem nível, a maturidade geral e a prontidão; Não avaliada não falta', () => {
    const rascunho = avaliacao({
      id: 'r',
      status: 'Em elaboração',
      maturidadeGeral: null,
      prontidao: null,
      dimensoes: [
        linha('Regularidade e documentação', 'Consistente'),
        linha('Capacidade técnica', 'Consistente'),
        linha('Capacidade operacional', 'Em estruturação'),
        linha('Gestão e qualidade', null),
        linha('Saúde, segurança e ambiente', null),
        linha('Sustentação financeira', 'Em estruturação'),
        linha('Gestão comercial e contratual', null),
        linha('Integridade e informação', 'Não avaliada'),
      ],
    })
    expect(oQueFaltaParaConcluir(rascunho)).toEqual([
      'Gestão e qualidade',
      'Saúde, segurança e ambiente',
      'Gestão comercial e contratual',
      'Maturidade geral',
      'Prontidão',
    ])
  })

  it('uma avaliação completa não tem nada faltando', () => {
    expect(oQueFaltaParaConcluir(avaliacao({ id: 'ok', status: 'Em elaboração' }))).toEqual([])
  })
})

describe('lerMedia (CA-20.8)', () => {
  it('vazio é aceito, porque a média é opcional', () => {
    expect(lerMedia('')).toBeNull()
    expect(lerMedia('  ')).toBeNull()
  })

  it('aceita de 1,00 a 5,00, com vírgula ou ponto e espaços nas pontas', () => {
    expect(lerMedia('3,5')).toBe(3.5)
    expect(lerMedia(' 4,2 ')).toBe(4.2)
    expect(lerMedia('4.25')).toBe(4.25)
    expect(lerMedia('1')).toBe(1)
    expect(lerMedia('5,00')).toBe(5)
  })

  it('recusa fora da faixa, mais de duas casas e o que não é número', () => {
    for (const texto of ['5,01', '0,99', 'abc', '3,505', '1e0', 'Infinity', '-2', '3,']) {
      expect(lerMedia(texto), texto).toBe('invalida')
    }
  })
})

describe('formatarMedia', () => {
  it('mostra duas casas com vírgula, e o traço sem valor', () => {
    expect(formatarMedia(3.5)).toBe('3,50')
    expect(formatarMedia(4)).toBe('4,00')
    expect(formatarMedia(null)).toBe('—')
  })
})
