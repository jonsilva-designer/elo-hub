import { montarCsv } from '@/lib/csv'
import type { DemandaDetalhada } from '@/lib/dados/tipos'
import { formatarData, hojeEmBrasilia } from '@/lib/formato'

// Exportação da fila de demandas (DF-75, CA-16.3): uma coluna por campo de F09, com as datas em dd/mm/aaaa. Os
// comentários e o contato com especialista não saem (CA-09.13).

const data = (valor: string | null) => (valor ? formatarData(valor) : '')

const COLUNAS: [titulo: string, valor: (d: DemandaDetalhada) => string][] = [
  ['Número', (d) => d.numero],
  ['Abertura', (d) => formatarData(d.abertaEm)],
  ['Cliente', (d) => d.nomeCliente],
  ['Contrato', (d) => d.codigoContrato ?? ''],
  ['Escopo', (d) => d.nomeEscopo ?? ''],
  ['Origem', (d) => d.origem],
  ['Assunto', (d) => d.assunto],
  ['Categoria', (d) => d.categoria ?? ''],
  ['Criticidade', (d) => d.criticidade ?? ''],
  ['Triagem', (d) => d.nomeTriagem],
  ['Atendimento', (d) => d.nomeAtendimento],
  [
    'Especialistas',
    (d) =>
      d.especialistasLigados.map((e) => (e.principal && d.especialistasLigados.length > 1 ? `${e.nome} (principal)` : e.nome)).join(', '),
  ],
  ['Prazo', (d) => data(d.prazo)],
  ['Vencida', (d) => (d.vencida ? 'Sim' : '')],
  ['Status', (d) => d.status],
  ['Encerramento', (d) => data(d.encerradaEm)],
]

export function gerarCsvDemandas(demandas: readonly DemandaDetalhada[]): string {
  return montarCsv(
    COLUNAS.map(([titulo]) => titulo),
    demandas.map((d) => COLUNAS.map(([, valor]) => valor(d))),
  )
}

/** `demandas-AAAA-MM-DD.csv`, com a data de Brasília. */
export function nomeDoArquivoDemandas(agora: Date): string {
  return `demandas-${hojeEmBrasilia(agora)}.csv`
}
