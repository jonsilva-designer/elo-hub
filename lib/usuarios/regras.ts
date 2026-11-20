import type { Perfil, Usuario } from '@/lib/dados/tipos'

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

type Cliente = { id: string; nome: string }

/**
 * Os clientes de que a pessoa deixa de cuidar na edição, para conferir os itens abertos dela em cada um (DF-36, CA-01.7).
 * O Administrador vê todos os clientes: se passa para Equipe, deixa todos os que não ficaram marcados. Quem fica ou
 * passa a Administrador não deixa nenhum.
 */
export function clientesQueSaem(
  atual: { perfil: Perfil; clientes: readonly Cliente[] },
  // O perfil novo vem do formulário, como texto: só o 'Equipe' tira clientes.
  novo: { perfil: Perfil | string; clienteIds: readonly string[] },
  todos: readonly Cliente[],
): Cliente[] {
  if (novo.perfil !== 'Equipe') return []
  const antes = atual.perfil === 'Administrador' ? todos : atual.clientes
  return antes.filter((c) => !novo.clienteIds.includes(c.id))
}
