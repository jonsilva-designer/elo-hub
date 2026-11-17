import { CATEGORIAS, CONTRATANTES, ESPECIALIDADES, SEGMENTOS, SERVICOS } from './mock/listas'

/** A lista oficial de segmentos (DF-70). Uma cópia: quem a altera não muda a lista. */
export async function listarSegmentos(): Promise<string[]> {
  return [...SEGMENTOS]
}

/** A lista oficial de serviços (DF-70), na ordem do Apêndice C. Uma cópia. */
export async function listarServicos(): Promise<string[]> {
  return [...SERVICOS]
}

/** A lista oficial de contratantes (DF-69). Uma cópia. */
export async function listarContratantes(): Promise<string[]> {
  return [...CONTRATANTES]
}

/** As especialidades dos especialistas (DF-70), na ordem do Apêndice C. Uma cópia. */
export async function listarEspecialidades(): Promise<string[]> {
  return [...ESPECIALIDADES]
}

/** As categorias da Central ELO (DF-70), na ordem do Apêndice C. Uma cópia. */
export async function listarCategorias(): Promise<string[]> {
  return [...CATEGORIAS]
}
