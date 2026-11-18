'use server'

import { obterAtividade } from '@/lib/dados/atividades'
import { temDocumentoLigado } from '@/lib/dados/documentos'
import { obterPlano } from '@/lib/dados/planos'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { listarResponsaveis } from '@/lib/dados/usuarios'
import { planoFechado } from '@/lib/planos/regras'
import { mensagemDeSucesso, SEM_PERMISSAO, type ResultadoAcao } from '@/lib/resultado-acao'
import type { EstadoSalvarAtividade } from './estados'
import { atividadeFechada, avisoDoPrazo, reaberturaDaAtividade } from './regras'
import { lerDadosAtividade, MENSAGENS_ATIVIDADE, validarAtividade } from './validacao'

// Ações da atividade (parte 4, 5.7). O Administrador e a Equipe vinculada criam e atualizam atividades (matriz 4.3);
// só o Administrador reabre e exclui (RN-17, DF-33). Conferem tudo no servidor, mesmo quando a tela esconde o botão.
// No protótipo, salvar só simula: nada é gravado, e a data de conclusão seria registrada pelo banco (DF-43).

const texto = (valor: FormDataEntryValue | null) => (typeof valor === 'string' ? valor.trim() : '')

/**
 * Cadastro e edição da atividade. Com `id`, é edição: o plano e o cliente são os da atividade, e a Equipe não muda a
 * atividade fechada (RN-17). No cadastro, o plano vem do formulário e não pode estar fechado (RN-23). Com tudo certo,
 * o prazo depois do prazo do plano ou do término da vigência devolve o aviso da RN-21, até vir a confirmação.
 */
export async function salvarAtividade(_estado: EstadoSalvarAtividade, formData: FormData): Promise<EstadoSalvarAtividade> {
  const usuario = await obterUsuarioAtual()
  const dados = lerDadosAtividade(formData)
  const recusa = (erroGeral: string): EstadoSalvarAtividade => ({ erros: {}, valores: dados, erroGeral })

  const id = texto(formData.get('id'))
  const atual = id ? await obterAtividade(id) : null
  // Não diz se a atividade ou o plano existem.
  if (id && !atual) return recusa(SEM_PERMISSAO)
  if (atual && !ehAdmin(usuario) && atividadeFechada(atual.status)) return recusa(SEM_PERMISSAO)
  const plano = await obterPlano(atual ? atual.planoId : dados.planoId)
  if (!plano) return recusa(SEM_PERMISSAO)
  dados.planoId = plano.id
  if (!atual && planoFechado(plano.status)) return recusa(MENSAGENS_ATIVIDADE.planoFechado)

  const responsaveis = await listarResponsaveis(plano.clienteId)
  const erros = validarAtividade(dados, {
    atual,
    perfil: usuario.perfil,
    responsaveisPermitidos: responsaveis.map((u) => u.id),
  })
  if (Object.keys(erros).length > 0) return { erros, valores: dados }

  // Atividade reaberta dentro de um plano fechado: o plano é reaberto antes (RN-23), como o escopo com o contrato.
  if (atual && reaberturaDaAtividade(atual.status, dados.status as typeof atual.status) && planoFechado(plano.status)) {
    return recusa(MENSAGENS_ATIVIDADE.reabrirComPlanoFechado)
  }

  if (!dados.confirmarAviso) {
    const aviso = avisoDoPrazo(dados.prazo, { prazoDoPlano: plano.prazo, terminoDoContrato: plano.terminoDoContrato })
    if (aviso) return { erros: {}, valores: dados, aviso }
  }

  const deMinhas = texto(formData.get('origem')) === 'minhas-atividades'
  return {
    erros: {},
    valores: dados,
    sucesso: {
      mensagem: mensagemDeSucesso('Atividade salva.'),
      destino: deMinhas ? '/minhas-atividades' : `/planos/${plano.id}`,
    },
  }
}

const temTexto = (valor: unknown): valor is string => typeof valor === 'string' && valor.trim() !== ''

/**
 * Excluir a atividade (DF-33, RN-13): só o Administrador, sem documentos ligados (também os inativos) e com
 * justificativa. Quem não pode, ou um id que não existe, recebe a mesma recusa.
 */
export async function excluirAtividade(id: string, justificativa: string): Promise<ResultadoAcao> {
  const usuario = await obterUsuarioAtual()
  const atividade = ehAdmin(usuario) && typeof id === 'string' ? await obterAtividade(id) : null
  if (!atividade) return { ok: false, mensagem: SEM_PERMISSAO }
  if (await temDocumentoLigado({ atividadeId: atividade.id })) {
    return { ok: false, mensagem: 'Esta atividade tem documentos e não pode ser excluída.' }
  }
  if (!temTexto(justificativa)) return { ok: false, mensagem: 'Escreva a justificativa da exclusão.' }
  return { ok: true, mensagem: mensagemDeSucesso('Atividade excluída.') }
}
