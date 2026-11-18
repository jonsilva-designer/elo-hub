import type { StatusUsuario } from '@/lib/dados/tipos'
import type { UsuarioDetalhado } from '@/lib/dados/usuarios-configuracao'
import { normalizarBusca } from '@/lib/texto'

// Busca e filtro da lista de usuários (parte 8, 4.1). O inativo só aparece com o filtro (CA-18.2).

export type FiltrosUsuarios = { busca: string; status: StatusUsuario[] }

export const STATUS_USUARIO: StatusUsuario[] = ['Ativo', 'Inativo']

/** Sem escolha de status, os ativos. A busca acha o nome e o e-mail, sem acento nem maiúsculas. */
export function filtrarUsuarios(usuarios: readonly UsuarioDetalhado[], f: FiltrosUsuarios): UsuarioDetalhado[] {
  const status: StatusUsuario[] = f.status.length > 0 ? f.status : ['Ativo']
  const termo = normalizarBusca(f.busca.trim())
  return usuarios.filter(
    (u) => status.includes(u.status) && (!termo || [u.nome, u.email].some((t) => normalizarBusca(t).includes(termo))),
  )
}
