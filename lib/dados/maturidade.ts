import { AVALIACOES } from './mock/avaliacoes'
import { DIMENSOES } from './mock/listas'
import { USUARIOS, VINCULOS } from './mock/usuarios'
import { podeVerCliente } from './regras'
import { obterUsuarioAtual } from './sessao'
import type { AvaliacaoDetalhada, AvaliacaoMaturidade, Usuario } from './tipos'
import { listarResponsaveis } from './usuarios'

// Leitura das avaliações de maturidade (F20). Como em clientes.ts, o usuário vem da sessão
// e a regra de vínculo (RN-01) vale para a avaliação pelo cliente dela.

const nomeDoUsuario = (id: string) => USUARIOS.find((u) => u.id === id)?.nome ?? ''

/** Uma cópia com o nome do avaliador: quem a altera não muda os dados de exemplo. */
const detalhar = (a: AvaliacaoMaturidade): AvaliacaoDetalhada => ({
  ...a,
  dimensoes: a.dimensoes.map((d) => ({ ...d })),
  nomeAvaliador: nomeDoUsuario(a.avaliadorId),
})

const daMaisRecente = (a: AvaliacaoMaturidade, b: AvaliacaoMaturidade) =>
  b.data.localeCompare(a.data) || b.ordem - a.ordem

/** As dimensões ativas da lista oficial (DF-70), na ordem da lista. */
export async function listarDimensoes(): Promise<string[]> {
  return [...DIMENSOES]
}

/** As avaliações do cliente, da mais recente para a mais antiga. Vazia se o usuário não pode ver o cliente. */
export async function listarAvaliacoesDoCliente(clienteId: string): Promise<AvaliacaoDetalhada[]> {
  const usuario = await obterUsuarioAtual()
  if (!podeVerCliente(usuario, clienteId, VINCULOS)) return []
  return AVALIACOES.filter((a) => a.clienteId === clienteId)
    .sort(daMaisRecente)
    .map(detalhar)
}

/** A avaliação, ou null se ela não existe ou é de um cliente fora do vínculo. A página chama notFound(). */
export async function obterAvaliacao(id: string): Promise<AvaliacaoDetalhada | null> {
  const usuario = await obterUsuarioAtual()
  const avaliacao = AVALIACOES.find((a) => a.id === id)
  return avaliacao && podeVerCliente(usuario, avaliacao.clienteId, VINCULOS) ? detalhar(avaliacao) : null
}

/** Quem pode ser avaliador do cliente (RN-19): os mesmos responsáveis dos outros registros do cliente. */
export async function listarAvaliadores(clienteId: string): Promise<Usuario[]> {
  return listarResponsaveis(clienteId)
}
