// Parâmetros iniciais (Apêndice C). O Administrador os altera na tela de configurações da parte 8 (DF-81).

/** Dias de antecedência do alerta de vencimento do contrato (DF-34). */
export const DIAS_DO_ALERTA = 30

/** Dias antes do prazo em que a atividade fica "próxima do prazo" (DF-72, RN-10). */
export const DIAS_PROXIMO_DO_PRAZO = 5

/** Referência de prazo da demanda por criticidade, em dias: começa vazia, a ELO define (DF-22, Apêndice C). */
export const REFERENCIAS_DE_PRAZO: Partial<Record<'Baixa' | 'Moderada' | 'Alta' | 'Crítica', number>> = {}

/** Início oficial da operação: não registrado (DF-46, Apêndice C). Até ele, o e-mail da nova demanda não sai. */
export const INICIO_DA_OPERACAO: string | null = null

/** O remetente de cada finalidade, do domínio da ELO (DF-21). Os e-mails de acesso usam o padrão e não entram aqui. */
export const REMETENTES = {
  notificacaoDemanda: 'atendimento@elogovernance.com.br',
  avisosDoSite: 'atendimento@elogovernance.com.br',
}
