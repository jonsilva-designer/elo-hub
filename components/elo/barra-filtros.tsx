'use client'

import { Download, Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

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
          <Search aria-hidden="true" />
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
        <Button type="button" variant="outline" onClick={aoExportar}>
          <Download aria-hidden="true" />
          Exportar
        </Button>
      ) : null}
    </div>
  )
}
