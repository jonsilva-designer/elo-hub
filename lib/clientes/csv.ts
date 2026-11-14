import type { Cliente } from '@/lib/dados/tipos'

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

/**
 * Um campo do CSV. O que começa com `=`, `+`, `-` ou `@` ganha um apóstrofo na frente, para o Excel
 * não executar o texto como fórmula. O que tem `;`, aspas ou quebra de linha vai entre aspas.
 */
function campo(valor: string | undefined): string {
  let texto = valor ?? ''
  if (/^[=+\-@]/.test(texto)) texto = `'${texto}`
  return /[;"\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
}

export function gerarCsvClientes(clientes: readonly Cliente[]): string {
  const linhas = [
    COLUNAS.map(([titulo]) => titulo).join(';'),
    ...clientes.map((c) => COLUNAS.map(([, valor]) => campo(valor(c))).join(';')),
  ]
  return `﻿${linhas.join('\r\n')}`
}

const dataDeBrasilia = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** `clientes-AAAA-MM-DD.csv`, com a data de Brasília. */
export function nomeDoArquivoClientes(agora: Date): string {
  const p = Object.fromEntries(dataDeBrasilia.formatToParts(agora).map((parte) => [parte.type, parte.value]))
  return `clientes-${p.year}-${p.month}-${p.day}.csv`
}
