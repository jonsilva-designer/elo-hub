import Link from 'next/link'
import { useId, type ReactNode } from 'react'
import { CartaoIndicador, GradeIndicadores } from '@/components/elo/cartao-indicador'
import { ListaCampos } from '@/components/elo/lista-campos'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { listarAlertas } from '@/lib/dados/alertas'
import { indicadoresDoPainel, type Indicador } from '@/lib/dados/painel'
import { ListaAlertas } from './lista-alertas'

const CLASSE_LINK = 'rounded-sm text-primary underline-offset-4 hover:underline'

/** Um bloco de cartões com o título do bloco, no estilo do título do painel. */
function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  const id = useId()
  return (
    <section aria-labelledby={id} className="space-y-3">
      <h2 id={id} className="text-sm font-bold text-primary">
        {titulo}
      </h2>
      {children}
    </section>
  )
}

/** Os números de um detalhamento (por status, por criticidade), cada um com o link da lista filtrada. */
function Detalhamento({ indicadores }: { indicadores: Indicador[] }) {
  return (
    <ListaCampos
      itens={indicadores.map((i) => ({
        rotulo: i.rotulo,
        valor: (
          <Link href={i.href} className={CLASSE_LINK} aria-label={`${i.rotulo}: ${i.valor}`}>
            <Num>{i.valor}</Num>
          </Link>
        ),
      }))}
    />
  )
}

const cartao = (i: Indicador) => (
  <CartaoIndicador key={i.href} rotulo={i.rotulo} valor={i.valor} href={i.href} tom={i.valor > 0 ? i.tom : undefined} />
)

/**
 * O painel do Início (parte 7, 4.2 e 4.3; F13, F15): os números da carteira, cada um levando à lista já filtrada
 * (CA-13.3), e os alertas. Tudo vem recortado pelo vínculo de quem vê (CA-13.2, CA-15.3) e calculado na hora (DF-14).
 * Os destaques de contrato e de atividade só aparecem quando o número não é zero.
 */
export async function ConteudoInicio() {
  const [painel, alertas] = await Promise.all([indicadoresDoPainel(), listarAlertas()])
  const [abertas, ...atividades] = painel.atividades
  return (
    <div className="space-y-6">
      <GradeIndicadores>
        {cartao(painel.clientesAtivos)}
        {cartao(painel.escopos.total)}
        {cartao({ ...abertas, rotulo: 'Atividades abertas' })}
        {cartao(painel.demandas.abertas)}
      </GradeIndicadores>
      <Bloco titulo="Contratos">
        <GradeIndicadores>{painel.contratos.map(cartao)}</GradeIndicadores>
      </Bloco>
      <Bloco titulo="Atividades">
        <GradeIndicadores>{atividades.map(cartao)}</GradeIndicadores>
      </Bloco>
      <div className="grid gap-5 lg:grid-cols-2">
        <Painel titulo="Escopos">
          <div className="grid gap-5 sm:grid-cols-2">
            <Detalhamento indicadores={painel.escopos.porStatus} />
            <Detalhamento indicadores={painel.escopos.porCriticidade} />
          </div>
        </Painel>
        <Painel titulo="Central ELO">
          <div className="grid gap-5 sm:grid-cols-2">
            <Detalhamento indicadores={painel.demandas.porStatus} />
            <Detalhamento indicadores={painel.demandas.porCriticidade} />
          </div>
        </Painel>
      </div>
      <Painel titulo="Alertas" contagem={alertas.ativos ? <Num>{alertas.alertas.length}</Num> : undefined} semRespiro>
        <ListaAlertas ativos={alertas.ativos} alertas={alertas.alertas} />
      </Painel>
    </div>
  )
}
