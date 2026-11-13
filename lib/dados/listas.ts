import { SEGMENTOS } from './mock/listas'

/** A lista oficial de segmentos (DF-70). Uma cópia: quem a altera não muda a lista. */
export async function listarSegmentos(): Promise<string[]> {
  return [...SEGMENTOS]
}
