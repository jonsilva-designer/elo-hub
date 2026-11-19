'use client'

import { Download, Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

/**
 * Barra das listas (revisão do Jonathan, 19/11/2026): na primeira linha, a busca à esquerda e Exportar à direita; os
 * filtros vêm abaixo, num contêiner próprio que quebra linha sem empurrar o botão.
 */
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
    <div className="space-y-3">
      <div data-linha-busca className="flex items-center gap-3">
        <InputGroup className="w-full max-w-md">
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
        {aoExportar ? (
          <Button type="button" variant="outline" className="ml-auto shrink-0" onClick={aoExportar}>
            <Download aria-hidden="true" />
            Exportar
          </Button>
        ) : null}
      </div>
      {filtros ? (
        <div role="group" aria-label="Filtros" className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
          {filtros}
        </div>
      ) : null}
    </div>
  )
}
