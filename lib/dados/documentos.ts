import { nomeDoCliente } from '@/lib/clientes/filtros'
import { CATEGORIAS_DO_PRINCIPAL, podeAlterarDocumento, podeVerDocumento } from '@/lib/documentos/regras'
import { formatarData } from '@/lib/formato'
import { ATIVIDADES } from './mock/atividades'
import { AVALIACOES } from './mock/avaliacoes'
import { CLIENTES } from './mock/clientes'
import { CONTRATOS } from './mock/contratos'
import { DEMANDAS } from './mock/demandas'
import { DOCUMENTOS } from './mock/documentos'
import { ESCOPOS } from './mock/escopos'
import { ESPECIALISTAS } from './mock/especialistas'
import { PLANOS } from './mock/planos'
import { USUARIOS, VINCULOS } from './mock/usuarios'
import { obterUsuarioAtual } from './sessao'
import type { Documento, DocumentoDetalhado, EtapaJornada, VinculoDocumento } from './tipos'

// Leitura dos documentos (F12). O acesso segue o cliente do documento (RN-01, RN-16); o Documento do Especialista sem
// cliente, todos os logados leem (DF-65). As funções que impedem excluir ou mudar outros registros (RN-13, DF-49)
// contam também o que o usuário não vê e os inativos, sem revelar quais são.

const nomeDoUsuario = (id: string) => USUARIOS.find((u) => u.id === id)?.nome ?? ''

/** O registro mais específico ligado ao documento, na ordem da parte 6 (4.4), com o link. */
function vinculoMaisEspecifico(d: Documento): VinculoDocumento | null {
  const atividade = ATIVIDADES.find((a) => a.id === d.atividadeId)
  if (atividade) return { tipo: 'Atividade', rotulo: atividade.nome, href: `/atividades/${atividade.id}/editar` }
  const plano = PLANOS.find((p) => p.id === d.planoId)
  if (plano) return { tipo: 'Plano', rotulo: plano.nome, href: `/planos/${plano.id}` }
  const escopo = ESCOPOS.find((e) => e.id === d.escopoId)
  if (escopo && d.etapa) return { tipo: 'Etapa', rotulo: `${escopo.nome} · ${d.etapa}`, href: `/escopos/${escopo.id}` }
  if (escopo) return { tipo: 'Escopo', rotulo: escopo.nome, href: `/escopos/${escopo.id}` }
  const demanda = DEMANDAS.find((x) => x.numero === d.demandaNumero)
  if (demanda) return { tipo: 'Demanda', rotulo: `${demanda.numero} · ${demanda.assunto}`, href: `/central/${demanda.numero}` }
  const avaliacao = AVALIACOES.find((a) => a.id === d.avaliacaoId)
  if (avaliacao) {
    return { tipo: 'Avaliação', rotulo: `Avaliação de ${formatarData(avaliacao.data)}`, href: `/avaliacoes/${avaliacao.id}` }
  }
  const contrato = CONTRATOS.find((c) => c.id === d.contratoId)
  if (contrato) return { tipo: 'Contrato', rotulo: contrato.codigo, href: `/contratos/${contrato.id}` }
  const especialista = ESPECIALISTAS.find((e) => e.id === d.especialistaId)
  if (especialista) return { tipo: 'Especialista', rotulo: especialista.nome, href: `/especialistas/${especialista.id}` }
  return null
}

function detalhar(d: Documento): DocumentoDetalhado {
  const cliente = CLIENTES.find((c) => c.id === d.clienteId)
  const substituto = DOCUMENTOS.find((x) => x.id === d.substituidoPorId)
  return {
    ...d,
    arquivo: { ...d.arquivo },
    nomeCliente: cliente ? nomeDoCliente(cliente) : null,
    nomeEspecialista: ESPECIALISTAS.find((e) => e.id === d.especialistaId)?.nome ?? null,
    codigoContrato: CONTRATOS.find((c) => c.id === d.contratoId)?.codigo ?? null,
    nomeEscopo: ESCOPOS.find((e) => e.id === d.escopoId)?.nome ?? null,
    nomePlano: PLANOS.find((p) => p.id === d.planoId)?.nome ?? null,
    nomeAtividade: ATIVIDADES.find((a) => a.id === d.atividadeId)?.nome ?? null,
    assuntoDemanda: DEMANDAS.find((x) => x.numero === d.demandaNumero)?.assunto ?? null,
    dataAvaliacao: AVALIACOES.find((a) => a.id === d.avaliacaoId)?.data ?? null,
    nomeIncluidoPor: nomeDoUsuario(d.incluidoPorId),
    substituidoPor: substituto ? { id: substituto.id, nome: substituto.nome } : null,
    substitui: DOCUMENTOS.filter((x) => x.substituidoPorId === d.id).map((x) => ({ id: x.id, nome: x.nome })),
    vinculo: vinculoMaisEspecifico(d),
  }
}

/** Do mais recente para o mais antigo, pela data do documento; depois, pelo nome. */
const porData = (a: Documento, b: Documento) => b.data.localeCompare(a.data) || a.nome.localeCompare(b.nome, 'pt-BR')

async function lerDocumentos(filtro: (d: Documento) => boolean): Promise<DocumentoDetalhado[]> {
  const usuario = await obterUsuarioAtual()
  return DOCUMENTOS.filter((d) => filtro(d) && podeVerDocumento(d, usuario, VINCULOS))
    .sort(porData)
    .map(detalhar)
}

/** Os documentos que o usuário vê, com os inativos: a lista os esconde no filtro padrão (CA-18.2). */
export async function listarDocumentos(): Promise<DocumentoDetalhado[]> {
  return lerDocumentos(() => true)
}

/** O documento, ou null se não existe ou está fora do acesso (sem dizer qual dos dois). O inativo continua abrindo. */
export async function obterDocumento(id: string): Promise<DocumentoDetalhado | null> {
  const [documento] = await lerDocumentos((d) => d.id === id)
  return documento ?? null
}

export type FiltroDocumentos = {
  clienteId?: string
  contratoId?: string
  escopoId?: string
  etapa?: EtapaJornada
  planoId?: string
  atividadeId?: string
  demandaNumero?: string
  especialistaId?: string
  avaliacaoId?: string
}

const casa = (d: Documento, f: FiltroDocumentos) =>
  (!f.clienteId || d.clienteId === f.clienteId) &&
  (!f.contratoId || d.contratoId === f.contratoId) &&
  (!f.escopoId || d.escopoId === f.escopoId) &&
  (!f.etapa || d.etapa === f.etapa) &&
  (!f.planoId || d.planoId === f.planoId) &&
  (!f.atividadeId || d.atividadeId === f.atividadeId) &&
  (!f.demandaNumero || d.demandaNumero === f.demandaNumero) &&
  (!f.especialistaId || d.especialistaId === f.especialistaId) &&
  (!f.avaliacaoId || d.avaliacaoId === f.avaliacaoId)

/** Os documentos ligados ao registro, para o painel dele (CA-12.3): os que o usuário vê, sem os inativos (RN-24). */
export async function listarDocumentosLigados(filtro: FiltroDocumentos): Promise<DocumentoDetalhado[]> {
  return lerDocumentos((d) => !d.inativo && casa(d, filtro))
}

/**
 * Há documento ligado ao registro (RN-13, DF-33): impede excluí-lo. Conta também o inativo e o que o usuário não vê,
 * sem revelar qual é.
 */
export async function temDocumentoLigado(filtro: FiltroDocumentos): Promise<boolean> {
  await obterUsuarioAtual()
  return DOCUMENTOS.some((d) => casa(d, filtro))
}

/** As etapas do escopo com documento, na ordem da Jornada (DF-49): não viram Não aplicável. Conta todos. */
export async function etapasComDocumento(escopoId: string): Promise<EtapaJornada[]> {
  await obterUsuarioAtual()
  const etapas = new Set(DOCUMENTOS.filter((d) => d.escopoId === escopoId && d.etapa).map((d) => d.etapa!))
  return ESCOPOS.find((e) => e.id === escopoId)?.etapas.map((l) => l.etapa).filter((e) => etapas.has(e)) ?? []
}

/**
 * Os documentos que podem substituir este, para marcá-lo como Superado (CA-12.4): Vigentes, ativos, outro documento,
 * do mesmo cliente; sem cliente, do mesmo especialista e também sem cliente. Vazia fora do acesso.
 */
export async function substitutosPossiveis(id: string): Promise<{ id: string; nome: string }[]> {
  const documento = await obterDocumento(id)
  if (!documento) return []
  const mesmoDono = (d: Documento) =>
    documento.clienteId === null
      ? d.clienteId === null && d.especialistaId === documento.especialistaId
      : d.clienteId === documento.clienteId
  return (await lerDocumentos((d) => d.id !== id && d.status === 'Vigente' && !d.inativo && mesmoDono(d))).map((d) => ({
    id: d.id,
    nome: d.nome,
  }))
}

/**
 * O documento tem ligação que impede excluí-lo (RN-13, DF-33): substitui outro, foi substituído, ou é o documento
 * principal de um contrato. Conta também o que o usuário não vê.
 */
export async function documentoTemLigacao(id: string): Promise<boolean> {
  await obterUsuarioAtual()
  const documento = DOCUMENTOS.find((d) => d.id === id)
  if (!documento) return false
  return (
    documento.substituidoPorId !== null ||
    DOCUMENTOS.some((d) => d.substituidoPorId === id) ||
    CONTRATOS.some((c) => c.documentoPrincipalId === id)
  )
}

/** Se o usuário pode incluir, alterar os dados e enviar nova versão do documento (matriz 4.3, DF-65). */
export async function usuarioAlteraDocumento(d: Pick<Documento, 'clienteId'>): Promise<boolean> {
  return podeAlterarDocumento(d, await obterUsuarioAtual(), VINCULOS)
}

/** O contrato que tem o documento como documento principal (F03), ou null. */
export async function contratoDoPrincipal(id: string): Promise<string | null> {
  await obterUsuarioAtual()
  return CONTRATOS.find((c) => c.documentoPrincipalId === id)?.id ?? null
}

/** O documento principal do contrato (F03), se o usuário o vê; null sem documento principal. */
export async function documentoPrincipalDoContrato(contratoId: string): Promise<{ id: string; nome: string } | null> {
  const id = CONTRATOS.find((c) => c.id === contratoId)?.documentoPrincipalId
  const documento = id ? await obterDocumento(id) : null
  return documento ? { id: documento.id, nome: documento.nome } : null
}

/** Os documentos que podem ser o principal do contrato (F03): Contrato ou Proposta Comercial ligados a ele, ativos. */
export async function documentosPrincipaisPossiveis(contratoId: string): Promise<{ id: string; nome: string }[]> {
  const documentos = await lerDocumentos(
    (d) => d.contratoId === contratoId && !d.inativo && CATEGORIAS_DO_PRINCIPAL.includes(d.categoria),
  )
  return documentos.map((d) => ({ id: d.id, nome: d.nome }))
}
