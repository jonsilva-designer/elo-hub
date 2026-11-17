export type TomDeStatus =
  | "neutro"
  | "em-curso"
  | "atencao"
  | "suspenso"
  | "concluido"
  | "problema"
  | "fechado";

export type Criticidade = "Baixa" | "Moderada" | "Alta" | "Crítica";
export type Prioridade = "Baixa" | "Média" | "Alta";

/** Status de cada tom (padrão visual 4.6). Fonte única: a página /designsystem lê daqui. */
export const STATUS_POR_TOM: Readonly<Record<TomDeStatus, readonly string[]>> = {
  neutro: ["Prospect", "Proposta", "Planejado", "Não iniciada", "Nova", "Em análise", "Em elaboração", "Não aplicável", "Superado", "Inconclusivo"],
  "em-curso": ["Em contratação", "Em andamento", "Em triagem", "Em atendimento", "Aberto"],
  atencao: ["Em espera", "Aguardando retorno", "Próximo do vencimento", "Pronto com condições", "Próxima do prazo"],
  suspenso: ["Suspenso"],
  concluido: ["Ativo", "Vigente", "Concluído", "Concluída", "Resolvida", "Pronto"],
  problema: ["Vencido", "Não pronto no momento", "Atrasada"],
  fechado: ["Inativo", "Encerrado", "Encerrada", "Cancelado", "Cancelada"],
};

const normalizar = (s: string) => s.trim().toLocaleLowerCase("pt-BR");

const TOM_POR_STATUS = new Map<string, TomDeStatus>(
  (Object.entries(STATUS_POR_TOM) as [TomDeStatus, readonly string[]][]).flatMap(([tom, lista]) =>
    lista.map((s) => [normalizar(s), tom] as const),
  ),
);

/** Status desconhecido ou escrito diferente cai em `neutro`, sem erro. */
export function tomDoStatus(status: string): TomDeStatus {
  return TOM_POR_STATUS.get(normalizar(status)) ?? "neutro";
}
