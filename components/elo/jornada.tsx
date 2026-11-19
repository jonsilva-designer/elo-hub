import type { ReactNode } from 'react'
import { CLASSE_ROTULO } from './textos'
import { EtiquetaStatus } from '@/components/elo/etiquetas'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { Progresso } from '@/components/elo/progresso'
import type { EtapaJornada, LinhaEtapaDetalhada } from '@/lib/dados/tipos'
import { formatarData, VAZIO } from '@/lib/formato'
import { cn } from '@/lib/utils'

/** Uma data da etapa, em fonte de número, ou o traço apagado. */
function DataDaEtapa({ rotulo, valor }: { rotulo: string; valor: string | null }) {
  return (
    <div className="min-w-0">
      <dt className={CLASSE_ROTULO}>{rotulo}</dt>
      <dd className="mt-0.5 text-sm text-foreground">
        {valor ? <Num>{formatarData(valor)}</Num> : <span className="text-muted-foreground">{VAZIO}</span>}
      </dd>
    </div>
  )
}

/**
 * Painel da Jornada ELO (F06; parte 3, 5.10 e 5.13): as 5 etapas na ordem oficial, em cartões, com a etapa atual e o
 * progresso nas etapas aplicáveis (DF-28). Sem estado: o "Atualizar" de cada etapa chega pronto em `acoes`.
 */
export function Jornada({
  etapas,
  etapaAtual,
  progresso,
  fechado,
  acoes,
}: {
  etapas: LinhaEtapaDetalhada[]
  etapaAtual: EtapaJornada | 'Não iniciada'
  progresso: { concluidas: number; aplicaveis: number }
  fechado: boolean
  acoes?: Partial<Record<EtapaJornada, ReactNode>>
}) {
  return (
    <Painel
      titulo="Jornada ELO"
      acao={
        <span className="text-secundario text-muted-foreground">
          Etapa atual: <span className="font-medium text-foreground">{etapaAtual}</span>
          <span aria-hidden="true"> · </span>
          <Progresso
            feitas={progresso.concluidas}
            total={progresso.aplicaveis}
            rotulo="etapas"
            vazio="Sem etapas aplicáveis"
            rotuloAcessivel="Etapas concluídas"
            barra={false}
          />
        </span>
      }
    >
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
        {etapas.map((l) => {
          const atual = l.etapa === etapaAtual
          const aplicavel = l.status !== 'Não aplicável'
          return (
            <article
              key={l.etapa}
              aria-label={l.etapa}
              data-atual={atual ? 'true' : undefined}
              data-aplicavel={aplicavel ? undefined : 'false'}
              className={cn(
                'flex min-w-0 flex-col gap-3 rounded-lg border p-4',
                atual ? 'border-primary' : 'border-border',
                aplicavel ? 'bg-card' : 'bg-muted text-muted-foreground',
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className={cn('text-sm font-semibold', aplicavel ? 'text-foreground' : 'text-muted-foreground')}>
                  {l.etapa}
                </h3>
                <EtiquetaStatus status={l.status} />
              </div>
              <p className={cn('text-sm', l.nomeResponsavel ? 'text-foreground' : 'text-muted-foreground')}>
                {l.nomeResponsavel || 'Sem responsável'}
              </p>
              <dl className="grid grid-cols-2 gap-2">
                <DataDaEtapa rotulo="Início" valor={l.inicio} />
                <DataDaEtapa rotulo="Conclusão" valor={l.conclusao} />
              </dl>
              {acoes?.[l.etapa] ? <div className="mt-auto">{acoes[l.etapa]}</div> : null}
            </article>
          )
        })}
      </div>
      {fechado ? <p className="mt-4 text-sm text-muted-foreground">As etapas não mudam com o escopo fechado.</p> : null}
    </Painel>
  )
}
