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
