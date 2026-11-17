'use server'

import { obterEscopo } from '@/lib/dados/escopos'
import { listarAvaliacoesDoCliente } from '@/lib/dados/maturidade'
import { obterPlano } from '@/lib/dados/planos'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { listarResponsaveis } from '@/lib/dados/usuarios'
import { escopoFechado } from '@/lib/escopos/regras'
import { mensagemDeSucesso, SEM_PERMISSAO } from '@/lib/resultado-acao'
import type { EstadoSalvarPlano } from './estados'
import { planoFechado } from './regras'
import { lerDadosPlano, MENSAGENS_PLANO, validarPlano } from './validacao'

// Ações do plano de ação (parte 4, 5.5 e 5.6). O Administrador e a Equipe vinculada criam e atualizam planos
// (matriz 4.3); a regra de vínculo vem das leituras, que não devolvem o que o usuário não vê. Conferem tudo no
// servidor, mesmo quando a tela esconde o botão. No protótipo, salvar só simula: nada é gravado.

const texto = (valor: FormDataEntryValue | null) => (typeof valor === 'string' ? valor.trim() : '')

/**
 * Cadastro e edição do plano. Com `id`, é edição: o escopo e o cliente são os do plano, e a Equipe não edita o plano
 * fechado (RN-17). No cadastro, o escopo vem do formulário e não pode estar fechado (RN-23).
 */
export async function salvarPlano(_estado: EstadoSalvarPlano, formData: FormData): Promise<EstadoSalvarPlano> {
  const usuario = await obterUsuarioAtual()
  const dados = lerDadosPlano(formData)
  const recusa = (erroGeral: string): EstadoSalvarPlano => ({ erros: {}, valores: dados, erroGeral })

  const id = texto(formData.get('id'))
  const atual = id ? await obterPlano(id) : null
  // Não diz se o plano ou o escopo existem.
  if (id && !atual) return recusa(SEM_PERMISSAO)
  if (atual && !ehAdmin(usuario) && planoFechado(atual.status)) return recusa(SEM_PERMISSAO)
  const escopo = await obterEscopo(atual ? atual.escopoId : dados.escopoId)
  if (!escopo) return recusa(SEM_PERMISSAO)
  dados.escopoId = escopo.id
  if (!atual && escopoFechado(escopo.status)) return recusa(MENSAGENS_PLANO.escopoFechado)

  const [responsaveis, avaliacoes] = await Promise.all([
    listarResponsaveis(escopo.clienteId),
    listarAvaliacoesDoCliente(escopo.clienteId),
  ])
  // A avaliação de origem é do mesmo cliente (RN-02, DF-80). Outra, só possível enviando à mão, conta como vazia.
  if (!avaliacoes.some((a) => a.id === dados.avaliacaoId)) dados.avaliacaoId = ''

  const erros = validarPlano(dados, { atual, responsaveisPermitidos: responsaveis.map((u) => u.id) })
  if (Object.keys(erros).length > 0) return { erros, valores: dados }

  return {
    erros: {},
    valores: dados,
    sucesso: {
      mensagem: mensagemDeSucesso('Plano salvo.'),
      destino: atual ? `/planos/${atual.id}` : `/escopos/${escopo.id}`,
    },
  }
}
