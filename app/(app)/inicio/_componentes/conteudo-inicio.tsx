import { useId, type ReactNode } from 'react'
import { FaixaIndicadores } from '@/components/elo/faixa-indicadores'
import { ListaBarras, type ItemBarra } from '@/components/elo/lista-barras'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { listarAlertas } from '@/lib/dados/alertas'
import { indicadoresDoPainel, type Indicador } from '@/lib/dados/painel'
import { ListaAlertas } from './lista-alertas'

/** Um grupo dentro do painel (por status, por criticidade, etapa atual), com o título no estilo do rótulo. */
function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  const id = useId()
  return (
    <section aria-labelledby={id} className="min-w-0 space-y-2">
      <h3 id={id} className="text-rotulo font-semibold uppercase tracking-rotulo text-muted-foreground">
        {titulo}
      </h3>
      {children}
    </section>
  )
}

const barras = (indicadores: Indicador[]): ItemBarra[] =>
  indicadores.map((i) => ({ rotulo: i.rotulo, valor: i.valor, href: i.href, tom: i.tom }))

/**
 * O painel do Início (parte 7, 4.2 e 4.3; F13, F15), refeito na revisão do Jonathan (19/11/2026): os quatro números
 * principais numa faixa só; Contratos e Atividades como gráficos de barras, lado a lado; Escopos e Central ELO com
 * os grupos separados por título; e os alertas. Cada número leva à lista já filtrada (CA-13.3). Tudo vem recortado
 * pelo vínculo de quem vê (CA-13.2, CA-15.3) e calculado na hora (DF-14).
 */
export async function ConteudoInicio() {
  const [painel, alertas] = await Promise.all([indicadoresDoPainel(), listarAlertas()])
  const [abertas] = painel.atividades
  return (
    <div className="space-y-6">
      <FaixaIndicadores
        rotulo="Números da carteira"
        itens={[painel.clientesAtivos, painel.escopos.total, { ...abertas, rotulo: 'Atividades abertas' }, painel.demandas.abertas]}
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <Painel titulo="Contratos">
          <ListaBarras itens={barras(painel.contratos)} />
        </Painel>
        <Painel titulo="Atividades">
          <ListaBarras itens={barras(painel.atividades)} />
        </Painel>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Painel titulo="Escopos">
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <Grupo titulo="Por status">
                <ListaBarras itens={barras(painel.escopos.porStatus)} />
              </Grupo>
              <Grupo titulo="Por criticidade">
                <ListaBarras itens={barras(painel.escopos.porCriticidade)} />
              </Grupo>
            </div>
            <Grupo titulo="Etapa atual dos escopos abertos">
              <ListaBarras itens={barras(painel.escopos.porEtapa)} duasColunas />
            </Grupo>
          </div>
        </Painel>
        <Painel titulo="Central ELO">
          <div className="grid gap-6 sm:grid-cols-2">
            <Grupo titulo="Por status">
              <ListaBarras itens={barras(painel.demandas.porStatus)} />
            </Grupo>
            <Grupo titulo="Por criticidade">
              <ListaBarras itens={barras(painel.demandas.porCriticidade)} />
            </Grupo>
          </div>
        </Painel>
      </div>
      <Painel titulo="Alertas" contagem={alertas.ativos ? <Num>{alertas.alertas.length}</Num> : undefined} semRespiro>
        <ListaAlertas ativos={alertas.ativos} alertas={alertas.alertas} />
      </Painel>
    </div>
  )
}
