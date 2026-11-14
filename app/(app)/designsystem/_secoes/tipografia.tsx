import type { ReactNode } from 'react'
import { Num } from '@/components/elo/num'
import { Exemplo, Linhas, Secao } from './secao'

// A classe é o token de tamanho (padrão 4.2): é ela que as telas usam, e nunca o tamanho escrito à mão.
function Legenda({
  fonte,
  tamanho,
  peso,
  classe,
  nota,
}: {
  fonte: string
  tamanho: string
  peso: string
  classe?: string
  nota?: ReactNode
}) {
  return (
    <>
      {fonte}, <Num>{tamanho}</Num>, <Num>{peso}</Num>
      {classe ? (
        <>
          , classe <code className="font-mono">{classe}</code>
        </>
      ) : null}
      {nota ? <>. {nota}</> : null}
    </>
  )
}

export function Tipografia() {
  return (
    <Secao
      titulo="Tipografia"
      descricao="Inter nos textos e JetBrains Mono em todos os números. Nenhuma fonte serifada."
    >
      <Linhas>
        <Exemplo rotulo="Título da página" nota={<Legenda fonte="Inter" tamanho="26px" classe="text-titulo-pagina" peso="600" nota={<>Azul-marinho, espaçamento <Num>-0,02em</Num></>} />}>
          <p className="text-titulo-pagina font-semibold tracking-titulo text-primary">Contratos ativos</p>
        </Exemplo>
        <Exemplo rotulo="Título de seção ou painel" nota={<Legenda fonte="Inter" tamanho="15px" classe="text-titulo-painel" peso="700" nota="Azul-marinho" />}>
          <p className="text-titulo-painel font-bold text-primary">Atividades da semana</p>
        </Exemplo>
        <Exemplo rotulo="Texto" nota={<Legenda fonte="Inter" tamanho="14px" classe="text-sm" peso="400" />}>
          <p className="text-sm">O escopo foi enviado para revisão do cliente.</p>
        </Exemplo>
        <Exemplo rotulo="Texto secundário" nota={<Legenda fonte="Inter" tamanho="13px" classe="text-secundario" peso="400" />}>
          <p className="text-secundario text-muted-foreground">Atualizado pela equipe de governança.</p>
        </Exemplo>
        <Exemplo rotulo="Rótulo de indicador" nota={<Legenda fonte="Inter" tamanho="11px" classe="text-rotulo" peso="600" nota={<>Caixa alta, espaçamento <Num>0,09em</Num></>} />}>
          <p className="text-rotulo font-semibold uppercase tracking-rotulo text-muted-foreground">Atividades atrasadas</p>
        </Exemplo>
        <Exemplo rotulo="Nome de grupo da lateral" nota={<Legenda fonte="Inter" tamanho="10,5px" classe="text-grupo" peso="600" nota={<>Caixa alta, espaçamento <Num>0,12em</Num>, dourado sobre azul-marinho</>} />}>
          <div className="inline-block rounded-lg bg-primary px-4 py-3">
            <p className="text-grupo font-semibold uppercase tracking-grupo text-sidebar-primary">Operação</p>
          </div>
        </Exemplo>
        <Exemplo rotulo="Número de indicador" nota={<Legenda fonte="JetBrains Mono" tamanho="30px" classe="text-indicador" peso="500" nota="Azul-marinho, algarismos de mesma largura" />}>
          <p className="font-mono text-indicador font-medium tabular-nums text-primary">128</p>
        </Exemplo>
        <Exemplo rotulo="Número no meio do texto" nota={<Legenda fonte="JetBrains Mono" tamanho="14px" peso="400" nota="Mesmo tamanho do texto ao redor" />}>
          <p className="text-sm">
            Venceu em <Num>09/11/2026</Num>, com <Num>5</Num> atividades abertas.
          </p>
        </Exemplo>
      </Linhas>
    </Secao>
  )
}
