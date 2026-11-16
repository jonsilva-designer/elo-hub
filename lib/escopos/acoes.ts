'use server'

import { contratoFechado } from '@/lib/contratos/regras'
import { obterContrato } from '@/lib/dados/contratos'
import { listarEscoposDoCliente, obterEscopo } from '@/lib/dados/escopos'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { listarResponsaveis } from '@/lib/dados/usuarios'
import { mensagemDeSucesso, SEM_PERMISSAO } from '@/lib/resultado-acao'
import type { EstadoSalvarEscopo } from './estados'
import { CRITICIDADES, PRIORIDADES } from './regras'
import { avisoDaVigencia, lerDadosEscopo, MENSAGENS_ESCOPO, validarEscopo } from './validacao'

// Ações do escopo (parte 3, 5.8 e 5.9). Só o Administrador cadastra e edita (matriz 4.3). Conferem tudo no
// servidor, mesmo quando a tela esconde o botão. No protótipo, salvar só simula: nada é gravado.

const texto = (valor: FormDataEntryValue | null) => (typeof valor === 'string' ? valor.trim() : '')

/**
 * Cadastro e edição do escopo. Com `id`, é edição: o contrato e o cliente são os do escopo, e a criticidade do
 * formulário é ignorada (muda só por Reclassificar). No cadastro, o contrato vem do formulário e não pode estar
 * fechado (RN-23). Com tudo certo, a conclusão prevista depois do término da vigência devolve o aviso da RN-21,
 * até vir a confirmação.
 */
export async function salvarEscopo(_estado: EstadoSalvarEscopo, formData: FormData): Promise<EstadoSalvarEscopo> {
  const usuario = await obterUsuarioAtual()
  const dados = lerDadosEscopo(formData)
  const recusa = (erroGeral: string): EstadoSalvarEscopo => ({ erros: {}, valores: dados, erroGeral })
  if (!ehAdmin(usuario)) return recusa(SEM_PERMISSAO)

  const id = texto(formData.get('id'))
  const atual = id ? await obterEscopo(id) : null
  // Não diz se o escopo ou o contrato existem.
  if (id && !atual) return recusa(SEM_PERMISSAO)
  const contrato = await obterContrato(atual ? atual.contratoId : dados.contratoId)
  if (!contrato) return recusa(SEM_PERMISSAO)
  dados.contratoId = contrato.id
  if (!atual && contratoFechado(contrato.status)) return recusa(MENSAGENS_ESCOPO.contratoFechado)

  if (atual) {
    dados.criticidade = atual.criticidade
    dados.justificativaCriticidade = atual.justificativaCriticidade
  }
  // Valor fora das listas, só possível enviando à mão, conta como vazio.
  if (!(CRITICIDADES as string[]).includes(dados.criticidade)) dados.criticidade = ''
  if (!(PRIORIDADES as string[]).includes(dados.prioridade)) dados.prioridade = ''

  const [responsaveis, escoposDoCliente] = await Promise.all([
    listarResponsaveis(contrato.clienteId),
    listarEscoposDoCliente(contrato.clienteId),
  ])
  // O ciclo anterior é outro escopo do mesmo cliente (DF-57, RN-02).
  if (!escoposDoCliente.some((e) => e.id === dados.cicloAnteriorId && e.id !== atual?.id)) dados.cicloAnteriorId = ''

  const erros = validarEscopo(dados, { atual, responsaveisPermitidos: responsaveis.map((u) => u.id) })
  if (Object.keys(erros).length > 0) return { erros, valores: dados }

  // RN-21: só o contrato com vigência e término dá o aviso, e só depois do término (no próprio dia, não).
  const termino = contrato.vigencia !== null && contrato.tipoVigencia !== 'Prazo indeterminado' ? contrato.termino : null
  if (!dados.confirmarAviso && termino && dados.conclusaoPrevista && dados.conclusaoPrevista > termino) {
    return { erros: {}, valores: dados, aviso: avisoDaVigencia(termino) }
  }

  return {
    erros: {},
    valores: dados,
    sucesso: {
      mensagem: mensagemDeSucesso('Escopo salvo.'),
      destino: atual ? `/escopos/${atual.id}` : `/contratos/${contrato.id}`,
    },
  }
}
