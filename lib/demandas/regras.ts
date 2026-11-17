import type { Criticidade } from '@/lib/design/status'
import type { OrigemDemanda, Perfil, StatusDemanda } from '@/lib/dados/tipos'

// Regras da demanda da Central ELO (F09; PRD 6.1, RN-12, RN-20, DF-11, DF-40, DF-61). Puras: a data de hoje e o
// usuário chegam de quem chama.

export const STATUS_DEMANDA: StatusDemanda[] = [
  'Nova',
  'Em triagem',
  'Em atendimento',
  'Aguardando retorno',
  'Resolvida',
  'Encerrada',
]

export const STATUS_DEMANDA_ABERTOS: StatusDemanda[] = STATUS_DEMANDA.filter((s) => s !== 'Encerrada')

export const ORIGENS_DEMANDA: OrigemDemanda[] = [
  'Cliente',
  'Interna',
  'Institucional',
  'Especialista',
  'Reunião',
  'E-mail',
  'Telefone/WhatsApp',
  'Outro',
]

/** Encerrada é o único status final (RN-17). */
export function demandaFechada(status: StatusDemanda): boolean {
  return status === 'Encerrada'
}

/**
 * Vencida: prazo antes de hoje e a demanda não Resolvida nem Encerrada (CA-09.5). O prazo vale até o fim do dia
 * (RN-20), e Aguardando retorno continua valendo (DF-41).
 */
export function demandaVencida(d: { prazo: string | null; status: StatusDemanda }, hoje: string): boolean {
  return d.prazo !== null && d.prazo < hoje && d.status !== 'Resolvida' && d.status !== 'Encerrada'
}

export type AcaoDemanda =
  | 'iniciar-triagem'
  | 'iniciar-atendimento'
  | 'aguardar-retorno'
  | 'retomar-atendimento'
  | 'resolver'
  | 'voltar-ao-atendimento'
  | 'encerrar'
  | 'encerrar-sem-resolver'
  | 'reabrir'

type Pessoa = { id: string; perfil: Perfil }
type Responsaveis = { responsavelTriagemId: string; responsavelAtendimentoId: string | null }

/** Quem encerra: o atendente ou o Administrador; sem atendente, também a triagem (CA-09.8, DF-61). */
export function podeEncerrar(d: Responsaveis, usuario: Pessoa): boolean {
  if (usuario.perfil === 'Administrador') return true
  return d.responsavelAtendimentoId ? usuario.id === d.responsavelAtendimentoId : usuario.id === d.responsavelTriagemId
}

/** As ações de status que o usuário pode fazer, na ordem da tela (PRD 6.1). O acesso ao cliente é conferido antes. */
export function acoesDaDemanda(d: Responsaveis & { status: StatusDemanda }, usuario: Pessoa): AcaoDemanda[] {
  const encerra = podeEncerrar(d, usuario)
  const porStatus: Record<StatusDemanda, AcaoDemanda[]> = {
    Nova: ['iniciar-triagem', 'iniciar-atendimento'],
    'Em triagem': ['iniciar-atendimento'],
    'Em atendimento': ['aguardar-retorno', 'resolver'],
    'Aguardando retorno': ['retomar-atendimento', 'resolver'],
    Resolvida: ['voltar-ao-atendimento', ...(encerra ? (['encerrar'] as const) : [])],
    Encerrada: usuario.perfil === 'Administrador' ? ['reabrir'] : [],
  }
  const semResolver = !demandaFechada(d.status) && d.status !== 'Resolvida' && encerra
  return [...porStatus[d.status], ...(semResolver ? (['encerrar-sem-resolver'] as const) : [])]
}

/** O que falta para o atendimento começar (CA-09.2). */
export function faltaParaAtendimento(d: {
  categoria: string | null
  criticidade: Criticidade | null
  responsavelAtendimentoId: string | null
}): string[] {
  return [
    ...(d.categoria ? [] : ['Categoria']),
    ...(d.criticidade ? [] : ['Criticidade']),
    ...(d.responsavelAtendimentoId ? [] : ['Responsável pelo atendimento']),
  ]
}

/** O próximo número do ano, ELO-AAAA-NNNN (DF-11). Na virada do ano, recomeça em 0001. */
export function proximoNumero(numeros: readonly string[], ano: number): string {
  const prefixo = `ELO-${ano}-`
  const maior = numeros
    .filter((n) => n.startsWith(prefixo))
    .reduce((m, n) => Math.max(m, Number(n.slice(prefixo.length)) || 0), 0)
  return `${prefixo}${String(maior + 1).padStart(4, '0')}`
}

/** A origem Institucional só no cadastro da ELO, e esse cadastro só aceita ela (CA-09.15, DF-40). */
export function origemPermitida(origem: string, ehCadastroElo: boolean): boolean {
  if (!(ORIGENS_DEMANDA as string[]).includes(origem)) return false
  return ehCadastroElo ? origem === 'Institucional' : origem !== 'Institucional'
}
