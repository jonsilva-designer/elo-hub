'use client'

import { format } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import { useId, useState } from 'react'
// Locale do próprio react-day-picker: é o date-fns ptBR mais os textos de acessibilidade em português.
import { ptBR } from 'react-day-picker/locale'
import { Calendar } from '@/components/ui/calendar'
import { FieldError } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { dataExiste } from '@/lib/formato'
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
  if (!dataExiste(ano, mes, dia)) return null
  const d = new Date(ano, mes - 1, dia)
  d.setFullYear(ano) // anos abaixo de 100 não viram 19xx
  return d
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

const doisAlgarismos = (parte: string) => parte.padStart(2, '0')

function aplicarMascara(bruto: string): string {
  const texto = bruto.trim()
  // Data colada como AAAA-MM-DD: reescreve em dd/mm/aaaa.
  const colada = ISO.exec(texto)
  if (colada) return `${colada[3]}/${colada[2]}/${colada[1]}`
  // Com barras, a parte de um algarismo só que vem antes de uma barra ganha o zero: "10/5/2024" é 10/05/2024, e "1/"
  // vira "01/". Com as partes já de dois algarismos, segue a máscara de sempre, para o apagar atravessar a barra.
  const soDia = /^(\d)\/$/.exec(texto)
  if (soDia) return `0${soDia[1]}/`
  const comMes = /^(\d{1,2})\/(\d{1,2})\/(\d{0,4})$/.exec(texto)
  if (comMes && (comMes[1].length === 1 || comMes[2].length === 1)) {
    return `${doisAlgarismos(comMes[1])}/${doisAlgarismos(comMes[2])}/${comMes[3]}`
  }
  const d = texto.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`
}

/**
 * Campo de data com máscara `dd/mm/aaaa` e calendário. O valor é `AAAA-MM-DD`.
 * `onChange(null)` significa campo vazio ou data inválida (incompleta, inexistente ou fora de 1900 a 2100). A data
 * completa e inválida mostra o erro embaixo do campo, para não parecer campo vazio. Para limpar o que foi digitado
 * pela metade quando o valor já é null (o "Limpar filtros"), troque a `key` do campo.
 * Fora de um `Campo` (num filtro, por exemplo), o `prefixo` é o rótulo visível dentro do campo, e o `aria-label`
 * dá o nome: o campo fica na altura dos outros filtros, sem rótulo em cima.
 */
export function CampoData({
  valor,
  onChange,
  disabled,
  prefixo,
  ...props
}: {
  valor: string | null
  onChange: (valor: string | null) => void
  disabled?: boolean
  prefixo?: string
  'aria-label'?: string
} & Partial<AtributosDeCampo>) {
  const [texto, setTexto] = useState(isoParaBr(valor))
  const [anterior, setAnterior] = useState(valor)
  const [aberto, setAberto] = useState(false)
  const idDoErro = useId()

  // Valor trocado de fora (por exemplo, limpar o formulário): reescreve o texto.
  if (valor !== anterior) {
    setAnterior(valor)
    if (valor !== brParaIso(texto)) setTexto(isoParaBr(valor))
  }

  const selecionada = valor ? dataLocal(valor) : null
  const invalida = /^\d{2}\/\d{2}\/\d{4}$/.test(texto) && brParaIso(texto) === null
  const descricao = [props['aria-describedby'], invalida ? idDoErro : null].filter(Boolean).join(' ') || undefined

  return (
    <>
    <InputGroup>
      {prefixo ? (
        <InputGroupAddon>
          <InputGroupText>{prefixo}</InputGroupText>
        </InputGroupAddon>
      ) : null}
      <InputGroupInput
        {...props}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="dd/mm/aaaa"
        disabled={disabled}
        value={texto}
        aria-invalid={invalida || props['aria-invalid'] ? true : undefined}
        aria-describedby={descricao}
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
    {invalida ? <FieldError id={idDoErro}>Data inválida. Use dd/mm/aaaa, com ano de 1900 a 2100.</FieldError> : null}
    </>
  )
}
