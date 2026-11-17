import type { Perfil, SituacaoPrazo, StatusAtividade } from '@/lib/dados/tipos'
import { formatarData, somarDias } from '@/lib/formato'

// Regras da atividade (F08; PRD 6.1, RN-09, RN-10, RN-17, RN-20, RN-21, RN-22). Puras: a data de hoje e os dias da
// "próxima do prazo" chegam de quem chama.

export const STATUS_ATIVIDADE: StatusAtividade[] = ['Não iniciada', 'Em andamento', 'Concluída', 'Cancelada']

export const STATUS_ATIVIDADE_ABERTOS: StatusAtividade[] = ['Não iniciada', 'Em andamento']

/** Concluída e Cancelada são finais: só o Administrador reabre (RN-17). */
export function atividadeFechada(status: StatusAtividade): boolean {
  return status === 'Concluída' || status === 'Cancelada'
}

/**
 * Os status que o formulário oferece (6.1, RN-22). No cadastro (`atual` null), Não iniciada ou Em andamento. Aberta:
 * os quatro, para os dois perfis. Fechada: a Equipe não muda; o Administrador reabre para um aberto.
 */
export function destinosDaAtividade(atual: StatusAtividade | null, perfil: Perfil): StatusAtividade[] {
  if (atual === null) return [...STATUS_ATIVIDADE_ABERTOS]
  if (!atividadeFechada(atual)) return [...STATUS_ATIVIDADE]
  return perfil === 'Administrador' ? [...STATUS_ATIVIDADE_ABERTOS, atual] : [atual]
}

/** Sair de um status final para um aberto: reabertura, com justificativa, e a data de conclusão é apagada (DF-43). */
export function reaberturaDaAtividade(de: StatusAtividade, para: StatusAtividade): boolean {
  return atividadeFechada(de) && !atividadeFechada(para)
}

/**
 * Atrasada: prazo antes de hoje (o prazo vale até o fim do dia, RN-20). Próxima do prazo: de hoje até hoje + `dias`,
 * inclusive. Concluída e Cancelada não têm situação. Datas em AAAA-MM-DD, comparadas como texto.
 */
export function situacaoDoPrazo(
  atividade: { prazo: string; status: StatusAtividade },
  hoje: string,
  dias: number,
): SituacaoPrazo | null {
  if (atividadeFechada(atividade.status)) return null
  if (atividade.prazo < hoje) return 'Atrasada'
  if (atividade.prazo <= somarDias(hoje, dias)) return 'Próxima do prazo'
  return null
}

/** O total, as concluídas e as atrasadas do plano (CA-07.2). O total conta também as Canceladas. */
export function resumoDasAtividades(
  atividades: readonly { prazo: string; status: StatusAtividade }[],
  hoje: string,
  dias: number,
): { total: number; concluidas: number; atrasadas: number } {
  return {
    total: atividades.length,
    concluidas: atividades.filter((a) => a.status === 'Concluída').length,
    atrasadas: atividades.filter((a) => situacaoDoPrazo(a, hoje, dias) === 'Atrasada').length,
  }
}

/**
 * O aviso da RN-21: o prazo da atividade depois do prazo do plano ou do término da vigência do contrato. No próprio
 * dia, não. `terminoDoContrato` chega null quando o contrato não tem vigência ou é por prazo indeterminado.
 */
export function avisoDoPrazo(
  prazo: string,
  limites: { prazoDoPlano: string | null; terminoDoContrato: string | null },
): string | null {
  const motivos: string[] = []
  if (limites.prazoDoPlano && prazo > limites.prazoDoPlano) {
    motivos.push(`O prazo é depois do prazo do plano (${formatarData(limites.prazoDoPlano)}).`)
  }
  if (limites.terminoDoContrato && prazo > limites.terminoDoContrato) {
    motivos.push(`O prazo é depois do término da vigência do contrato (${formatarData(limites.terminoDoContrato)}).`)
  }
  return motivos.length > 0 ? `${motivos.join(' ')} Salvar mesmo assim?` : null
}

/**
 * A ordem das listas de atividades (CA-08.4): as abertas antes das fechadas e, em cada grupo, pelo prazo, do mais
 * antigo ao mais novo. Assim as atrasadas e as próximas do prazo ficam no topo. O desempate fica com quem chama.
 */
export function compararAtividades(
  a: { prazo: string; status: StatusAtividade },
  b: { prazo: string; status: StatusAtividade },
): number {
  return Number(atividadeFechada(a.status)) - Number(atividadeFechada(b.status)) || a.prazo.localeCompare(b.prazo)
}
