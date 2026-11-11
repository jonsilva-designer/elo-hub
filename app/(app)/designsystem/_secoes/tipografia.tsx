import type { ReactNode } from 'react'
import { Num } from '@/components/elo/num'
import { Painel, Secao } from './secao'

function Legenda({ fonte, tamanho, peso, nota }: { fonte: string; tamanho: string; peso: string; nota?: ReactNode }) {
  return (
    <p className="text-xs text-muted-foreground sm:w-56 sm:shrink-0">
      {fonte}, <Num>{tamanho}</Num>, <Num>{peso}</Num>
      {nota ? <>. {nota}</> : null}
    </p>
  )
}

function Linha({ papel, legenda, children }: { papel: string; legenda: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4">
      <div className="text-xs font-medium sm:w-44 sm:shrink-0">{papel}</div>
      <div className="min-w-0 flex-1">{children}</div>
      {legenda}
    </div>
  )
}

export function Tipografia() {
  return (
    <Secao
      titulo="Tipografia"
      descricao="Inter nos textos e JetBrains Mono em todos os números. Nenhuma fonte serifada."
    >
      <Painel className="divide-y divide-[color:var(--elo-divisoria)]">
        <Linha papel="Título da página" legenda={<Legenda fonte="Inter" tamanho="26px" peso="600" nota={<>Azul-marinho, espaçamento <Num>-0,02em</Num></>} />}>
          <p className="text-[26px] font-semibold tracking-[-0.02em] text-[var(--elo-azul-marinho)]">Contratos ativos</p>
        </Linha>
        <Linha papel="Título de seção ou painel" legenda={<Legenda fonte="Inter" tamanho="15px" peso="700" nota="Azul-marinho" />}>
          <p className="text-[15px] font-bold text-[var(--elo-azul-marinho)]">Atividades da semana</p>
        </Linha>
        <Linha papel="Texto" legenda={<Legenda fonte="Inter" tamanho="14px" peso="400" />}>
          <p className="text-sm">O escopo foi enviado para revisão do cliente.</p>
        </Linha>
        <Linha papel="Texto secundário" legenda={<Legenda fonte="Inter" tamanho="13px" peso="400" />}>
          <p className="text-[13px] text-muted-foreground">Atualizado pela equipe de governança.</p>
        </Linha>
        <Linha papel="Rótulo de indicador" legenda={<Legenda fonte="Inter" tamanho="11px" peso="600" nota={<>Caixa alta, espaçamento <Num>0,09em</Num></>} />}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">Atividades atrasadas</p>
        </Linha>
        <Linha papel="Nome de grupo da lateral" legenda={<Legenda fonte="Inter" tamanho="10,5px" peso="600" nota={<>Caixa alta, espaçamento <Num>0,12em</Num>, dourado sobre azul-marinho</>} />}>
          <div className="inline-block rounded-lg bg-primary px-4 py-3">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--elo-dourado)]">Operação</p>
          </div>
        </Linha>
        <Linha papel="Número de indicador" legenda={<Legenda fonte="JetBrains Mono" tamanho="30px" peso="500" nota="Azul-marinho, algarismos de mesma largura" />}>
          <p className="font-mono text-[30px] font-medium tabular-nums text-[var(--elo-azul-marinho)]">128</p>
        </Linha>
        <Linha papel="Número no meio do texto" legenda={<Legenda fonte="JetBrains Mono" tamanho="14px" peso="400" nota="Mesmo tamanho do texto ao redor" />}>
          <p className="text-sm">
            Venceu em <Num>09/11/2026</Num>, com <Num>5</Num> atividades abertas.
          </p>
        </Linha>
      </Painel>
    </Secao>
  )
}
