'use server'

import { obterCliente } from '@/lib/dados/clientes'
import { listarAvaliadores, listarDimensoes, obterAvaliacao } from '@/lib/dados/maturidade'
import { mensagemDeSucesso, SEM_PERMISSAO } from '@/lib/resultado-acao'
import type { EstadoSalvarAvaliacao } from './estados'
import { lerDadosAvaliacao, MENSAGENS_AVALIACAO, validarAvaliacao } from './validacao'

// Ações da avaliação de maturidade (parte 2, 5.3). Conferem o perfil e o vínculo no servidor, mesmo quando a
// tela esconde o botão. No protótipo, salvar só simula: nada é gravado, e a resposta diz isso.

const texto = (valor: FormDataEntryValue | null) => (typeof valor === 'string' ? valor.trim() : '')

const recusa = (erroGeral: string): EstadoSalvarAvaliacao => ({ erros: {}, valores: null, erroGeral })

/**
 * Nova avaliação (com `clienteId`) ou edição (com `avaliacaoId`), pelo Administrador ou pela Equipe vinculada.
 * O cliente e as dimensões vêm do servidor, e não do navegador. Fora do alcance, a recusa não diz se o registro
 * existe. A avaliação Concluída não muda (RN-23).
 */
export async function salvarAvaliacao(
  _estado: EstadoSalvarAvaliacao,
  formData: FormData,
): Promise<EstadoSalvarAvaliacao> {
  const avaliacaoId = texto(formData.get('avaliacaoId'))
  let clienteId: string
  let dimensoes: string[]

  if (avaliacaoId) {
    const avaliacao = await obterAvaliacao(avaliacaoId)
    if (!avaliacao) return recusa(SEM_PERMISSAO)
    if (avaliacao.status === 'Concluída') return recusa(MENSAGENS_AVALIACAO.concluida)
    clienteId = avaliacao.clienteId
    dimensoes = avaliacao.dimensoes.map((d) => d.dimensao)
  } else {
    const id = texto(formData.get('clienteId'))
    const cliente = id ? await obterCliente(id) : null
    // Não se avalia cliente Inativo nem o cadastro da ELO.
    if (!cliente || cliente.status === 'Inativo' || cliente.ehCadastroElo) return recusa(SEM_PERMISSAO)
    clienteId = cliente.id
    dimensoes = await listarDimensoes()
  }

  const dados = lerDadosAvaliacao(formData, dimensoes.length)
  const permitidos = (await listarAvaliadores(clienteId)).map((u) => u.id)
  const erros = validarAvaliacao(dados, permitidos)
  if (Object.keys(erros).length > 0) return { erros, valores: dados }

  return {
    erros: {},
    valores: dados,
    sucesso: {
      mensagem: mensagemDeSucesso('Avaliação salva.'),
      destino: avaliacaoId ? `/avaliacoes/${avaliacaoId}` : `/clientes/${clienteId}?aba=maturidade`,
    },
  }
}
