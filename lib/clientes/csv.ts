import { montarCsv } from '@/lib/csv'
import type { Cliente } from '@/lib/dados/tipos'
import { hojeEmBrasilia } from '@/lib/formato'

// Exportação da lista de clientes (DF-75, CA-16.3): UTF-8 com BOM e ponto e vírgula, para abrir
// direto no Excel em português, com uma coluna por campo de F02.

const COLUNAS: [titulo: string, valor: (c: Cliente) => string | undefined][] = [
  ['Razão Social', (c) => c.razaoSocial],
  ['Nome Fantasia', (c) => c.nomeFantasia],
  ['CNPJ', (c) => c.cnpj],
  ['Segmento', (c) => c.segmento],
  ['Cidade', (c) => c.cidade],
  ['Estado', (c) => c.uf],
  ['Contato Principal', (c) => c.contatoPrincipal],
  ['Cargo', (c) => c.cargo],
  ['Telefone', (c) => c.telefone],
  ['E-mail', (c) => c.email],
  ['Status', (c) => c.status],
  ['Observações', (c) => c.observacoes],
]

export function gerarCsvClientes(clientes: readonly Cliente[]): string {
  return montarCsv(
    COLUNAS.map(([titulo]) => titulo),
    clientes.map((c) => COLUNAS.map(([, valor]) => valor(c))),
  )
}

/** `clientes-AAAA-MM-DD.csv`, com a data de Brasília. */
export function nomeDoArquivoClientes(agora: Date): string {
  return `clientes-${hojeEmBrasilia(agora)}.csv`
}
