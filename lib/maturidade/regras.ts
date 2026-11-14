import type {
  AvaliacaoMaturidade,
  MaturidadeGeral,
  NivelDimensao,
  NivelMaturidade,
  Prontidao,
} from '@/lib/dados/tipos'
import { VAZIO } from '@/lib/formato'

// Regras da avaliação de maturidade, sem sessão (F20, RN-25). A plataforma só organiza o que o
// avaliador informa: não calcula nível, média nem prontidão.

/** Os níveis de uma dimensão, na ordem das seleções. */
export const NIVEIS_DIMENSAO: NivelDimensao[] = ['Inicial', 'Básica', 'Em estruturação', 'Consistente', 'Avançada', 'Não avaliada']

export const NIVEIS_GERAIS: MaturidadeGeral[] = ['Inicial', 'Básica', 'Em estruturação', 'Consistente', 'Avançada', 'Inconclusiva']

export const PRONTIDOES: Prontidao[] = ['Pronto', 'Pronto com condições', 'Não pronto no momento', 'Inconclusivo']

/** Até onde a régua do nível fica preenchida (padrão 4.6). */
export const PASSO_DO_NIVEL: Record<NivelMaturidade, 1 | 2 | 3 | 4 | 5> = {
  Inicial: 1,
  Básica: 2,
  'Em estruturação': 3,
  Consistente: 4,
  Avançada: 5,
}

export type ComparacaoMaturidade = {
  inicial: AvaliacaoMaturidade
  atual: AvaliacaoMaturidade
  dimensoes: { dimensao: string; inicial: NivelDimensao; atual: NivelDimensao }[]
}

const pelaDataEOrdem = (a: AvaliacaoMaturidade, b: AvaliacaoMaturidade) =>
  a.data.localeCompare(b.data) || a.ordem - b.ordem

const nivelEm = (avaliacao: AvaliacaoMaturidade, dimensao: string): NivelDimensao =>
  avaliacao.dimensoes.find((d) => d.dimensao === dimensao)?.nivel ?? 'Não avaliada'

/**
 * A maturidade inicial e a atual do cliente (RN-25): a primeira e a última avaliação Concluída pela data,
 * com a ordem de criação desempatando. Em elaboração não conta. Com uma só, ela é as duas.
 * As dimensões seguem a ordem da atual; as que só a inicial tem vão para o fim. A que falta vira Não avaliada.
 */
export function maturidadeDoCliente(avaliacoes: readonly AvaliacaoMaturidade[]): ComparacaoMaturidade | null {
  const concluidas = avaliacoes.filter((a) => a.status === 'Concluída').sort(pelaDataEOrdem)
  if (concluidas.length === 0) return null
  const inicial = concluidas[0]
  const atual = concluidas[concluidas.length - 1]
  const daAtual = atual.dimensoes.map((d) => d.dimensao)
  const soDaInicial = inicial.dimensoes.map((d) => d.dimensao).filter((d) => !daAtual.includes(d))
  return {
    inicial,
    atual,
    dimensoes: [...daAtual, ...soDaInicial].map((dimensao) => ({
      dimensao,
      inicial: nivelEm(inicial, dimensao),
      atual: nivelEm(atual, dimensao),
    })),
  }
}

/** O que falta para concluir (CA-20.2): as dimensões sem nível, a maturidade geral e a prontidão. */
export function oQueFaltaParaConcluir(avaliacao: AvaliacaoMaturidade): string[] {
  const falta = avaliacao.dimensoes.filter((d) => d.nivel === null).map((d) => d.dimensao)
  if (avaliacao.maturidadeGeral === null) falta.push('Maturidade geral')
  if (avaliacao.prontidao === null) falta.push('Prontidão')
  return falta
}

/**
 * A média digitada (CA-20.8): de 1,00 a 5,00, com vírgula ou ponto e até duas casas. Vazio é `null`,
 * porque a média é opcional. Qualquer outra coisa, inclusive `1e0` e `Infinity`, é `'invalida'`.
 */
export function lerMedia(texto: string): number | null | 'invalida' {
  const limpo = texto.trim()
  if (limpo === '') return null
  if (!/^\d(?:[.,]\d{1,2})?$/.test(limpo)) return 'invalida'
  const valor = Number(limpo.replace(',', '.'))
  return valor >= 1 && valor <= 5 ? valor : 'invalida'
}

/** `3,50`, ou o traço quando não há média. */
export function formatarMedia(media: number | null): string {
  return media === null ? VAZIO : media.toFixed(2).replace('.', ',')
}
