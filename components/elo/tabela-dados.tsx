'use client'

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Num } from '@/components/elo/num'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

export type Coluna<T> = {
  id: string
  titulo: string
  celula: (linha: T) => ReactNode
  ordenarPor?: (linha: T) => string | number
  alinhar?: 'esquerda' | 'direita'
}

type Destaque = 'atencao' | 'problema'

// Uma classe estática por valor: o Tailwind só gera o que lê escrito por inteiro.
// A barra de 3px é uma sombra interna na primeira célula, porque borda em `tr` não pinta com bordas coladas.
const CLASSE_DESTAQUE: Record<Destaque, string> = {
  atencao: '[&>td:first-child]:shadow-[inset_3px_0_0_var(--elo-status-atencao)]',
  problema: '[&>td:first-child]:shadow-[inset_3px_0_0_var(--elo-status-problema)]',
}

const ICONE = { size: 16, strokeWidth: 1.6, 'aria-hidden': true } as const

type Ordem = { coluna: string; sentido: 'ascending' | 'descending' }

function comparar(a: string | number, b: string | number) {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), 'pt-BR', { sensitivity: 'base' })
}

export function TabelaDados<T>({
  colunas,
  linhas,
  chave,
  aoClicarLinha,
  destaque,
  porPagina = 20,
  vazio,
}: {
  colunas: Coluna<T>[]
  linhas: T[]
  chave: (linha: T) => string
  aoClicarLinha?: (linha: T) => void
  destaque?: (linha: T) => Destaque | null
  porPagina?: number
  vazio: ReactNode
}) {
  const [ordem, setOrdem] = useState<Ordem | null>(null)
  const [pagina, setPagina] = useState(1)
  // Mudou a quantidade de linhas (por exemplo, depois de filtrar): volta à primeira página.
  const [totalAnterior, setTotalAnterior] = useState(linhas.length)
  if (totalAnterior !== linhas.length) {
    setTotalAnterior(linhas.length)
    setPagina(1)
  }

  const ordenadas = useMemo(() => {
    const coluna = ordem ? colunas.find((c) => c.id === ordem.coluna) : undefined
    if (!ordem || !coluna?.ordenarPor) return linhas
    const valor = coluna.ordenarPor
    const fator = ordem.sentido === 'ascending' ? 1 : -1
    return [...linhas].sort((a, b) => fator * comparar(valor(a), valor(b)))
  }, [linhas, colunas, ordem])

  if (linhas.length === 0) return <>{vazio}</>

  const totalPaginas = Math.max(1, Math.ceil(ordenadas.length / porPagina))
  const atual = Math.min(pagina, totalPaginas)
  const visiveis = ordenadas.slice((atual - 1) * porPagina, atual * porPagina)

  function ordenar(id: string) {
    setOrdem((o) =>
      o?.coluna === id && o.sentido === 'ascending'
        ? { coluna: id, sentido: 'descending' }
        : { coluna: id, sentido: 'ascending' },
    )
    setPagina(1)
  }

  function aoTeclar(e: KeyboardEvent<HTMLTableRowElement>, linha: T) {
    if (e.target !== e.currentTarget) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault() // O espaço não deve rolar a página.
      aoClicarLinha?.(linha)
    }
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            {colunas.map((c) => {
              const direita = c.alinhar === 'direita'
              const sentido = ordem?.coluna === c.id ? ordem.sentido : undefined
              const Seta = sentido === 'ascending' ? ArrowUp : sentido === 'descending' ? ArrowDown : ArrowUpDown
              return (
                <TableHead key={c.id} aria-sort={sentido} className={direita ? 'text-right' : undefined}>
                  {c.ordenarPor ? (
                    <button
                      type="button"
                      aria-label={`Ordenar por ${c.titulo}`}
                      onClick={() => ordenar(c.id)}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-sm font-semibold hover:text-foreground',
                        direita && 'flex-row-reverse',
                      )}
                    >
                      {c.titulo}
                      <Seta {...ICONE} className={sentido ? undefined : 'opacity-60'} />
                    </button>
                  ) : (
                    c.titulo
                  )}
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {visiveis.map((linha) => {
            const marca = destaque?.(linha) ?? null
            return (
              <TableRow
                key={chave(linha)}
                data-destaque={marca ?? undefined}
                tabIndex={aoClicarLinha ? 0 : undefined}
                onClick={aoClicarLinha ? () => aoClicarLinha(linha) : undefined}
                onKeyDown={aoClicarLinha ? (e) => aoTeclar(e, linha) : undefined}
                className={cn(
                  aoClicarLinha && 'cursor-pointer hover:bg-[var(--elo-papel)]',
                  marca && CLASSE_DESTAQUE[marca],
                )}
              >
                {colunas.map((c) => (
                  <TableCell key={c.id} className={c.alinhar === 'direita' ? 'text-right' : undefined}>
                    {c.celula(linha)}
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      {totalPaginas > 1 ? (
        <nav
          aria-label="Paginação"
          className="flex items-center justify-between gap-3 border-t border-[color:var(--elo-divisoria)] px-4 py-2.5"
        >
          <span className="text-xs text-muted-foreground">
            Página <Num>{atual}</Num> de <Num>{totalPaginas}</Num>
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled={atual <= 1} onClick={() => setPagina(atual - 1)}>
              Página anterior
            </Button>
            <Button variant="outline" disabled={atual >= totalPaginas} onClick={() => setPagina(atual + 1)}>
              Próxima página
            </Button>
          </div>
        </nav>
      ) : null}
    </div>
  )
}
