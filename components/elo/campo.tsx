'use client'

import { useId, type ReactNode } from 'react'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'

/** Atributos que o `Campo` entrega ao controle de dentro. */
export type AtributosDeCampo = {
  id: string
  /** Só no modo `grupo`: aponta para a legenda, que dá o nome ao grupo de opções. */
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: true
}

/**
 * Rótulo, controle, ajuda e erro de um campo de formulário.
 * O controle recebe o id e os atributos de acessibilidade por função filha.
 * O erro aparece abaixo do campo, em vermelho, e nunca só pela cor (padrão 7).
 *
 * `horizontal`: para caixa de seleção, com o controle antes e o texto ao lado (um só rótulo).
 * `grupo`: para um conjunto de opções, com o rótulo como legenda de um `fieldset`. O controle recebe
 * o `aria-labelledby` da legenda junto com os outros atributos: basta espalhá-los.
 */
export function Campo({
  rotulo,
  ajuda,
  erro,
  obrigatorio,
  horizontal,
  grupo,
  children,
}: {
  rotulo: string
  ajuda?: string
  erro?: string
  obrigatorio?: boolean
  horizontal?: boolean
  grupo?: boolean
  children: (props: AtributosDeCampo) => ReactNode
}) {
  const id = useId()
  const idAjuda = `${id}-ajuda`
  const idErro = `${id}-erro`
  const descritoPor = [ajuda ? idAjuda : null, erro ? idErro : null].filter(Boolean).join(' ')

  const props: AtributosDeCampo = { id }
  if (descritoPor) props['aria-describedby'] = descritoPor
  if (erro) props['aria-invalid'] = true

  const textoDoRotulo = (
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
  )
  const classeDoRotulo = 'text-secundario font-medium text-foreground'

  const ajudaEErro = (
    <>
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
    </>
  )

  if (grupo) {
    const idDaLegenda = `${id}-rotulo`
    return (
      <FieldSet className="gap-2">
        <FieldLegend id={idDaLegenda} variant="label" className={`mb-0 ${classeDoRotulo}`}>
          {textoDoRotulo}
        </FieldLegend>
        {children({ ...props, 'aria-labelledby': idDaLegenda })}
        {ajudaEErro}
      </FieldSet>
    )
  }

  if (horizontal) {
    return (
      <Field orientation="horizontal" className="items-start">
        {children(props)}
        <FieldContent>
          <FieldLabel id={`${id}-rotulo`} htmlFor={id} className="text-secundario font-normal text-foreground">
            {textoDoRotulo}
          </FieldLabel>
          {ajudaEErro}
        </FieldContent>
      </Field>
    )
  }

  return (
    <Field>
      <FieldLabel id={`${id}-rotulo`} htmlFor={id} className={classeDoRotulo}>
        {textoDoRotulo}
      </FieldLabel>
      {children(props)}
      {ajudaEErro}
    </Field>
  )
}
