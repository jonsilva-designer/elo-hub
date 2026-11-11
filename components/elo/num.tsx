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
