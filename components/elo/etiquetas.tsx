import { cn } from "@/lib/utils";
import {
  tomDoStatus,
  type Criticidade,
  type Prioridade,
  type TomDeStatus,
} from "@/lib/design/status";

const BASE = "inline-flex items-center border rounded-sm px-1.5 py-0.5 text-xs font-medium whitespace-nowrap";

const PONTO_POR_TOM: Record<Exclude<TomDeStatus, "suspenso">, string> = {
  neutro: "bg-[var(--elo-status-neutro)]",
  "em-curso": "bg-[var(--elo-status-em-curso)]",
  atencao: "bg-[var(--elo-status-atencao)]",
  concluido: "bg-[var(--elo-status-concluido)]",
  problema: "bg-[var(--elo-status-problema)]",
  fechado: "bg-[var(--elo-status-fechado)]",
};

const TEXTO_POR_TOM: Record<TomDeStatus, string> = {
  neutro: "text-foreground",
  "em-curso": "text-foreground",
  atencao: "text-foreground",
  suspenso: "text-[var(--elo-status-suspenso-texto)]",
  concluido: "text-foreground",
  problema: "text-foreground",
  fechado: "text-[var(--elo-texto-secundario)]",
};

export function EtiquetaStatus({ status }: { status: string }) {
  const tom = tomDoStatus(status);
  return (
    <span
      data-tom={tom}
      className={cn(
        BASE,
        "gap-1.5 border-border bg-[var(--elo-branco)]",
        TEXTO_POR_TOM[tom],
      )}
    >
      {tom === "suspenso" ? (
        <span
          aria-hidden="true"
          data-vazado="true"
          className="size-1.5 shrink-0 rounded-full border border-[var(--elo-status-atencao)]"
        />
      ) : (
        <span
          aria-hidden="true"
          className={cn("size-1.5 shrink-0 rounded-full", PONTO_POR_TOM[tom])}
        />
      )}
      {status}
    </span>
  );
}

const CRITICIDADE: Record<Criticidade, string> = {
  Crítica: "border-transparent bg-[var(--elo-crit-critica-fundo)] text-[var(--elo-crit-critica-texto)]",
  Alta: "border-transparent bg-[var(--elo-crit-alta-fundo)] text-[var(--elo-crit-alta-texto)]",
  Moderada: "border-transparent bg-[var(--elo-crit-moderada-fundo)] text-[var(--elo-crit-moderada-texto)]",
  Baixa: "border-transparent bg-[var(--elo-crit-baixa-fundo)] text-[var(--elo-crit-baixa-texto)]",
};

export function EtiquetaCriticidade({ criticidade }: { criticidade: Criticidade }) {
  return (
    <span data-criticidade={criticidade} className={cn(BASE, CRITICIDADE[criticidade])}>
      {criticidade}
    </span>
  );
}

export function EtiquetaPlanejamento() {
  return (
    <span
      className={cn(
        BASE,
        "border-dashed border-[var(--elo-azul-marinho)] bg-[var(--elo-branco)] text-[var(--elo-azul-marinho)]",
      )}
    >
      Planejamento
    </span>
  );
}

const BARRAS = [
  { altura: "h-1.5", cheia: 1 },
  { altura: "h-[9px]", cheia: 2 },
  { altura: "h-3", cheia: 3 },
] as const;

const NIVEL: Record<Prioridade, number> = { Baixa: 1, Média: 2, Alta: 3 };

export function IndicadorPrioridade({ prioridade }: { prioridade: Prioridade }) {
  const nivel = NIVEL[prioridade];
  return (
    <span
      role="img"
      aria-label={`Prioridade ${prioridade}`}
      className="inline-flex items-center gap-1.5 text-xs whitespace-nowrap"
    >
      <span className="inline-flex items-end gap-0.5">
        {BARRAS.map((b) => {
          const preenchida = b.cheia <= nivel;
          return (
            <span
              key={b.cheia}
              aria-hidden="true"
              {...(preenchida ? { "data-preenchida": "true" } : {})}
              className={cn(
                "w-[3px] rounded-sm",
                b.altura,
                preenchida ? "bg-[var(--elo-azul-marinho)]" : "bg-[var(--elo-borda)]",
              )}
            />
          );
        })}
      </span>
      {prioridade}
    </span>
  );
}
