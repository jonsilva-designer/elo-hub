'use server'

import { listarClientes } from '@/lib/dados/clientes'
import { listarContratosDoCliente, obterContrato } from '@/lib/dados/contratos'
import { listarContratantes, listarServicos } from '@/lib/dados/listas'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { listarResponsaveis } from '@/lib/dados/usuarios'
import { mensagemDeSucesso, SEM_PERMISSAO } from '@/lib/resultado-acao'
import type { EstadoSalvarContrato } from './estados'
import { TIPOS_VIGENCIA } from './regras'
import { lerDadosContrato, validarContrato } from './validacao'

// Ações do contrato (parte 3, 5.3). Só o Administrador cadastra, edita e muda o status (matriz 4.3). Conferem tudo
// no servidor, mesmo quando a tela esconde o botão. No protótipo, salvar só simula: nada é gravado.

const texto = (valor: FormDataEntryValue | null) => (typeof valor === 'string' ? valor.trim() : '')

/** Cadastro e edição do contrato. Com `id`, é edição; o cliente é o do contrato, e o do formulário é ignorado. */
export async function salvarContrato(_estado: EstadoSalvarContrato, formData: FormData): Promise<EstadoSalvarContrato> {
  const usuario = await obterUsuarioAtual()
  const dados = lerDadosContrato(formData)
  if (!ehAdmin(usuario)) return { erros: {}, valores: dados, erroGeral: SEM_PERMISSAO }

  const id = texto(formData.get('id'))
  const atual = id ? await obterContrato(id) : null
  // Não diz se o contrato existe.
  if (id && !atual) return { erros: {}, valores: dados, erroGeral: SEM_PERMISSAO }

  // O cliente do cadastro precisa poder ter contrato: nem Inativo (RN-18), nem o cadastro da ELO (DF-40).
  if (atual) dados.clienteId = atual.clienteId
  else {
    const clientes = await listarClientes()
    const cliente = clientes.find((c) => c.id === dados.clienteId)
    if (!cliente || cliente.status === 'Inativo' || cliente.ehCadastroElo) dados.clienteId = ''
  }

  // Valor fora das listas, só possível enviando à mão, conta como vazio.
  const [contratantes, servicos] = await Promise.all([listarContratantes(), listarServicos()])
  if (!contratantes.includes(dados.contratante)) dados.contratante = ''
  dados.servicos = dados.servicos.filter((s) => servicos.includes(s))
  if (!(TIPOS_VIGENCIA as string[]).includes(dados.tipoVigencia)) dados.tipoVigencia = ''
  // Prazo indeterminado não tem término (DF-68, arquitetura 4.3).
  if (dados.tipoVigencia === 'Prazo indeterminado') dados.termino = ''

  const [outros, responsaveis] = dados.clienteId
    ? await Promise.all([listarContratosDoCliente(dados.clienteId), listarResponsaveis(dados.clienteId)])
    : [[], []]
  const erros = validarContrato(dados, {
    atual,
    codigosDoCliente: outros.filter((c) => c.id !== atual?.id).map((c) => c.codigo),
    responsaveisPermitidos: responsaveis.map((u) => u.id),
  })
  if (Object.keys(erros).length > 0) return { erros, valores: dados }

  return {
    erros: {},
    valores: dados,
    sucesso: {
      mensagem: mensagemDeSucesso('Contrato salvo.'),
      destino: atual ? `/contratos/${atual.id}` : `/clientes/${dados.clienteId}?aba=contratos`,
    },
  }
}
