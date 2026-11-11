import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

/**
 * Botão que parece desabilitado mas continua focável, para explicar o motivo
 * em uma dica. Usa aria-disabled e nunca o atributo disabled.
 */
export function BotaoBloqueado({
  motivo,
  ...props
}: React.ComponentProps<typeof Button> & { motivo: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          {...props}
          aria-disabled="true"
          onClick={(evento) => evento.preventDefault()}
        />
      </TooltipTrigger>
      <TooltipContent>{motivo}</TooltipContent>
    </Tooltip>
  )
}
