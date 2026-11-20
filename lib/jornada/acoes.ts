'use server'

import { etapasComDocumento } from '@/lib/dados/documentos'
import { obterEscopo } from '@/lib/dados/escopos'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { listarResponsaveis } from '@/lib/dados/usuarios'
import { escopoFechado } from '@/lib/escopos/regras'
import { mensagemDeSucesso, SEM_PERMISSAO } from '@/lib/resultado-acao'
import type { EstadoAtualizarEtapa } from './estados'
import { ETAPAS, mudancasDaEtapa, podeAtualizarEtapa } from './regras'
import { lerDadosEtapa, MENSAGENS_ETAPA, validarEtapa } from './validacao'

// Atualizar uma etapa da Jornada (parte 3, 5.10; PRD 6.1, DF-24, DF-49). A Equipe vinculada inicia, desfaz o
// início e conclui; o Administrador também marca Não aplicável, reabre, corrige e troca o responsável. Confere tudo
// no servidor, mesmo o que a janela não oferece. No protótipo, salvar só simula: nada é gravado.

export async function atualizarEtapa(_estado: EstadoAtualizarEtapa, formData: FormData): Promise<EstadoAtualizarEtapa> {
  const usuario = await obterUsuarioAtual()
  const dados = lerDadosEtapa(formData)
  const recusa = (erroGeral: string): EstadoAtualizarEtapa => ({ erros: {}, valores: dados, erroGeral })

  // 1. O escopo ao alcance do usuário (RN-01) e uma etapa oficial. Não diz se o escopo existe.
  const escopo = await obterEscopo(dados.escopoId)
  const atual = escopo?.etapas.find((l) => l.etapa === dados.etapa && (ETAPAS as string[]).includes(dados.etapa))
  if (!escopo || !atual) return recusa(SEM_PERMISSAO)

  // 2. Escopo fechado: as etapas não mudam (RN-23).
  if (escopoFechado(escopo.status)) return recusa(MENSAGENS_ETAPA.fechado)

  // Etapa com documento, também inativo, não vira Não aplicável (DF-49).
  const comDocumento = (await etapasComDocumento(escopo.id)).includes(atual.etapa)
  const { destinos, motivo } = mudancasDaEtapa(atual, escopo.etapas, usuario.perfil, escopo.status, comDocumento)

  // 3. A Equipe que envia à mão o que é do Administrador recebe a recusa, sem gravar (matriz 4.3).
  if (usuario.perfil === 'Equipe') {
    const statusPermitido = dados.status === atual.status || (destinos as string[]).includes(dados.status)
    const mesmoResponsavel = dados.responsavelId === (atual.responsavelId ?? '')
    if (!podeAtualizarEtapa(atual, usuario.perfil, escopo.status) || !statusPermitido || !mesmoResponsavel) {
      return recusa(SEM_PERMISSAO)
    }
  }

  // 4 a 6. O status, o responsável, as datas e a justificativa.
  // A Equipe mantém o responsável que a etapa já tem (conferido acima).
  const responsaveisPermitidos =
    usuario.perfil === 'Administrador'
      ? [...(await listarResponsaveis(escopo.clienteId)).map((u) => u.id), ...(atual.responsavelId ? [atual.responsavelId] : [])]
      : [atual.responsavelId ?? '']
  // Reabrir uma Concluída apaga a data de conclusão (CN-22.2), antes de conferir as datas: a conclusão que vai ser
  // apagada não pode barrar o início novo (revisão do código).
  if (atual.status === 'Concluída' && dados.status !== 'Concluída') dados.conclusao = ''
  const erros = validarEtapa(dados, { atual, destinos, motivo, responsaveisPermitidos })
  if (Object.keys(erros).length > 0) return { erros, valores: dados }

  return { erros: {}, valores: dados, sucesso: { mensagem: mensagemDeSucesso('Etapa atualizada.') } }
}
