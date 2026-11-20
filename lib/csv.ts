// CSV das exportações (DF-75, CA-16.3): UTF-8 com BOM e ponto e vírgula, para abrir direto no Excel em português.

/**
 * Um campo do CSV. O que começa com `=`, `+`, `-`, `@`, tabulação ou retorno de carro ganha um apóstrofo na frente,
 * para o Excel não executar o texto como fórmula (OWASP, CSV injection). O que tem `;`, aspas ou quebra de linha vai entre aspas.
 */
export function campoCsv(valor: string | undefined): string {
  let texto = valor ?? ''
  if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`
  return /[;"\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
}

/** O arquivo inteiro: BOM, cabeçalho e linhas, com os campos já protegidos. */
export function montarCsv(cabecalho: string[], linhas: (string | undefined)[][]): string {
  return `﻿${[cabecalho, ...linhas].map((linha) => linha.map(campoCsv).join(';')).join('\r\n')}`
}
