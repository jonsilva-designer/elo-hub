/** Tira acento e caixa, para a busca achar "sao lucas" em "Clínica São Lucas". */
export function normalizarBusca(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR')
}
