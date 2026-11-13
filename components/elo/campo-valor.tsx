'use client'

import { useState } from 'react'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import { escreverValorEmReais, lerValorEmReais } from '@/lib/formato'
import type { AtributosDeCampo } from './campo'

/**
 * Campo de valor em reais. Aceita o formato brasileiro e formata com duas casas ao sair.
 * O número entregue já vem arredondado a centavos, igual ao que o campo mostra.
 */
export function CampoValor({
  valor,
  onChange,
  disabled,
  ...props
}: {
  valor: number | null
  onChange: (valor: number | null) => void
  disabled?: boolean
} & AtributosDeCampo) {
  const [texto, setTexto] = useState(escreverValorEmReais(valor))
  const [anterior, setAnterior] = useState(valor)

  // Valor trocado de fora: reescreve o texto, a menos que ele já represente esse valor.
  if (valor !== anterior) {
    setAnterior(valor)
    if (valor !== lerValorEmReais(texto)) setTexto(escreverValorEmReais(valor))
  }

  return (
    <InputGroup>
      <InputGroupAddon align="inline-start">
        <InputGroupText className="font-mono">R$</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        {...props}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        disabled={disabled}
        value={texto}
        className="font-mono tabular-nums"
        onChange={(e) => {
          const novo = e.target.value.replace(/[^\d.,]/g, '')
          setTexto(novo)
          onChange(lerValorEmReais(novo))
        }}
        onBlur={() => {
          const n = lerValorEmReais(texto)
          if (n !== null) setTexto(escreverValorEmReais(n))
        }}
      />
    </InputGroup>
  )
}
