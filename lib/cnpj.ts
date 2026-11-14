const PESOS_1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
const PESOS_2 = [6, ...PESOS_1]

function digitoVerificador(digitos: number[], pesos: number[]): number {
  const resto = pesos.reduce((soma, peso, i) => soma + digitos[i] * peso, 0) % 11
  return resto < 2 ? 0 : 11 - resto
}

/** CNPJ com ou sem pontuação: 14 dígitos, não todos iguais, e os dois dígitos verificadores certos (DF-05). */
export function cnpjValido(cnpj: string): boolean {
  const limpo = cnpj.replace(/[./-]/g, '')
  if (!/^\d{14}$/.test(limpo) || /^(\d)\1{13}$/.test(limpo)) return false
  const d = [...limpo].map(Number)
  return digitoVerificador(d, PESOS_1) === d[12] && digitoVerificador(d, PESOS_2) === d[13]
}

/** O CNPJ com a máscara `00.000.000/0000-00`. O que não tem 14 dígitos volta como veio, sem espaços nas pontas. */
export function formatarCnpj(cnpj: string): string {
  const limpo = cnpj.trim()
  const d = limpo.replace(/\D/g, '')
  if (d.length !== 14) return limpo
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}
