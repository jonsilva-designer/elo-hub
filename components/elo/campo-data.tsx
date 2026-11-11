'use client'

import { format } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import { useState } from 'react'
// Locale do próprio react-day-picker: é o date-fns ptBR mais os textos de acessibilidade em português.
import { ptBR } from 'react-day-picker/locale'
import { Calendar } from '@/components/ui/calendar'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { AtributosDeCampo } from './campo'

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * Data de calendário `AAAA-MM-DD` como Date local (meia-noite do próprio dia).
 * Nunca usa `new Date('AAAA-MM-DD')`, que é meia-noite UTC e mostra o dia anterior em Brasília.
 * Devolve null se o texto não for uma data que existe.
 */
export function dataLocal(texto: string): Date | null {
  const m = ISO.exec(texto)
  if (!m) return null
  const ano = Number(m[1])
  const mes = Number(m[2])
  const dia = Number(m[3])
  const d = new Date(ano, mes - 1, dia)
  d.setFullYear(ano) // anos abaixo de 100 não viram 19xx
  const existe = d.getFullYear() === ano && d.getMonth() === mes - 1 && d.getDate() === dia
  return existe ? d : null
}

/** Date local como `AAAA-MM-DD`, pelas partes locais (sem passar por UTC). */
export function textoDaData(d: Date): string {
  const ano = String(d.getFullYear()).padStart(4, '0')
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

function isoParaBr(iso: string | null): string {
  const m = iso ? ISO.exec(iso) : null
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ''
}

/** Texto `dd/mm/aaaa` completo e real vira `AAAA-MM-DD`; qualquer outro vira null. */
function brParaIso(texto: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto)
  if (!m) return null
  const iso = `${m[3]}-${m[2]}-${m[1]}`
  const ano = Number(m[3])
  if (ano < 1900 || ano > 2100) return null
  return dataLocal(iso) ? iso : null
}

function aplicarMascara(bruto: string): string {
  // Data colada como AAAA-MM-DD: reescreve em dd/mm/aaaa.
  const colada = ISO.exec(bruto.trim())
  if (colada) return `${colada[3]}/${colada[2]}/${colada[1]}`
  const d = bruto.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`
}

/**
 * Campo de data com máscara `dd/mm/aaaa` e calendário. O valor é `AAAA-MM-DD`.
 * `onChange(null)` significa campo vazio ou data inválida (incompleta, inexistente ou fora de 1900 a 2100).
 */
export function CampoData({
  valor,
  onChange,
  disabled,
  ...props
}: {
  valor: string | null
  onChange: (valor: string | null) => void
  disabled?: boolean
} & AtributosDeCampo) {
  const [texto, setTexto] = useState(isoParaBr(valor))
  const [anterior, setAnterior] = useState(valor)
  const [aberto, setAberto] = useState(false)

  // Valor trocado de fora (por exemplo, limpar o formulário): reescreve o texto.
  if (valor !== anterior) {
    setAnterior(valor)
    if (valor !== brParaIso(texto)) setTexto(isoParaBr(valor))
  }

  const selecionada = valor ? dataLocal(valor) : null

  return (
    <InputGroup>
      <InputGroupInput
        {...props}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="dd/mm/aaaa"
        disabled={disabled}
        value={texto}
        className="font-mono tabular-nums"
        onChange={(e) => {
          const novo = aplicarMascara(e.target.value)
          setTexto(novo)
          onChange(brParaIso(novo))
        }}
      />
      <InputGroupAddon align="inline-end">
        <Popover open={aberto} onOpenChange={setAberto}>
          <PopoverTrigger asChild>
            <InputGroupButton size="icon-xs" aria-label="Abrir calendário" disabled={disabled}>
              <CalendarDays aria-hidden="true" />
            </InputGroupButton>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-0">
            <Calendar
              mode="single"
              locale={ptBR}
              formatters={{ formatCaption: (mes) => format(mes, "LLLL 'de' y", { locale: ptBR }) }}
              selected={selecionada ?? undefined}
              defaultMonth={selecionada ?? undefined}
              onSelect={(d) => {
                if (!d) return
                const iso = textoDaData(d)
                setTexto(isoParaBr(iso))
                setAnterior(iso)
                onChange(iso)
                setAberto(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </InputGroupAddon>
    </InputGroup>
  )
}
