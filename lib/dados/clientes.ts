import { CLIENTES } from './mock/clientes'
import { VINCULOS } from './mock/usuarios'
import { podeVerCliente } from './regras'
import { obterUsuarioAtual } from './sessao'
import type { Cliente } from './tipos'

// As telas nunca passam o usuário: ele vem da sessão, e a regra de vínculo (RN-01) decide o que aparece.

/** Os clientes que o usuário atual pode ver, na ordem do cadastro. */
export async function listarClientes(): Promise<Cliente[]> {
  const usuario = await obterUsuarioAtual()
  return CLIENTES.filter((c) => podeVerCliente(usuario, c.id, VINCULOS))
}

/**
 * O cliente, ou null se ele não existe ou está fora dos vínculos. A página chama notFound() nos dois
 * casos, sem revelar que o cliente existe.
 */
export async function obterCliente(id: string): Promise<Cliente | null> {
  const usuario = await obterUsuarioAtual()
  const cliente = CLIENTES.find((c) => c.id === id)
  return cliente && podeVerCliente(usuario, cliente.id, VINCULOS) ? cliente : null
}
