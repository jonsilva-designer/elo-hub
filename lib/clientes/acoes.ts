'use server'

import { obterCliente, obterClientePorCnpj } from '@/lib/dados/clientes'
import { listarSegmentos } from '@/lib/dados/listas'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { mensagemDeSucesso, SEM_PERMISSAO } from '@/lib/resultado-acao'
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
