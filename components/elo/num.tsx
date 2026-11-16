import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Num({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn("font-mono tabular-nums", className)}>{children}</span>;
}

/**
 * Um número no meio de um texto pronto: datas ("05/12/2026"), horas, valores e códigos inteiros com o prefixo
 * ("CT-2025-031", "ELO-2026-0001"). Termina sempre num algarismo, para o ponto final ficar fora.
 */
const NUMERO_NO_TEXTO = /((?:[A-Z]{2,}-)?\d(?:[\d/.,:-]*\d)?)/;

/**
 * Texto pronto, vindo dos dados ou do servidor, com cada número em <Num> (padrão visual: JetBrains Mono em todos
 * os números, inclusive no meio do texto). As palavras em volta ficam na fonte do texto.
 */
export function ComNumeros({ texto }: { texto: string }) {
  const partes = texto.split(NUMERO_NO_TEXTO);
  if (partes.length === 1) return <>{texto}</>;
  return <>{partes.map((parte, i) => (i % 2 === 1 ? <Num key={i}>{parte}</Num> : parte))}</>;
}
