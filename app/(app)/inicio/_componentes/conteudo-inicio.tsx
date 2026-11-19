import { useId, type ReactNode } from 'react'
import { FaixaIndicadores } from '@/components/elo/faixa-indicadores'
import { Composicao, type Contagem } from '@/components/elo/composicao'
import { ListaContagens } from '@/components/elo/lista-contagens'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { CLASSE_ROTULO } from '@/components/elo/textos'
import { listarAlertas } from '@/lib/dados/alertas'
import { indicadoresDoPainel, type Indicador } from '@/lib/dados/painel'
import { ListaAlertas } from './lista-alertas'

/** Um grupo dentro do painel (por status, por criticidade, etapa atual), com o título no estilo do rótulo. */
function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  const id = useId()
  return (
    <section aria-labelledby={id} className="min-w-0 space-y-2">
      <h3 id={id} className={CLASSE_ROTULO}>
        {titulo}
      </h3>
      {children}
    </section>
  )
}

const contagens = (indicadores: Indicador[]): Contagem[] =>
  indicadores.map((i) => ({ rotulo: i.rotulo, valor: i.valor, href: i.href, tom: i.tom }))

/**
 * O painel do Início (parte 7, 4.2 e 4.3; F13, F15), refeito na revisão do Jonathan (19/11/2026): os quatro números
 * principais numa faixa só; Contratos e Atividades lado a lado, cada um com um todo e as partes dele numa barra só
 * (os contratos em vigor pela vigência, as atividades abertas pelo prazo); Escopos e Central ELO com as contagens em
 * grupos separados por título; e os alertas. Cada número leva à lista já filtrada (CA-13.3). Tudo vem recortado
 * pelo vínculo de quem vê (CA-13.2, CA-15.3) e calculado na hora (DF-14).
 */
export async function ConteudoInicio() {
  const [painel, alertas] = await Promise.all([indicadoresDoPainel(), listarAlertas()])
  const { contratos, atividades } = painel
  return (
    <div className="space-y-6">
      <FaixaIndicadores
        rotulo="Números da carteira"
        itens={[painel.clientesAtivos, painel.escopos.total, { ...atividades.abertas, rotulo: 'Atividades abertas' }, painel.demandas.abertas]}
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <Painel titulo="Contratos">
          <Composicao
            total={{ ...contratos.emVigor, rotulo: 'contratos em vigor' }}
            partes={contagens([contratos.vigentes, contratos.proximos, contratos.vencidos])}
            complemento={contratos.suspensos}
          />
        </Painel>
        <Painel titulo="Atividades">
          <Composicao
            total={{ ...atividades.abertas, rotulo: 'atividades abertas' }}
            partes={contagens([atividades.noPrazo, atividades.proximas, atividades.atrasadas])}
            complemento={atividades.concluidas}
          />
        </Painel>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Painel titulo="Escopos">
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <Grupo titulo="Por status">
                <ListaContagens itens={contagens(painel.escopos.porStatus)} />
              </Grupo>
              <Grupo titulo="Por criticidade">
                <ListaContagens itens={contagens(painel.escopos.porCriticidade)} />
              </Grupo>
            </div>
            <Grupo titulo="Etapa atual dos escopos abertos">
              <ListaContagens itens={contagens(painel.escopos.porEtapa)} />
            </Grupo>
          </div>
        </Painel>
        <Painel titulo="Central ELO">
          <div className="grid gap-6 sm:grid-cols-2">
            <Grupo titulo="Por status">
              <ListaContagens itens={contagens(painel.demandas.porStatus)} />
            </Grupo>
            <Grupo titulo="Por criticidade">
              <ListaContagens itens={contagens(painel.demandas.porCriticidade)} />
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
