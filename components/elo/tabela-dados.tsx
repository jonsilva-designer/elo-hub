'use client'

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { useMemo, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { Num } from '@/components/elo/num'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

export type Coluna<T> = {
  id: string
  titulo: string
  celula: (linha: T) => ReactNode
  /**
   * Valor usado para ordenar a coluna. Texto compara em pt-BR e número compara como número.
   * `undefined`, `null`, texto vazio e `NaN` ficam sempre por último, nos dois sentidos.
   */
  ordenarPor?: (linha: T) => string | number | null | undefined
  alinhar?: 'esquerda' | 'direita'
}

type Destaque = 'atencao' | 'problema'

// Uma classe estática por valor: o Tailwind só gera o que lê escrito por inteiro.
// A barra de 3px é uma sombra interna na primeira célula, porque borda em `tr` não pinta com bordas coladas.
const CLASSE_DESTAQUE: Record<Destaque, string> = {
  atencao: '[&>td:first-child]:shadow-[inset_3px_0_0_var(--elo-status-atencao)]',
  problema: '[&>td:first-child]:shadow-[inset_3px_0_0_var(--elo-status-problema)]',
}

type Ordem = { coluna: string; sentido: 'ascending' | 'descending' }

type Valor = string | number | null | undefined

function ausente(v: Valor) {
  return v === null || v === undefined || v === '' || (typeof v === 'number' && Number.isNaN(v))
}

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
  // Mudou o conjunto de linhas (por exemplo, depois de filtrar): volta à primeira página.
  // A assinatura usa as chaves, e não a identidade do array, para não zerar a página a cada render do pai.
  const assinatura = linhas.map(chave).join('\u0000')
  const [assinaturaAnterior, setAssinaturaAnterior] = useState(assinatura)
  if (assinaturaAnterior !== assinatura) {
    setAssinaturaAnterior(assinatura)
    setPagina(1)
  }

  const ordenadas = useMemo(() => {
    const coluna = ordem ? colunas.find((c) => c.id === ordem.coluna) : undefined
    if (!ordem || !coluna?.ordenarPor) return linhas
    const valor = coluna.ordenarPor
    const fator = ordem.sentido === 'ascending' ? 1 : -1
    return [...linhas].sort((a, b) => {
      const va = valor(a)
      const vb = valor(b)
      if (ausente(va) || ausente(vb)) return Number(ausente(va)) - Number(ausente(vb))
      return fator * comparar(va as string | number, vb as string | number)
    })
  }, [linhas, colunas, ordem])

  if (linhas.length === 0) return <>{vazio}</>

  const totalPaginas = Math.max(1, Math.ceil(ordenadas.length / porPagina))
  const atual = Math.min(pagina, totalPaginas)
  const visiveis = ordenadas.slice((atual - 1) * porPagina, atual * porPagina)
  const primeira = atual <= 1
  const ultima = atual >= totalPaginas

  function ordenar(id: string) {
    setOrdem((o) =>
      o?.coluna === id && o.sentido === 'ascending'
        ? { coluna: id, sentido: 'descending' }
        : { coluna: id, sentido: 'ascending' },
    )
    setPagina(1)
  }

  function aoClicar(e: MouseEvent<HTMLTableRowElement>, linha: T) {
    // Cliques que vêm de botões, links e campos dentro da célula não abrem a linha.
    const controle = (e.target as HTMLElement).closest('a,button,input,select,textarea,[role=button]')
    if (controle && e.currentTarget.contains(controle)) return
    aoClicarLinha?.(linha)
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
                    // Sem aria-label: o nome do botão vira o nome do cabeçalho, que o leitor de tela repete
                    // em cada célula. O título basta; o aria-sort do th diz a ordem.
                    <button
                      type="button"
                      onClick={() => ordenar(c.id)}
                      className="inline-flex items-center gap-1 rounded-sm align-middle font-semibold leading-4 hover:text-foreground"
                    >
                      {c.titulo}
                      <Seta size={16} aria-hidden="true" className={sentido ? undefined : 'opacity-60'} />
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
                onClick={aoClicarLinha ? (e) => aoClicar(e, linha) : undefined}
                onKeyDown={aoClicarLinha ? (e) => aoTeclar(e, linha) : undefined}
                className={cn(
                  aoClicarLinha && 'cursor-pointer hover:bg-papel',
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
          className="flex flex-wrap items-center justify-between gap-2 border-t border-divisoria px-4 py-2.5"
        >
          {/* Região viva: o leitor de tela anuncia a página nova depois do clique. */}
          <span aria-live="polite" aria-atomic="true" className="text-xs whitespace-nowrap text-muted-foreground">
            Página <Num>{atual}</Num> de <Num>{totalPaginas}</Num>
          </span>
          {/* aria-disabled em vez de disabled: na primeira e na última página o botão continua focável,
              e o foco não cai para o body ao chegar ao fim. O clique é ignorado pela guarda. */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              aria-disabled={primeira || undefined}
              onClick={() => {
                if (!primeira) setPagina(atual - 1)
              }}
            >
              Página anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              aria-disabled={ultima || undefined}
              onClick={() => {
                if (!ultima) setPagina(atual + 1)
              }}
            >
              Próxima página
            </Button>
          </div>
        </nav>
      ) : null}
    </div>
  )
}
