'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

/**
 * Botão que parece desabilitado mas continua focável, para explicar o motivo
 * em uma dica. Usa aria-disabled e nunca o atributo disabled.
 * É de cliente porque cancela o clique com uma função. Nunca envia o formulário em volta.
 */
export function BotaoBloqueado({
  motivo,
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'disabled'> & { motivo: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          {...props}
          type="button"
          disabled={false}
          aria-disabled="true"
          onClick={(evento) => evento.preventDefault()}
        />
      </TooltipTrigger>
      <TooltipContent>{motivo}</TooltipContent>
    </Tooltip>
  )
}
