'use client'

import { useState } from 'react'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import type { AtributosDeCampo } from './campo'

const doisDecimais = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Texto no formato brasileiro (`1.234,5`) como número. Vazio ou inválido vira null. */
function lerValor(texto: string): number | null {
  const limpo = texto.trim()
  if (!limpo) return null
  if ((limpo.match(/,/g) ?? []).length > 1) return null
  const n = Number(limpo.replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function formatar(valor: number | null): string {
  return valor === null ? '' : doisDecimais.format(valor)
}

/** Campo de valor em reais. Aceita o formato brasileiro e formata com duas casas ao sair. */
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
  const [texto, setTexto] = useState(formatar(valor))
  const [anterior, setAnterior] = useState(valor)

  // Valor trocado de fora: reescreve o texto, a menos que ele já represente esse valor.
  if (valor !== anterior) {
    setAnterior(valor)
    if (valor !== lerValor(texto)) setTexto(formatar(valor))
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
        placeholder="0,00"
        disabled={disabled}
        value={texto}
        className="font-mono tabular-nums"
        onChange={(e) => {
          const novo = e.target.value.replace(/[^\d.,]/g, '')
          setTexto(novo)
          onChange(lerValor(novo))
        }}
        onBlur={() => {
          const n = lerValor(texto)
          if (n !== null) setTexto(formatar(n))
        }}
      />
    </InputGroup>
  )
}
