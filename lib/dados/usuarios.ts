import { USUARIOS, VINCULOS } from './mock/usuarios'
import { ehAdmin, podeVerCliente, temVinculo } from './regras'
import { obterUsuarioAtual } from './sessao'
import type { ExemplosDoPrototipo, Usuario } from './tipos'

/** Compara sem espaços nas pontas e sem diferença de maiúsculas. Devolve também os inativos. */
export async function encontrarUsuarioPorEmail(email: string): Promise<Usuario | null> {
  const procurado = email.trim().toLowerCase()
  return USUARIOS.find((u) => u.email.toLowerCase() === procurado) ?? null
}

const porId = (id: string) => USUARIOS.find((u) => u.id === id)!

/** Os perfis de exemplo do bloco "Protótipo" do login. Sai inteiro na Etapa 3. */
export async function obterExemplosDoPrototipo(): Promise<ExemplosDoPrototipo> {
  const equipe = porId('usr-rafael')
  return {
    administrador: porId('usr-helena'),
    equipe,
    clientesDaEquipe: VINCULOS.filter((v) => v.usuarioId === equipe.id).length,
    emailInativo: porId('usr-marcos').email,
  }
}

const porNome = (a: Usuario, b: Usuario) => a.nome.localeCompare(b.nome, 'pt-BR')

/**
 * Quem pode ser responsável num registro do cliente (RN-19, CA-01.6): contrato, escopo, etapa da Jornada e
 * avaliador da avaliação. Os Administradores ativos e a Equipe ativa vinculada ao cliente, Administradores
 * primeiro, cada grupo por nome. Vazia se o usuário não pode ver o cliente.
 */
export async function listarResponsaveis(clienteId: string): Promise<Usuario[]> {
  const usuario = await obterUsuarioAtual()
  if (!podeVerCliente(usuario, clienteId, VINCULOS)) return []
  const ativos = USUARIOS.filter((u) => u.status === 'Ativo')
  const administradores = ativos.filter(ehAdmin).sort(porNome)
  const equipe = ativos.filter((u) => !ehAdmin(u) && temVinculo(u, clienteId, VINCULOS)).sort(porNome)
  return [...administradores, ...equipe].map((u) => ({ ...u }))
}
