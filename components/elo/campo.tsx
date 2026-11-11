'use client'

import { useId, type ReactNode } from 'react'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'

/** Atributos que o `Campo` entrega ao controle de dentro. */
export type AtributosDeCampo = {
  id: string
  'aria-describedby'?: string
  'aria-invalid'?: true
}

/**
 * Rótulo, controle, ajuda e erro de um campo de formulário.
 * O controle recebe o id e os atributos de acessibilidade por função filha.
 * O erro aparece abaixo do campo, em vermelho, e nunca só pela cor (padrão 7).
 */
export function Campo({
  rotulo,
  ajuda,
  erro,
  obrigatorio,
  children,
}: {
  rotulo: string
  ajuda?: string
  erro?: string
  obrigatorio?: boolean
  children: (props: AtributosDeCampo) => ReactNode
}) {
  const id = useId()
  const idAjuda = `${id}-ajuda`
  const idErro = `${id}-erro`
  const descritoPor = [ajuda ? idAjuda : null, erro ? idErro : null].filter(Boolean).join(' ')

  const props: AtributosDeCampo = { id }
  if (descritoPor) props['aria-describedby'] = descritoPor
  if (erro) props['aria-invalid'] = true

  return (
    <Field>
      <FieldLabel id={`${id}-rotulo`} htmlFor={id} className="text-[13px] font-medium text-foreground">
        <span>
          {rotulo}
          {obrigatorio ? (
            <>
              {' '}
              <span aria-hidden="true" className="text-destructive">
                *
              </span>
              <span className="sr-only">(obrigatório)</span>
            </>
          ) : null}
        </span>
      </FieldLabel>
      {children(props)}
      {ajuda ? (
        <FieldDescription id={idAjuda} className="text-xs">
          {ajuda}
        </FieldDescription>
      ) : null}
      {erro ? (
        <FieldError id={idErro} className="text-xs">
          {erro}
        </FieldError>
      ) : null}
    </Field>
  )
}
