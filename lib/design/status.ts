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

const POR_TOM: Record<Exclude<TomDeStatus, "neutro">, string[]> = {
  "em-curso": ["Em contratação", "Em andamento", "Em triagem", "Em atendimento", "Aberto"],
  atencao: ["Em espera", "Aguardando retorno", "Próximo do vencimento"],
  suspenso: ["Suspenso"],
  concluido: ["Ativo", "Vigente", "Concluído", "Concluída", "Resolvida"],
  problema: ["Vencido"],
  fechado: ["Inativo", "Encerrado", "Encerrada", "Cancelado", "Cancelada"],
};

const normalizar = (s: string) => s.trim().toLocaleLowerCase("pt-BR");

const TOM_POR_STATUS = new Map<string, TomDeStatus>(
  (Object.entries(POR_TOM) as [TomDeStatus, string[]][]).flatMap(([tom, lista]) =>
    lista.map((s) => [normalizar(s), tom] as const),
  ),
);

/** Status desconhecido ou escrito diferente cai em `neutro`, sem erro. */
export function tomDoStatus(status: string): TomDeStatus {
  return TOM_POR_STATUS.get(normalizar(status)) ?? "neutro";
}
