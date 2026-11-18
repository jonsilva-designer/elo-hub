'use client'

import { useRouter } from 'next/navigation'
import { Num } from '@/components/elo/num'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const TODOS = 'todos'

/** O filtro da Visão Executiva por um contrato do cliente (CA-14.6). A escolha vai para o endereço, e a página relê. */
export function FiltroContrato({
  clienteId,
  contratoId,
  contratos,
}: {
  clienteId: string
  contratoId: string | null
  contratos: { id: string; codigo: string; contratante: string }[]
}) {
  const router = useRouter()
  const base = `/clientes/${clienteId}/visao-executiva`
  return (
    <Select
      value={contratoId ?? TODOS}
      onValueChange={(v) => router.push(v === TODOS ? base : `${base}?contrato=${encodeURIComponent(v)}`)}
    >
      <SelectTrigger aria-label="Contrato" className="w-full sm:w-64">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={TODOS}>Todos os contratos</SelectItem>
        {contratos.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            <Num>{c.codigo}</Num> · {c.contratante}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
