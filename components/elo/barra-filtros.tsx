'use client'

import { Download, Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

const ICONE = { size: 16, strokeWidth: 1.6, 'aria-hidden': true } as const

export function BarraFiltros({
  busca,
  aoBuscar,
  filtros,
  aoExportar,
}: {
  busca: string
  aoBuscar: (texto: string) => void
  filtros?: ReactNode
  aoExportar?: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <InputGroup className="w-full min-w-[14rem] flex-1 sm:w-auto">
        <InputGroupAddon>
          <Search {...ICONE} />
        </InputGroupAddon>
        <InputGroupInput
          value={busca}
          onChange={(e) => aoBuscar(e.target.value)}
          placeholder="Buscar"
          aria-label="Buscar"
        />
      </InputGroup>
      {filtros}
      {aoExportar ? (
        <Button variant="outline" onClick={aoExportar}>
          <Download {...ICONE} />
          Exportar
        </Button>
      ) : null}
    </div>
  )
}
