import { describe, expect, it } from 'vitest'
import { lerDadosAvaliacao, MENSAGENS_AVALIACAO, validarAvaliacao, type DadosAvaliacao } from './validacao'

const valido: DadosAvaliacao = {
  data: '2026-11-05',
  avaliadorId: 'usr-rafael',
  contratoId: '',
  niveis: ['Consistente', '', 'Não avaliada'],
  medias: ['4,1', '', '3.5'],
  lacunas: ['', '', ''],
  maturidadeGeral: '',
  prontidao: '',
  pontosFortes: '',
  lacunasPrioritarias: '',
  recomendacao: '',
  observacoesInternas: '',
}

const PERMITIDOS = ['usr-helena', 'usr-rafael']
const validar = (d: Partial<DadosAvaliacao>) => validarAvaliacao({ ...valido, ...d }, PERMITIDOS)

describe('validarAvaliacao (CA-20.1, CA-20.8, RN-19)', () => {
  it('uma avaliação em elaboração com níveis em branco não tem erro', () => {
    expect(validar({})).toEqual({})
  })

  it('exige uma data que existe, no formato AAAA-MM-DD (ponto de atenção 5)', () => {
    for (const data of ['', '2026-02-31', '31/02/2026', '2026-13-01', 'ontem']) {
      expect(validar({ data }).data, data).toBe(MENSAGENS_AVALIACAO.data)
    }
    expect(MENSAGENS_AVALIACAO.data).toBe('Informe a data da avaliação.')
  })

  it('exige o avaliador, e só entre os permitidos para o cliente', () => {
    expect(validar({ avaliadorId: '' }).avaliadorId).toBe('Escolha o avaliador.')
    expect(validar({ avaliadorId: 'usr-marcos' }).avaliadorId).toBe('O avaliador precisa ter vínculo com o cliente.')
  })

  it('a média errada dá erro só na linha dela', () => {
    expect(validar({ medias: ['3,5', '', '5,01', 'abc'], niveis: ['', '', '', ''], lacunas: ['', '', '', ''] })).toEqual({
      medias: { 2: 'A média vai de 1,00 a 5,00.', 3: 'A média vai de 1,00 a 5,00.' },
    })
  })
})

describe('lerDadosAvaliacao', () => {
  it('lê uma linha por dimensão, pelo índice, sem confiar no nome vindo do navegador', () => {
    const fd = new FormData()
    fd.set('data', '2026-11-05')
    fd.set('avaliadorId', 'usr-rafael')
    fd.set('nivel-0', 'Básica')
    fd.set('media-1', ' 4,2 ')
    fd.set('lacuna-1', 'Sem plano')
    fd.set('nivel-9', 'Avançada')
    const dados = lerDadosAvaliacao(fd, 2)
    expect(dados.niveis).toEqual(['Básica', ''])
    expect(dados.medias).toEqual(['', '4,2'])
    expect(dados.lacunas).toEqual(['', 'Sem plano'])
    expect(dados.data).toBe('2026-11-05')
  })
})
