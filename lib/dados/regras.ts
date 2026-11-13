import type { Usuario, Vinculo } from './tipos'

// Regra de acesso por vínculo (RN-01), em funções puras. Espelham `eh_admin()` e `tem_vinculo()`
// da arquitetura (4.5): na Etapa 3, o banco aplica a mesma regra e as telas não mudam.

export function ehAdmin(usuario: Usuario): boolean {
  return usuario.perfil === 'Administrador'
}

/** Só a lista de vínculos: o Administrador não tem vínculo, e é `podeVerCliente` que o libera. */
export function temVinculo(usuario: Usuario, clienteId: string, vinculos: readonly Vinculo[]): boolean {
  return vinculos.some((v) => v.usuarioId === usuario.id && v.clienteId === clienteId)
}

export function podeVerCliente(usuario: Usuario, clienteId: string, vinculos: readonly Vinculo[]): boolean {
  return ehAdmin(usuario) || temVinculo(usuario, clienteId, vinculos)
}
