import { montarCsv } from '@/lib/csv'
import type { ContratoDetalhado } from '@/lib/dados/tipos'
import { escreverValorEmReais, formatarData, hojeEmBrasilia } from '@/lib/formato'

// Exportação da lista de contratos (DF-75, CA-16.3): uma coluna por campo de F03 e F04, com as datas em dd/mm/aaaa.

/** Data do contrato em dd/mm/aaaa; sem data, vazio (o traço da tela não vai para a planilha). */
const data = (valor: string | null) => (valor ? formatarData(valor) : '')

const COLUNAS: [titulo: string, valor: (c: ContratoDetalhado) => string][] = [
  ['Código', (c) => c.codigo],
  ['Cliente', (c) => c.nomeCliente],
  ['Contratante', (c) => c.contratante],
  ['Objeto', (c) => c.objeto],
  ['Serviços', (c) => c.servicos.join(', ')],
  ['Data da Proposta', (c) => data(c.dataProposta)],
  ['Tipo de Vigência', (c) => c.tipoVigencia],
  ['Início da Vigência', (c) => data(c.inicio)],
  ['Término da Vigência', (c) => data(c.termino)],
  ['Dias Restantes', (c) => (c.vigencia?.diasRestantes == null ? '' : String(c.vigencia.diasRestantes))],
  ['Status da Vigência', (c) => c.vigencia?.status ?? ''],
  ['Valor', (c) => escreverValorEmReais(c.valor)],
  ['Responsável ELO', (c) => c.nomeResponsavel],
  ['Status', (c) => c.status],
  ['Observações', (c) => c.observacoes],
]

export function gerarCsvContratos(contratos: readonly ContratoDetalhado[]): string {
  return montarCsv(
    COLUNAS.map(([titulo]) => titulo),
    contratos.map((c) => COLUNAS.map(([, valor]) => valor(c))),
  )
}

/** `contratos-AAAA-MM-DD.csv`, com a data de Brasília. */
export function nomeDoArquivoContratos(agora: Date): string {
  return `contratos-${hojeEmBrasilia(agora)}.csv`
}
