const PESOS_1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
const PESOS_2 = [6, ...PESOS_1]

// CNPJ numérico ou alfanumérico: desde julho de 2026, a Receita Federal emite CNPJ com letras nas 12 primeiras
// posições. Os dígitos verificadores continuam numéricos e saem da mesma conta, com cada caractere valendo o código
// ASCII menos 48 (o "0" vale 0, o "A" vale 17). O CNPJ só de algarismos dá o mesmo resultado de antes.

function digitoVerificador(valores: number[], pesos: number[]): number {
  const resto = pesos.reduce((soma, peso, i) => soma + valores[i] * peso, 0) % 11
  return resto < 2 ? 0 : 11 - resto
}

/** Só letras e números, em maiúsculas: a forma de comparar dois CNPJs (CA-02.1). */
export function normalizarCnpj(cnpj: string): string {
  return cnpj.replace(/[^0-9A-Za-z]/g, '').toUpperCase()
}

/** CNPJ com ou sem pontuação: 12 letras ou algarismos, 2 dígitos verificadores certos, e não todo repetido (DF-05). */
export function cnpjValido(cnpj: string): boolean {
  const limpo = cnpj.trim().replace(/[./-]/g, '').toUpperCase()
  if (!/^[0-9A-Z]{12}\d{2}$/.test(limpo) || /^(.)\1{13}$/.test(limpo)) return false
  const v = [...limpo].map((c) => c.charCodeAt(0) - 48)
  return digitoVerificador(v, PESOS_1) === v[12] && digitoVerificador(v, PESOS_2) === v[13]
}

/** O CNPJ com a máscara `00.000.000/0000-00`, com as letras em maiúsculas. O que não tem 14 caracteres volta como veio. */
export function formatarCnpj(cnpj: string): string {
  const limpo = cnpj.trim()
  const d = normalizarCnpj(limpo)
  if (d.length !== 14) return limpo
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}
