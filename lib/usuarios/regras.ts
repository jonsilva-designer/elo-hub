import type { Usuario } from '@/lib/dados/tipos'

// Regras dos usuários (F01; PRD 6.1). Só o Administrador cria, edita, inativa e vincula (CA-01.4).

/** É o único Administrador ativo: não pode ser inativado nem passar para Equipe (DF-37, CA-01.8). */
export function ehUltimoAdministradorAtivo(id: string, usuarios: readonly Pick<Usuario, 'id' | 'perfil' | 'status'>[]): boolean {
  const ativos = usuarios.filter((u) => u.perfil === 'Administrador' && u.status === 'Ativo')
  return ativos.length === 1 && ativos[0].id === id
}

/** Um e-mail com uma arroba, sem espaços, e um ponto no domínio. */
export function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}
