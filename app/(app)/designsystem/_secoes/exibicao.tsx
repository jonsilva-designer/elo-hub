import { Num } from '@/components/elo/num'
import {
  EtiquetaCriticidade,
  EtiquetaPlanejamento,
  EtiquetaStatus,
  IndicadorPrioridade,
} from '@/components/elo/etiquetas'
import { formatarData, formatarNumero, formatarPercentual, formatarReal } from '@/lib/formato'
import {
  CRITICIDADES,
  ESCOPO_EXEMPLO,
  NUMEROS_EXEMPLO,
  PRIORIDADES,
  GRUPOS_DE_STATUS,
} from '../exemplos'
import { Exemplo, Subsecao } from './secao'

function Numero({ legenda, children }: { legenda: string; children: string }) {
  return (
    <span className="flex flex-col gap-0.5">
      <Num className="text-sm">{children}</Num>
      <span className="text-xs text-muted-foreground">{legenda}</span>
    </span>
  )
}

export function Exibicao() {
  const n = NUMEROS_EXEMPLO
  return (
    <Subsecao titulo="Exibição">
      {GRUPOS_DE_STATUS.map(({ tom, status }) => (
        <Exemplo key={tom} rotulo={`Status, ${tom.toLocaleLowerCase('pt-BR')}`}>
          {status.map((s) => (
            <EtiquetaStatus key={s} status={s} />
          ))}
        </Exemplo>
      ))}
      <Exemplo rotulo="Criticidade">
        {CRITICIDADES.map((c) => (
          <EtiquetaCriticidade key={c} criticidade={c} />
        ))}
      </Exemplo>
      <Exemplo rotulo="Planejamento">
        <EtiquetaPlanejamento />
      </Exemplo>
      <Exemplo rotulo="Prioridade">
        {PRIORIDADES.map((p) => (
          <IndicadorPrioridade key={p} prioridade={p} />
        ))}
      </Exemplo>
      <Exemplo rotulo="Linha de escopo">
        <span className="text-sm font-medium">{ESCOPO_EXEMPLO.titulo}</span>
        <EtiquetaStatus status={ESCOPO_EXEMPLO.status} />
        <EtiquetaCriticidade criticidade={ESCOPO_EXEMPLO.criticidade} />
        <IndicadorPrioridade prioridade={ESCOPO_EXEMPLO.prioridade} />
      </Exemplo>
      <Exemplo rotulo="Números">
        <Numero legenda="Data">{formatarData(n.data)}</Numero>
        <Numero legenda="Valor em reais">{formatarReal(n.valor)}</Numero>
        <Numero legenda="Contagem">{formatarNumero(n.quantidade)}</Numero>
        <Numero legenda="Percentual">{formatarPercentual(n.percentual)}</Numero>
        <Numero legenda="Número da demanda">{n.demanda}</Numero>
        <Numero legenda="Valor vazio">{formatarReal(null)}</Numero>
      </Exemplo>
    </Subsecao>
  )
}
