import { CartaoIndicador, GradeIndicadores } from '@/components/elo/cartao-indicador'
import { ListaCampos } from '@/components/elo/lista-campos'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { ProgressoAtividades } from '@/components/elo/progresso-atividades'
import { Button } from '@/components/ui/button'
import {
  EtiquetaCriticidade,
  EtiquetaPlanejamento,
  EtiquetaStatus,
  IndicadorPrioridade,
} from '@/components/elo/etiquetas'
import { formatarData, formatarNumero, formatarPercentual, formatarReal } from '@/lib/formato'
import {
  CONTRATO_EXEMPLO,
  CRITICIDADES,
  INDICADORES_EXEMPLO,
  ESCOPO_EXEMPLO,
  NUMEROS_EXEMPLO,
  PRIORIDADES,
  GRUPOS_DE_STATUS,
} from '../exemplos'
import { ExibicaoEstados } from './exibicao-estados'
import { Exemplo, Subsecao } from './secao'

function Numero({ legenda, children }: { legenda: string; children: string }) {
  return (
    <span className="flex flex-col gap-0.5">
      <Num className="text-sm">{children}</Num>
      <span className="text-xs text-muted-foreground">{legenda}</span>
    </span>
  )
}

const ALERTA = 'font-semibold text-[var(--elo-alerta)]'

export function Exibicao() {
  const n = NUMEROS_EXEMPLO
  const i = INDICADORES_EXEMPLO
  const c = CONTRATO_EXEMPLO
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
      <Exemplo
        largo
        rotulo="Indicadores"
        nota="No produto, cada cartão leva à lista já filtrada. Aqui o link volta para esta linha."
      >
        <div id="indicadores" data-demo>
          <GradeIndicadores>
            <CartaoIndicador
              rotulo="Clientes ativos"
              valor={i.clientes}
              detalhe="na carteira"
              href="#indicadores"
            />
            <CartaoIndicador
              rotulo="Contratos vigentes"
              valor={i.contratos.vigentes}
              href="#indicadores"
              detalhe={
                <>
                  <Num>{i.contratos.proximos}</Num> próximos do vencimento ·{' '}
                  <span className={ALERTA}>
                    <Num>{i.contratos.vencidos}</Num> vencido
                  </span>
                </>
              }
            />
            <CartaoIndicador
              rotulo="Atividades abertas"
              valor={i.atividades.abertas}
              href="#indicadores"
              detalhe={
                <>
                  <span className={ALERTA}>
                    <Num>{i.atividades.atrasadas}</Num> atrasadas
                  </span>{' '}
                  · <Num>{i.atividades.proximas}</Num> próximas do prazo
                </>
              }
            />
            <CartaoIndicador
              rotulo="Demandas abertas"
              valor={i.demandas.abertas}
              href="#indicadores"
              detalhe={
                <>
                  <span className={ALERTA}>
                    <Num>{i.demandas.criticas}</Num> críticas
                  </span>{' '}
                  · <Num>{i.demandas.semTriagem}</Num> sem triagem
                </>
              }
            />
          </GradeIndicadores>
        </div>
      </Exemplo>
      <Exemplo largo rotulo="Indicador zerado, sem link">
        <GradeIndicadores>
          <CartaoIndicador rotulo="Demandas sem triagem" valor={0} detalhe="nenhuma pendente" />
        </GradeIndicadores>
      </Exemplo>
      <Exemplo largo rotulo="Painel e lista de campos">
        <div data-demo>
          <Painel
            titulo="Dados do contrato"
            contagem={<><Num>6</Num> campos</>}
            acao={<Button variant="outline">Editar</Button>}
          >
            <ListaCampos
              itens={[
                { rotulo: 'Cliente', valor: c.cliente },
                { rotulo: 'Número', valor: <Num>{c.numero}</Num> },
                { rotulo: 'Início', valor: <Num>{formatarData(c.inicio)}</Num> },
                { rotulo: 'Término', valor: <Num>{formatarData(c.termino)}</Num> },
                { rotulo: 'Valor', valor: <Num>{formatarReal(c.valor)}</Num> },
                { rotulo: 'Observações', valor: null },
              ]}
            />
          </Painel>
        </div>
      </Exemplo>
      <Exemplo rotulo="Progresso de atividades">
        <div className="w-full sm:max-w-xs">
          <ProgressoAtividades concluidas={3} total={8} />
        </div>
      </Exemplo>
      <Exemplo rotulo="Progresso sem atividades">
        <ProgressoAtividades concluidas={0} total={0} />
      </Exemplo>
      <ExibicaoEstados />
    </Subsecao>
  )
}
