'use server'

import { itensQueImpedemInativar, obterCliente, obterClientePorCnpj, temItensLigados } from '@/lib/dados/clientes'
import { listarSegmentos } from '@/lib/dados/listas'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import type { Cliente } from '@/lib/dados/tipos'
import { mensagemDeSucesso, SEM_PERMISSAO, type ResultadoAcao } from '@/lib/resultado-acao'
import { UFS } from '@/lib/ufs'
import type { EstadoSalvarCliente } from './estados'
import { lerDadosCliente, validarCliente } from './validacao'

// Ações do cliente (parte 2, 5.3). Conferem o perfil e o vínculo no servidor, mesmo quando a tela esconde
// o botão. No protótipo, salvar só simula: nada é gravado, e a resposta diz isso (decisão do Jonathan).

const texto = (valor: FormDataEntryValue | null) => (typeof valor === 'string' ? valor.trim() : '')

/** Cadastro e edição do cliente, só do Administrador. Com `id`, é edição. */
export async function salvarCliente(_estado: EstadoSalvarCliente, formData: FormData): Promise<EstadoSalvarCliente> {
  const usuario = await obterUsuarioAtual()
  const dados = lerDadosCliente(formData)
  if (!ehAdmin(usuario)) return { erros: {}, valores: dados, erroGeral: SEM_PERMISSAO }

  const id = texto(formData.get('id'))
  const atual = id ? await obterCliente(id) : null
  // Não diz se o cliente existe.
  if (id && !atual) return { erros: {}, valores: dados, erroGeral: SEM_PERMISSAO }

  // Segmento fora da lista oficial e UF que não existe contam como vazios.
  if (!(await listarSegmentos()).includes(dados.segmento)) dados.segmento = ''
  if (!UFS.includes(dados.uf)) dados.uf = ''

  const comMesmoCnpj = dados.cnpj ? await obterClientePorCnpj(dados.cnpj) : null
  const erros = validarCliente(dados, { atual, comMesmoCnpj })
  if (Object.keys(erros).length > 0) return { erros, valores: dados }

  return {
    erros: {},
    valores: dados,
    sucesso: { mensagem: mensagemDeSucesso('Cliente salvo.'), destino: atual ? `/clientes/${atual.id}` : '/clientes' },
  }
}

const CADASTRO_DA_ELO = 'O cadastro da ELO não pode ser inativado nem excluído.'
const recusa = (mensagem: string): ResultadoAcao => ({ ok: false, mensagem })

/**
 * O cliente ao alcance do Administrador, ou a recusa. Os argumentos vêm do navegador e podem ser forjados:
 * quem não é Administrador, ou um id que não existe, recebe a mesma recusa, sem saber se o cliente existe.
 */
async function clienteDoAdministrador(id: unknown): Promise<Cliente | ResultadoAcao> {
  const usuario = await obterUsuarioAtual()
  if (!ehAdmin(usuario) || typeof id !== 'string') return recusa(SEM_PERMISSAO)
  return (await obterCliente(id)) ?? recusa(SEM_PERMISSAO)
}

const ehRecusa = (x: Cliente | ResultadoAcao): x is ResultadoAcao => 'ok' in x

/** Inativar o cliente (RN-18, CA-18.3): recusado enquanto houver itens abertos ligados a ele. */
export async function inativarCliente(id: string): Promise<ResultadoAcao> {
  const cliente = await clienteDoAdministrador(id)
  if (ehRecusa(cliente)) return cliente
  if (cliente.ehCadastroElo) return recusa(CADASTRO_DA_ELO)
  if (cliente.status === 'Inativo') return recusa('Este cliente já está inativo.')
  const impedimentos = await itensQueImpedemInativar(cliente.id)
  if (impedimentos.length > 0) {
    return {
      ok: false,
      mensagem: 'Não é possível inativar este cliente enquanto houver itens abertos ligados a ele.',
      impedimentos,
    }
  }
  return { ok: true, mensagem: mensagemDeSucesso('Cliente inativado.') }
}

/** Reativar o cliente Inativo, para Prospect ou Ativo (6.1). */
export async function reativarCliente(id: string, status: string): Promise<ResultadoAcao> {
  const cliente = await clienteDoAdministrador(id)
  if (ehRecusa(cliente)) return cliente
  if (cliente.status !== 'Inativo') return recusa('Só um cliente inativo pode ser reativado.')
  if (status !== 'Prospect' && status !== 'Ativo') return recusa('Escolha Prospect ou Ativo.')
  return { ok: true, mensagem: mensagemDeSucesso('Cliente reativado.') }
}

/** Excluir o cliente (DF-33, CA-18.4): só sem nada ligado a ele, e com justificativa. */
export async function excluirCliente(id: string, justificativa: string): Promise<ResultadoAcao> {
  const cliente = await clienteDoAdministrador(id)
  if (ehRecusa(cliente)) return cliente
  if (cliente.ehCadastroElo) return recusa(CADASTRO_DA_ELO)
  if (await temItensLigados(cliente.id)) return recusa('Este cliente tem registros ligados e não pode ser excluído.')
  if (typeof justificativa !== 'string' || !justificativa.trim()) return recusa('Escreva a justificativa da exclusão.')
  return { ok: true, mensagem: mensagemDeSucesso('Cliente excluído.') }
}

