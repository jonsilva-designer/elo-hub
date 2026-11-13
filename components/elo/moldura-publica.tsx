import Image from 'next/image'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Moldura das telas públicas, fora do menu: fundo papel, logo centralizado e um cartão.
 * `className` ajusta a moldura de fora, por exemplo `min-h-0` para caber num quadro reduzido.
 */
export function MolduraPublica({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-4 py-10',
        className,
      )}
    >
      <Image
        src="/marca/logo-elo.png"
        alt="ELO HUB"
        width={814}
        height={627}
        priority
        className="h-16 w-auto"
      />
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 sm:p-8">
        {children}
      </div>
    </div>
  )
}
