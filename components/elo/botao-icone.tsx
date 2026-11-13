import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

/** Botão só de ícone: nome acessível e dica com o mesmo rótulo. */
export function BotaoIcone({
  rotulo,
  icone: Icone,
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'children'> & {
  rotulo: string
  icone: LucideIcon
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="icon" variant="ghost" aria-label={rotulo} {...props}>
          <Icone aria-hidden="true" size={16} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{rotulo}</TooltipContent>
    </Tooltip>
  )
}
