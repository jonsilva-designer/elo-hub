'use server'

import { listarClientes } from '@/lib/dados/clientes'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { itensAbertosDoUsuario, listarUsuarios, obterUsuario, responsaveisParaRedistribuir } from '@/lib/dados/usuarios-configuracao'
import { mensagemDeSucesso, SEM_PERMISSAO, type ResultadoAcao } from '@/lib/resultado-acao'
import type { EstadoUsuario } from './estados'
import { ehUltimoAdministradorAtivo } from './regras'
import { lerDadosUsuario, MENSAGENS_USUARIO, validarUsuario } from './validacao'

// Ações dos usuários (parte 8, 4.1; F01). Só o Administrador cria, edita, inativa e vincula (CA-01.4). Conferem tudo no
// servidor. No protótipo, nada é gravado e nenhum convite sai.

/**
 * Cadastra ou edita o usuário. Com `id`, é edição. O e-mail é único, sem diferenciar maiúsculas; a Equipe acompanha
 * ao menos um cliente (DF-23). O último Administrador ativo não passa para Equipe (DF-37), e o vínculo com um cliente
 * não sai enquanto a pessoa responde por itens abertos dele: a ação lista os itens (DF-36, CA-01.7).
 */
export async function salvarUsuario(_estado: EstadoUsuario, formData: FormData): Promise<EstadoUsuario> {
  const usuario = await obterUsuarioAtual()
  const dados = lerDadosUsuario(formData)
  const recusa = (erroGeral: string, extra: Partial<EstadoUsuario> = {}): EstadoUsuario => ({ erros: {}, valores: dados, erroGeral, ...extra })
  if (!ehAdmin(usuario)) return recusa(SEM_PERMISSAO)

  const atual = dados.id ? await obterUsuario(dados.id) : null
  if (dados.id && !atual) return recusa(SEM_PERMISSAO)

  const [usuarios, clientes] = await Promise.all([listarUsuarios(), listarClientes()])
  const erros = validarUsuario(dados, {
    emailsDosOutros: usuarios.filter((u) => u.id !== atual?.id).map((u) => u.email),
    clientes: clientes.map((c) => c.id),
    ultimoAdministrador: atual !== null && ehUltimoAdministradorAtivo(atual.id, usuarios),
  })
  if (Object.keys(erros).length > 0) return { erros, valores: dados }

  // Os vínculos que saem, na Equipe que continua Equipe: nenhum pode ter item aberto da pessoa (DF-36).
  if (atual && atual.perfil === 'Equipe' && dados.perfil === 'Equipe') {
    for (const saindo of atual.clientes.filter((c) => !dados.clienteIds.includes(c.id))) {
      const itens = await itensAbertosDoUsuario(atual.id, saindo.id)
      if (itens.length > 0) return recusa(MENSAGENS_USUARIO.vinculoComItens(saindo.nome), { impedimentos: itens })
    }
  }

  return {
    erros: {},
    valores: dados,
    sucesso: atual
      ? { mensagem: mensagemDeSucesso('Usuário salvo.'), destino: `/configuracoes/usuarios/${atual.id}` }
      : { mensagem: mensagemDeSucesso(`Usuário cadastrado. O convite sai para ${dados.email}.`), destino: '/configuracoes/usuarios' },
  }
}

const recusa = (mensagem: string): ResultadoAcao => ({ ok: false, mensagem })

/** O usuário ao alcance do Administrador, ou null: a Equipe e o id que não existe recebem a mesma recusa (CA-01.4). */
async function usuarioDoAdministrador(id: unknown) {
  return ehAdmin(await obterUsuarioAtual()) && typeof id === 'string' ? await obterUsuario(id) : null
}

/**
 * Inativa o usuário (6.1): não o último Administrador ativo (DF-37) nem quem responde por itens abertos, que a recusa
 * lista para a redistribuição (DF-36, CA-01.7). O inativo não entra e continua no histórico (F01).
 */
export async function inativarUsuario(id: string): Promise<ResultadoAcao> {
  const usuario = await usuarioDoAdministrador(id)
  if (!usuario) return recusa(SEM_PERMISSAO)
  if (usuario.status === 'Inativo') return recusa('O usuário já está inativo.')
  if (ehUltimoAdministradorAtivo(usuario.id, await listarUsuarios())) return recusa(MENSAGENS_USUARIO.ultimoInativado)
  const itens = await itensAbertosDoUsuario(usuario.id)
  if (itens.length > 0) return { ok: false, mensagem: MENSAGENS_USUARIO.comItens, impedimentos: itens }
  return { ok: true, mensagem: mensagemDeSucesso('Usuário inativado.') }
}

/** Reativa o usuário inativo (6.1). */
export async function reativarUsuario(id: string): Promise<ResultadoAcao> {
  const usuario = await usuarioDoAdministrador(id)
  if (!usuario) return recusa(SEM_PERMISSAO)
  if (usuario.status === 'Ativo') return recusa('O usuário já está ativo.')
  return { ok: true, mensagem: mensagemDeSucesso('Usuário reativado.') }
}

/**
 * Passa os itens abertos escolhidos para outro responsável (DF-36, CA-01.9): um Administrador ativo ou alguém da Equipe
 * ativo com vínculo com o cliente de cada item (RN-19). A troca ficaria no histórico de cada item (DF-16).
 */
export async function redistribuirItens(usuarioId: string, chaves: string[], novoResponsavelId: string): Promise<ResultadoAcao> {
  const usuario = await usuarioDoAdministrador(usuarioId)
  if (!usuario || !Array.isArray(chaves)) return recusa(SEM_PERMISSAO)
  const itens = (await itensAbertosDoUsuario(usuario.id)).filter((i) => chaves.includes(i.chave))
  if (itens.length === 0) return recusa(MENSAGENS_USUARIO.itens)
  if (typeof novoResponsavelId !== 'string' || !novoResponsavelId) return recusa(MENSAGENS_USUARIO.novoResponsavel)
  const possiveis = await responsaveisParaRedistribuir(usuario.id, [...new Set(itens.map((i) => i.clienteId))])
  if (!possiveis.some((u) => u.id === novoResponsavelId)) return recusa(MENSAGENS_USUARIO.semVinculo)
  return { ok: true, mensagem: mensagemDeSucesso('Itens redistribuídos.') }
}
