import { montarCsv } from '@/lib/csv'
import type { AtividadeDetalhada } from '@/lib/dados/tipos'
import { formatarData, hojeEmBrasilia } from '@/lib/formato'

// Exportação de Minhas atividades (DF-75, CA-16.3): uma coluna por campo de F08, com as datas em dd/mm/aaaa. O
// executor vai junto, porque é escrito para aparecer (DF-71, CA-08.8).

const COLUNAS: [titulo: string, valor: (a: AtividadeDetalhada) => string][] = [
  ['Atividade', (a) => a.nome],
  ['Plano', (a) => a.nomePlano],
  ['Escopo', (a) => a.nomeEscopo],
  ['Cliente', (a) => a.nomeCliente],
  ['Responsável', (a) => a.nomeResponsavel],
  ['Executor', (a) => a.executor],
  ['Prazo', (a) => formatarData(a.prazo)],
  ['Prioridade', (a) => a.prioridade],
  ['Status', (a) => a.status],
  ['Conclusão', (a) => (a.conclusao ? formatarData(a.conclusao) : '')],
  ['Situação do Prazo', (a) => a.situacao ?? ''],
]

export function gerarCsvAtividades(atividades: readonly AtividadeDetalhada[]): string {
  return montarCsv(
    COLUNAS.map(([titulo]) => titulo),
    atividades.map((a) => COLUNAS.map(([, valor]) => valor(a))),
  )
}

/** `atividades-AAAA-MM-DD.csv`, com a data de Brasília. */
export function nomeDoArquivoAtividades(agora: Date): string {
  return `atividades-${hojeEmBrasilia(agora)}.csv`
}
