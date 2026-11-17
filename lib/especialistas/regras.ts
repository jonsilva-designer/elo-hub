import type { OrigemEspecialista, StatusEspecialista } from '@/lib/dados/tipos'

// Regras do especialista (F11; PRD 6.1). Nenhum status é final, e só o Administrador muda.

export const STATUS_ESPECIALISTA: StatusEspecialista[] = ['Em análise', 'Ativo', 'Inativo']

export const ORIGENS_ESPECIALISTA: OrigemEspecialista[] = ['Site', 'Cadastro interno']

/** O mesmo e-mail, sem diferenciar maiúsculas nem espaços nas pontas (DF-50). E-mail vazio não casa com nada. */
export function mesmoEmail(a: string, b: string): boolean {
  const x = a.trim().toLocaleLowerCase('pt-BR')
  return x !== '' && x === b.trim().toLocaleLowerCase('pt-BR')
}
