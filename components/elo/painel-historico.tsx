import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import type { EntradaHistorico } from '@/lib/dados/tipos'
import { formatarData, formatarDataHora } from '@/lib/formato'

// Histórico só de leitura (F17, DF-16): sem filtro, busca nem exportação. Na Etapa 3, o banco grava
// cada alteração sozinho (arquitetura 4.4); a tela continua a mesma.

const pelaData = (a: EntradaHistorico, b: EntradaHistorico) => Date.parse(a.dataHora) - Date.parse(b.dataHora)

function mudanca(e: EntradaHistorico): string | null {
  if (e.valorAnterior !== undefined && e.valorNovo !== undefined) return `De ${e.valorAnterior} para ${e.valorNovo}`
  if (e.valorNovo !== undefined) return e.valorNovo
  if (e.valorAnterior !== undefined) return `Antes: ${e.valorAnterior}`
  return null
}

/** Painel "Histórico", da alteração mais recente para a mais antiga, com o valor anterior e o novo. */
export function PainelHistorico({ entradas }: { entradas: EntradaHistorico[] }) {
  const ordenadas = [...entradas].sort(pelaData).reverse()
  return (
    <Painel titulo="Histórico">
      {ordenadas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma alteração registrada.</p>
      ) : (
        <ol className="space-y-4">
          {ordenadas.map((e) => {
            const valor = mudanca(e)
            return (
              <li key={e.id} className="space-y-0.5">
                <p data-slot="descricao" className="text-sm font-medium text-foreground">
                  {e.descricao}
                </p>
                {valor ? <p className="text-sm text-foreground">{valor}</p> : null}
                <p className="text-secundario text-muted-foreground">
                  <Num>{formatarDataHora(e.dataHora)}</Num> · {e.usuario}
                </p>
              </li>
            )
          })}
        </ol>
      )}
    </Painel>
  )
}

/** "Criado por … em … · Última alteração por … em …" (CA-17.1), tirada do histórico do registro. */
export function LinhaAutoria({ entradas }: { entradas: EntradaHistorico[] }) {
  if (entradas.length === 0) return null
  const ordenadas = [...entradas].sort(pelaData)
  const criacao = ordenadas[0]
  const ultima = ordenadas[ordenadas.length - 1]
  return (
    <p className="text-xs text-muted-foreground">
      Criado por {criacao.usuario} em <Num>{formatarData(criacao.dataHora)}</Num>
      {ultima !== criacao ? (
        <>
          {' · '}Última alteração por {ultima.usuario} em <Num>{formatarData(ultima.dataHora)}</Num>
        </>
      ) : null}
    </p>
  )
}
