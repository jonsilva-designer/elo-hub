'use client'

import { useState, type ComponentProps } from 'react'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'

/**
 * Campo de senha com o botão Mostrar e Ocultar, que só troca o tipo do campo.
 * Recebe do `Campo` o id e os atributos de acessibilidade, como o `Input`.
 */
export function EntradaSenha({ id, className, ...props }: Omit<ComponentProps<'input'>, 'type'>) {
  const [visivel, setVisivel] = useState(false)
  return (
    <InputGroup className={className}>
      <InputGroupInput
        id={id}
        type={visivel ? 'text' : 'password'}
        autoCapitalize="none"
        spellCheck={false}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
          aria-controls={id}
          onClick={() => setVisivel((v) => !v)}
        >
          {visivel ? 'Ocultar' : 'Mostrar'}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
