import { ComNumeros, Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import type { EntradaHistorico } from '@/lib/dados/tipos'
import { formatarData, formatarDataHora } from '@/lib/formato'

// Histórico só de leitura (F17, DF-16): sem filtro, busca nem exportação. Na Etapa 3, o banco grava
// cada alteração sozinho (arquitetura 4.4); a tela continua a mesma.

const instante = (e: EntradaHistorico) => {
  const t = Date.parse(e.dataHora)
  return Number.isNaN(t) ? Number.NEGATIVE_INFINITY : t
}

/** Da mais recente para a mais antiga. No mesmo instante, fica a ordem do registro (o sort é estável); data ilegível vai ao fim. */
const maisRecentePrimeiro = (a: EntradaHistorico, b: EntradaHistorico) => {
  const [ta, tb] = [instante(a), instante(b)]
  return ta === tb ? 0 : tb > ta ? 1 : -1
}

function mudanca(e: EntradaHistorico): string | null {
  if (e.valorAnterior !== undefined && e.valorNovo !== undefined) return `De ${e.valorAnterior} para ${e.valorNovo}`
  if (e.valorNovo !== undefined) return e.valorNovo
  if (e.valorAnterior !== undefined) return `Antes: ${e.valorAnterior}`
  return null
}

/** Painel "Histórico", da alteração mais recente para a mais antiga, com o valor anterior e o novo. */
export function PainelHistorico({ entradas }: { entradas: EntradaHistorico[] }) {
  const ordenadas = [...entradas].sort(maisRecentePrimeiro)
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
                {valor ? (
                  <p className="text-sm text-foreground">
                    <ComNumeros texto={valor} />
                  </p>
                ) : null}
                {e.justificativa ? <p className="text-sm text-foreground">Justificativa: {e.justificativa}</p> : null}
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
  const ordenadas = [...entradas].sort((a, b) => maisRecentePrimeiro(b, a))
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
