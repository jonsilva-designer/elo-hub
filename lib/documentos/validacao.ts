import type { OpcoesDeVinculo } from '@/lib/dados/opcoes-documento'
import type { ArquivoDocumento } from '@/lib/dados/tipos'
import { dataValida } from '@/lib/escopos/validacao'
import { ETAPAS } from '@/lib/jornada/regras'
import { DOCUMENTO_DO_ESPECIALISTA, nomeDeArquivoSeguro } from './regras'

// Validação da inclusão e da edição do documento (parte 6, 4.2), no servidor. Os vínculos são todos do cliente do
// documento (RN-02): a ação completa os ancestrais a partir do vínculo mais específico e recusa o que não bate. As
// mensagens são provisórias (DT-03).

export const MENSAGENS_DOCUMENTO = {
  nome: 'Informe o nome do documento.',
  categoria: 'Escolha a categoria.',
  cliente: 'Escolha o cliente.',
  semClienteSoAdmin: 'Escolha o cliente. Sem cliente, só o Administrador inclui o Documento do Especialista.',
  especialista: 'Escolha o especialista.',
  data: 'Informe a data do documento.',
  contrato: 'O contrato precisa ser do cliente.',
  escopo: 'O escopo precisa ser do cliente e do contrato escolhido.',
  etapa: 'A etapa precisa ser de um escopo escolhido.',
  plano: 'O plano precisa ser do escopo escolhido.',
  atividade: 'A atividade precisa ser do plano escolhido.',
  demanda: 'A demanda precisa ser do cliente.',
  avaliacao: 'A avaliação precisa ser do cliente.',
  mesmoDono: 'A nova versão precisa ser do mesmo cliente do documento anterior.',
  soVigente: 'Só um documento Vigente recebe nova versão.',
}

export type DadosDocumento = {
  /** Na edição. */
  id: string
  nome: string
  categoria: string
  clienteId: string
  especialistaId: string
  contratoId: string
  escopoId: string
  etapa: string
  planoId: string
  atividadeId: string
  demandaNumero: string
  avaliacaoId: string
  data: string
  observacoes: string
  /** Na nova versão: o documento que passa a Superado (DF-44). */
  substitui: string
  /** De onde a inclusão foi aberta, para a volta: cliente, contrato, escopo, plano, atividade, demanda, especialista, avaliacao ou substitui. */
  origem: string
}

export type ErrosDocumento = Partial<Record<keyof DadosDocumento | 'arquivo', string>>

const CAMPOS: (keyof DadosDocumento)[] = [
  'id',
  'nome',
  'categoria',
  'clienteId',
  'especialistaId',
  'contratoId',
  'escopoId',
  'etapa',
  'planoId',
  'atividadeId',
  'demandaNumero',
  'avaliacaoId',
  'data',
  'observacoes',
  'substitui',
  'origem',
]

/** Os campos do formulário, sem espaços nas pontas. */
export function lerDadosDocumento(formData: FormData): DadosDocumento {
  const dados = {} as DadosDocumento
  for (const campo of CAMPOS) {
    const valor = formData.get(campo)
    dados[campo] = typeof valor === 'string' ? valor.trim() : ''
  }
  return dados
}

/** O arquivo enviado, com o nome higienizado (arquitetura 6), ou null sem arquivo. */
export function lerArquivo(formData: FormData): ArquivoDocumento | null {
  const valor = formData.get('arquivo')
  if (!(valor instanceof File) || (valor.name === '' && valor.size === 0)) return null
  return { nome: nomeDeArquivoSeguro(valor.name), tipo: valor.type, tamanho: valor.size }
}

/**
 * Completa os vínculos (RN-02): a atividade leva o plano, o plano leva o escopo, o escopo leva o contrato, e o
 * vínculo leva o cliente, quando o mais geral está vazio. Fora do Documento do Especialista, o especialista é
 * descartado (F12). O que já foi escolhido não muda: a validação recusa o que não bate.
 */
export function completarVinculos(dados: DadosDocumento, opcoes: OpcoesDeVinculo): DadosDocumento {
  const d = { ...dados }
  if (d.categoria !== DOCUMENTO_DO_ESPECIALISTA) d.especialistaId = ''
  const atividade = opcoes.atividades.find((a) => a.id === d.atividadeId)
  if (atividade && !d.planoId) d.planoId = atividade.planoId
  const plano = opcoes.planos.find((p) => p.id === d.planoId)
  if (plano && !d.escopoId) d.escopoId = plano.escopoId
  const escopo = opcoes.escopos.find((e) => e.id === d.escopoId)
  // Só leva o contrato do escopo do cliente escolhido: o de outro cliente fica com um erro só, no escopo.
  if (escopo && !d.contratoId && (!d.clienteId || escopo.clienteId === d.clienteId)) d.contratoId = escopo.contratoId
  if (!d.clienteId) {
    d.clienteId =
      opcoes.contratos.find((c) => c.id === d.contratoId)?.clienteId ??
      escopo?.clienteId ??
      opcoes.demandas.find((x) => x.id === d.demandaNumero)?.clienteId ??
      opcoes.avaliacoes.find((a) => a.id === d.avaliacaoId)?.clienteId ??
      ''
  }
  return d
}

/**
 * Os erros por campo (CA-12.1, DF-65, RN-02); vazio quando está tudo certo. O arquivo é conferido à parte
 * (`erroDoArquivo`). As opções são as que o usuário vê: o vínculo de fora, enviado à mão, não está nelas.
 */
export function validarDocumento(
  dados: DadosDocumento,
  contexto: { categorias: string[]; opcoes: OpcoesDeVinculo; semClientePermitido: boolean },
): ErrosDocumento {
  const { opcoes } = contexto
  const erros: ErrosDocumento = {}
  if (!dados.nome) erros.nome = MENSAGENS_DOCUMENTO.nome
  if (!contexto.categorias.includes(dados.categoria)) erros.categoria = MENSAGENS_DOCUMENTO.categoria

  const doEspecialista = dados.categoria === DOCUMENTO_DO_ESPECIALISTA
  if (doEspecialista && !opcoes.especialistas.some((e) => e.id === dados.especialistaId)) {
    erros.especialistaId = MENSAGENS_DOCUMENTO.especialista
  }
  if (!dados.clienteId) {
    if (!doEspecialista) erros.clienteId = MENSAGENS_DOCUMENTO.cliente
    else if (!contexto.semClientePermitido) erros.clienteId = MENSAGENS_DOCUMENTO.semClienteSoAdmin
  } else if (!opcoes.clientes.some((c) => c.id === dados.clienteId)) {
    erros.clienteId = MENSAGENS_DOCUMENTO.cliente
  }
  if (!dataValida(dados.data)) erros.data = MENSAGENS_DOCUMENTO.data

  const doCliente = (x: { clienteId: string } | undefined) => x !== undefined && x.clienteId === dados.clienteId
  if (dados.contratoId && !doCliente(opcoes.contratos.find((c) => c.id === dados.contratoId))) {
    erros.contratoId = MENSAGENS_DOCUMENTO.contrato
  }
  const escopo = opcoes.escopos.find((e) => e.id === dados.escopoId)
  if (dados.escopoId && (!doCliente(escopo) || (dados.contratoId && escopo!.contratoId !== dados.contratoId))) {
    erros.escopoId = MENSAGENS_DOCUMENTO.escopo
  }
  if (dados.etapa && (!escopo || !(ETAPAS as string[]).includes(dados.etapa))) erros.etapa = MENSAGENS_DOCUMENTO.etapa
  const plano = opcoes.planos.find((p) => p.id === dados.planoId)
  if (dados.planoId && (!plano || plano.escopoId !== dados.escopoId)) erros.planoId = MENSAGENS_DOCUMENTO.plano
  const atividade = opcoes.atividades.find((a) => a.id === dados.atividadeId)
  if (dados.atividadeId && (!atividade || atividade.planoId !== dados.planoId)) erros.atividadeId = MENSAGENS_DOCUMENTO.atividade
  if (dados.demandaNumero && !doCliente(opcoes.demandas.find((x) => x.id === dados.demandaNumero))) {
    erros.demandaNumero = MENSAGENS_DOCUMENTO.demanda
  }
  if (dados.avaliacaoId && !doCliente(opcoes.avaliacoes.find((a) => a.id === dados.avaliacaoId))) {
    erros.avaliacaoId = MENSAGENS_DOCUMENTO.avaliacao
  }
  return erros
}

/**
 * Para onde a inclusão volta: o registro de onde foi aberta, o documento anterior na nova versão ou a lista. A origem é
 * um dos nomes conhecidos; nunca um endereço livre.
 */
export function destinoDaInclusao(dados: DadosDocumento): string {
  const caminhos: Record<string, string | null> = {
    substitui: dados.substitui ? `/documentos/${dados.substitui}` : null,
    cliente: dados.clienteId ? `/clientes/${dados.clienteId}?aba=documentos` : null,
    contrato: dados.contratoId ? `/contratos/${dados.contratoId}` : null,
    escopo: dados.escopoId ? `/escopos/${dados.escopoId}` : null,
    plano: dados.planoId ? `/planos/${dados.planoId}` : null,
    atividade: dados.atividadeId ? `/atividades/${dados.atividadeId}/editar` : null,
    demanda: dados.demandaNumero ? `/central/${dados.demandaNumero}` : null,
    especialista: dados.especialistaId ? `/especialistas/${dados.especialistaId}` : null,
    avaliacao: dados.avaliacaoId ? `/avaliacoes/${dados.avaliacaoId}` : null,
  }
  return (Object.hasOwn(caminhos, dados.origem) ? caminhos[dados.origem] : null) ?? '/documentos'
}
