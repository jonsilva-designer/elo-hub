import { formatarData } from '@/lib/formato'
import { AVALIACOES } from './mock/avaliacoes'
import { CLIENTES } from './mock/clientes'
import { USUARIOS, VINCULOS } from './mock/usuarios'
import { podeVerCliente } from './regras'
import { obterUsuarioAtual } from './sessao'
import type { Cliente, ItemQueImpede } from './tipos'

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

const digitos = (cnpj: string) => cnpj.replace(/\D/g, '')

/**
 * O cliente com o mesmo CNPJ, comparando só os dígitos (CA-02.1). Usada na validação do cadastro,
 * que é só do Administrador. A regra de vínculo vale aqui também.
 */
export async function obterClientePorCnpj(cnpj: string): Promise<Cliente | null> {
  const procurado = digitos(cnpj)
  if (!procurado) return null
  const usuario = await obterUsuarioAtual()
  const cliente = CLIENTES.find((c) => digitos(c.cnpj) === procurado)
  return cliente && podeVerCliente(usuario, cliente.id, VINCULOS) ? cliente : null
}

/**
 * Os itens abertos ligados ao cliente, que impedem inativá-lo (RN-18, CA-18.3). Nesta parte, as avaliações
 * Em elaboração. As partes 3 e 5 acrescentam contratos e demandas.
 */
export async function itensQueImpedemInativar(clienteId: string): Promise<ItemQueImpede[]> {
  const usuario = await obterUsuarioAtual()
  if (!podeVerCliente(usuario, clienteId, VINCULOS)) return []
  return AVALIACOES.filter((a) => a.clienteId === clienteId && a.status === 'Em elaboração').map((a) => ({
    tipo: 'Avaliação de maturidade',
    descricao: `Avaliação de ${formatarData(a.data)}`,
    status: a.status,
    responsavel: USUARIOS.find((u) => u.id === a.avaliadorId)?.nome ?? '',
    href: `/avaliacoes/${a.id}`,
  }))
}

/** Se o cliente tem algum registro ligado, o que impede excluí-lo (DF-33). Nesta parte, avaliações. */
export async function temItensLigados(clienteId: string): Promise<boolean> {
  const usuario = await obterUsuarioAtual()
  if (!podeVerCliente(usuario, clienteId, VINCULOS)) return false
  return AVALIACOES.some((a) => a.clienteId === clienteId)
}
