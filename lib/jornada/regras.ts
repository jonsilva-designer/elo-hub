import type { EtapaJornada, LinhaEtapa, Perfil, StatusEscopo, StatusEtapa } from '@/lib/dados/tipos'
import { escopoFechado } from '@/lib/escopos/regras'

// Jornada ELO (F06, RN-08, DF-28): a etapa atual e o progresso são calculados e não são editáveis (CA-06.6).

export const ETAPAS: EtapaJornada[] = ['Diagnosticar', 'Estruturar', 'Implementar', 'Monitorar', 'Evoluir']

const posicao = (l: LinhaEtapa) => ETAPAS.indexOf(l.etapa)

/** A mais avançada entre as etapas com o status dado, ou undefined. */
const maisAvancada = (etapas: LinhaEtapa[], status: LinhaEtapa['status']) =>
  etapas.filter((l) => l.status === status).sort((a, b) => posicao(b) - posicao(a))[0]

/** A etapa Em andamento mais avançada; sem nenhuma, a última Concluída; sem nenhuma iniciada, "Não iniciada". */
export function etapaAtual(etapas: LinhaEtapa[]): EtapaJornada | 'Não iniciada' {
  return (maisAvancada(etapas, 'Em andamento') ?? maisAvancada(etapas, 'Concluída'))?.etapa ?? 'Não iniciada'
}

/** Etapas Concluídas sobre etapas aplicáveis: Não aplicável não conta (DF-28, CA-06.10). */
export function progressoDaJornada(etapas: LinhaEtapa[]): { concluidas: number; aplicaveis: number } {
  return {
    concluidas: etapas.filter((l) => l.status === 'Concluída').length,
    aplicaveis: etapas.filter((l) => l.status !== 'Não aplicável').length,
  }
}

// Quem muda o quê em cada etapa (PRD 6.1, DF-24, DF-49, RN-22, RN-23; parte 3, 5.10).

export const MOTIVO_ULTIMA_APLICAVEL = 'Pelo menos uma etapa precisa continuar aplicável.'

export const MOTIVO_COM_DOCUMENTO = 'Etapa com documento não vira Não aplicável.'

/** A ordem em que os destinos aparecem. */
const ORDEM_DOS_STATUS: StatusEtapa[] = ['Não iniciada', 'Em andamento', 'Concluída', 'Não aplicável']

/** Os destinos de cada status, por perfil, antes da regra da última etapa aplicável. */
const DESTINOS: Record<Perfil, Record<StatusEtapa, StatusEtapa[]>> = {
  Equipe: {
    'Não iniciada': ['Em andamento', 'Concluída'],
    'Em andamento': ['Não iniciada', 'Concluída'],
    Concluída: [],
    'Não aplicável': [],
  },
  Administrador: {
    'Não iniciada': ['Em andamento', 'Concluída', 'Não aplicável'],
    'Em andamento': ['Não iniciada', 'Concluída'],
    Concluída: ['Não iniciada', 'Em andamento'],
    'Não aplicável': ['Não iniciada', 'Em andamento'],
  },
}

/**
 * Escopo aberto e, para a Equipe, etapa Não iniciada ou Em andamento (RN-23). O Administrador atualiza qualquer etapa
 * do escopo aberto: o status, o responsável e as datas.
 */
export function podeAtualizarEtapa(etapa: LinhaEtapa, perfil: Perfil, statusDoEscopo: StatusEscopo): boolean {
  if (escopoFechado(statusDoEscopo)) return false
  return perfil === 'Administrador' || etapa.status === 'Não iniciada' || etapa.status === 'Em andamento'
}

/**
 * Os status para onde a etapa pode ir, na ordem Não iniciada, Em andamento, Concluída, Não aplicável. O motivo explica
 * o Não aplicável que faltou ao Administrador: a última etapa aplicável ou a etapa com documento (DF-49).
 */
export function mudancasDaEtapa(
  etapa: LinhaEtapa,
  etapas: LinhaEtapa[],
  perfil: Perfil,
  statusDoEscopo: StatusEscopo,
  comDocumento = false,
): { destinos: StatusEtapa[]; motivo: string | null } {
  if (escopoFechado(statusDoEscopo)) return { destinos: [], motivo: null }
  const possiveis = DESTINOS[perfil][etapa.status]
  let motivo: string | null = null
  if (possiveis.includes('Não aplicável')) {
    const outraAplicavel = etapas.some((l) => l.etapa !== etapa.etapa && l.status !== 'Não aplicável')
    if (!outraAplicavel) motivo = MOTIVO_ULTIMA_APLICAVEL
    else if (comDocumento) motivo = MOTIVO_COM_DOCUMENTO
  }
  const destinos = ORDEM_DOS_STATUS.filter((s) => possiveis.includes(s) && !(s === 'Não aplicável' && motivo))
  return { destinos, motivo }
}

const LISTADAS: ReadonlySet<string> = new Set([
  'Não iniciada>Em andamento',
  'Em andamento>Não iniciada',
  'Não iniciada>Concluída',
  'Em andamento>Concluída',
  'Não iniciada>Não aplicável',
  'Não aplicável>Não iniciada',
])

/** A reabertura de uma Concluída e as mudanças fora da tabela da 6.1 pedem justificativa (RN-22). */
export function etapaPedeJustificativa(de: StatusEtapa, para: StatusEtapa): boolean {
  return de !== para && !LISTADAS.has(`${de}>${para}`)
}
