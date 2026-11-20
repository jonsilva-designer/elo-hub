'use server'

import { listarItensDaLista, type ItemDaLista } from '@/lib/dados/listas-configuracao'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { mensagemDeSucesso, SEM_PERMISSAO, type ResultadoAcao } from '@/lib/resultado-acao'
import { ehLista, MENSAGENS_LISTA, mesmoNome, nomeComConteudo, nomeLimpo } from './regras'

// Ações das listas oficiais (parte 8, 4.2; DF-01, DF-38, CA-18.5, CA-18.6). Só o Administrador. Conferem tudo no
// servidor. No protótipo, nada é gravado.

const recusa = (mensagem: string): ResultadoAcao => ({ ok: false, mensagem })
const sucesso = (frase: string): ResultadoAcao => ({ ok: true, mensagem: mensagemDeSucesso(frase) })

/** Os itens da lista ao alcance do Administrador, ou null: a Equipe e a lista desconhecida recebem a mesma recusa. */
async function itensDoAdministrador(lista: unknown): Promise<ItemDaLista[] | null> {
  if (!ehAdmin(await obterUsuarioAtual()) || typeof lista !== 'string' || !ehLista(lista)) return null
  return listarItensDaLista(lista)
}

const texto = (valor: unknown) => (typeof valor === 'string' ? valor.trim() : '')

/** Inclui o item, sem repetir nome na lista, ativo ou inativo (CA-18.6). */
export async function incluirItem(lista: string, nome: string): Promise<ResultadoAcao> {
  const itens = await itensDoAdministrador(lista)
  if (!itens) return recusa(SEM_PERMISSAO)
  if (!nomeComConteudo(texto(nome))) return recusa(MENSAGENS_LISTA.nome)
  if (itens.some((i) => mesmoNome(i.nome, texto(nome)))) return recusa(MENSAGENS_LISTA.repetido)
  return sucesso('Item incluído.')
}

/** Renomeia o item: o novo nome vale para todos os registros que o usam (UC-03). O próprio item pode mudar a caixa. */
export async function renomearItem(lista: string, nomeAtual: string, novoNome: string): Promise<ResultadoAcao> {
  const itens = await itensDoAdministrador(lista)
  const item = itens?.find((i) => i.nome === nomeAtual)
  if (!itens || !item) return recusa(SEM_PERMISSAO)
  if (item.fixo) return recusa(MENSAGENS_LISTA.fixo)
  if (!nomeComConteudo(texto(novoNome))) return recusa(MENSAGENS_LISTA.nome)
  if (nomeLimpo(texto(novoNome)) === nomeLimpo(item.nome)) return recusa('O nome não mudou.')
  if (itens.some((i) => i !== item && mesmoNome(i.nome, texto(novoNome)))) return recusa(MENSAGENS_LISTA.repetido)
  return sucesso(MENSAGENS_LISTA.renomeado)
}

/** Inativa o item (DF-38): sai das novas escolhas e continua nos registros que o usam. */
export async function inativarItem(lista: string, nome: string): Promise<ResultadoAcao> {
  const item = (await itensDoAdministrador(lista))?.find((i) => i.nome === nome)
  if (!item) return recusa(SEM_PERMISSAO)
  if (item.fixo) return recusa(MENSAGENS_LISTA.fixo)
  if (!item.ativo) return recusa('O item já está inativo.')
  return sucesso(MENSAGENS_LISTA.inativado)
}

/** Reativa o item inativo (DF-38, CA-18.5): volta às escolhas, sem perder vínculos. */
export async function reativarItem(lista: string, nome: string): Promise<ResultadoAcao> {
  const item = (await itensDoAdministrador(lista))?.find((i) => i.nome === nome)
  if (!item) return recusa(SEM_PERMISSAO)
  if (item.ativo) return recusa('O item já está ativo.')
  return sucesso('Item reativado.')
}

/** Exclui só o item nunca usado (DF-38); o usado é inativado. */
export async function excluirItem(lista: string, nome: string): Promise<ResultadoAcao> {
  const item = (await itensDoAdministrador(lista))?.find((i) => i.nome === nome)
  if (!item) return recusa(SEM_PERMISSAO)
  if (item.fixo) return recusa(MENSAGENS_LISTA.fixo)
  if (item.uso > 0) return recusa(MENSAGENS_LISTA.usado)
  return sucesso('Item excluído.')
}
