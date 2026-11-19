'use client'

import { EstadoVazio } from '@/components/elo/estados'
import { EtiquetaCriticidade, EtiquetaPlanejamento, EtiquetaSinal, EtiquetaStatus, IndicadorPrioridade } from '@/components/elo/etiquetas'
import { NivelMaturidade } from '@/components/elo/nivel-maturidade'
import { Num } from '@/components/elo/num'
import { ResumoAtividades } from '@/components/elo/resumo-atividades'
import { TabelaDados, type Coluna } from '@/components/elo/tabela-dados'
import { Apagado, TextoComDetalhe } from '@/components/elo/textos'
import type {
  AtividadePendente,
  DemandaDaVisao,
  EscopoDaVisao,
  ItemDaVisao,
  MaturidadeGeral,
  NivelDimensao,
  PlanoDaVisao,
  VisaoExecutiva,
} from '@/lib/dados/tipos'
import { CRITICIDADES } from '@/lib/escopos/regras'
import { formatarData } from '@/lib/formato'
import { ETAPAS } from '@/lib/jornada/regras'
import { TextoComNumeros } from '../../../../documentos/_componentes/texto-com-numeros'

// As tabelas dos blocos da Visão Executiva (parte 7, 4.4; F14). Só leitura: a página é para a reunião e a projeção, e
// os dados chegam da leitura da visão, que já deixou de fora o que não pode ir para o cliente (CA-14.5).

const semValor = (texto: string) => <Apagado>{texto}</Apagado>

const comDetalhe = (principal: React.ReactNode, detalhe: React.ReactNode) => (
  <TextoComDetalhe texto={principal} destaque={false} detalhes={[detalhe]} />
)

const COLUNAS_ESCOPOS: Coluna<EscopoDaVisao>[] = [
  {
    id: 'escopo',
    titulo: 'Escopo',
    largura: 'w-1/3',
    ordenarPor: (e) => e.nome,
    celula: (e) =>
      comDetalhe(
        e.nome,
        <>
          <Num>{e.codigoContrato}</Num> · {e.contratante}
        </>,
      ),
  },
  {
    id: 'status',
    titulo: 'Status',
    ordenarPor: (e) => e.status,
    celula: (e) => (
      <span className="flex flex-wrap items-center gap-1.5">
        <EtiquetaStatus status={e.status} />
        {e.planejamento ? <EtiquetaPlanejamento /> : null}
      </span>
    ),
  },
  { id: 'prioridade', titulo: 'Prioridade', celula: (e) => <IndicadorPrioridade prioridade={e.prioridade} /> },
  {
    id: 'criticidade',
    titulo: 'Criticidade',
    ordenarPor: (e) => CRITICIDADES.indexOf(e.criticidade),
    celula: (e) => <EtiquetaCriticidade criticidade={e.criticidade} />,
  },
]

const COLUNAS_JORNADA: Coluna<EscopoDaVisao>[] = [
  { id: 'escopo', titulo: 'Escopo', largura: 'w-1/4', celula: (e) => comDetalhe(e.nome, `Etapa atual: ${e.etapaAtual}`) },
  ...ETAPAS.map((etapa) => ({
    id: etapa,
    titulo: etapa,
    celula: (e: EscopoDaVisao) => <EtiquetaStatus status={e.etapas.find((l) => l.etapa === etapa)?.status ?? 'Não iniciada'} />,
  })),
]

const COLUNAS_PLANOS: Coluna<PlanoDaVisao>[] = [
  { id: 'plano', titulo: 'Plano', largura: 'w-1/3', ordenarPor: (p) => p.nome, celula: (p) => comDetalhe(p.nome, p.escopo) },
  { id: 'status', titulo: 'Status', ordenarPor: (p) => p.status, celula: (p) => <EtiquetaStatus status={p.status} /> },
  {
    id: 'atividades',
    titulo: 'Atividades',
    celula: (p) => <ResumoAtividades resumo={{ total: p.total, concluidas: p.concluidas, atrasadas: p.atrasadas }} />,
  },
]

type Pendente = AtividadePendente & { plano: string }

const COLUNAS_PENDENTES: Coluna<Pendente>[] = [
  { id: 'atividade', titulo: 'Atividade', largura: 'w-1/3', ordenarPor: (a) => a.nome, celula: (a) => comDetalhe(a.nome, a.plano) },
  {
    id: 'prazo',
    titulo: 'Prazo',
    ordenarPor: (a) => a.prazo,
    celula: (a) => (
      <span className="flex flex-wrap items-center gap-1.5">
        <Num>{formatarData(a.prazo)}</Num>
        {a.situacao ? <EtiquetaSinal texto={a.situacao} tom={a.situacao === 'Atrasada' ? 'problema' : 'atencao'} /> : null}
      </span>
    ),
  },
  { id: 'responsavel', titulo: 'Responsável', ordenarPor: (a) => a.responsavel, celula: (a) => a.responsavel },
  { id: 'executor', titulo: 'Executor', celula: (a) => a.executor || semValor('O responsável') },
]

const COLUNAS_DEMANDAS: Coluna<DemandaDaVisao>[] = [
  { id: 'numero', titulo: 'Número', ordenarPor: (d) => d.numero, celula: (d) => <TextoComDetalhe texto={<Num>{d.numero}</Num>} /> },
  { id: 'assunto', titulo: 'Assunto', largura: 'w-1/3', ordenarPor: (d) => d.assunto, celula: (d) => d.assunto },
  { id: 'status', titulo: 'Status', ordenarPor: (d) => d.status, celula: (d) => <EtiquetaStatus status={d.status} /> },
  {
    id: 'criticidade',
    titulo: 'Criticidade',
    celula: (d) => (d.criticidade ? <EtiquetaCriticidade criticidade={d.criticidade} /> : semValor('Na triagem')),
  },
  {
    id: 'prazo',
    titulo: 'Prazo',
    ordenarPor: (d) => d.prazo,
    celula: (d) =>
      d.prazo ? (
        <span className="flex flex-wrap items-center gap-1.5">
          <Num>{formatarData(d.prazo)}</Num>
          {d.vencida ? <EtiquetaSinal texto="Vencida" tom="problema" /> : null}
        </span>
      ) : (
        semValor('Sem prazo')
      ),
  },
]

const COLUNAS_ITENS: Coluna<ItemDaVisao>[] = [
  { id: 'tipo', titulo: 'Tipo', celula: (i) => i.tipo },
  { id: 'descricao', titulo: 'Descrição', largura: 'w-1/2', celula: (i) => <TextoComNumeros texto={i.descricao} /> },
  { id: 'data', titulo: 'Data', ordenarPor: (i) => i.data, celula: (i) => <Num>{formatarData(i.data)}</Num> },
]

export function TabelaEscoposDaVisao({ escopos }: { escopos: EscopoDaVisao[] }) {
  return <TabelaDados colunas={COLUNAS_ESCOPOS} linhas={escopos} chave={(e) => e.id} vazio={<EstadoVazio titulo="Nenhum escopo." />} />
}

export function TabelaJornadaDaVisao({ escopos }: { escopos: EscopoDaVisao[] }) {
  return <TabelaDados colunas={COLUNAS_JORNADA} linhas={escopos} chave={(e) => e.id} vazio={<EstadoVazio titulo="Nenhum escopo." />} />
}

export function TabelaPlanosDaVisao({ planos }: { planos: PlanoDaVisao[] }) {
  return (
    <TabelaDados colunas={COLUNAS_PLANOS} linhas={planos} chave={(p) => p.id} vazio={<EstadoVazio titulo="Nenhum plano aberto." />} />
  )
}

export function TabelaPendentesDaVisao({ planos }: { planos: PlanoDaVisao[] }) {
  const pendentes = planos.flatMap((p) => p.pendentes.map((a) => ({ ...a, plano: p.nome })))
  return (
    <TabelaDados
      colunas={COLUNAS_PENDENTES}
      linhas={pendentes}
      chave={(a) => a.id}
      destaque={(a) => (a.situacao === 'Atrasada' ? 'problema' : a.situacao ? 'atencao' : null)}
      vazio={<EstadoVazio titulo="Nenhuma atividade pendente." />}
    />
  )
}

export function TabelaDemandasDaVisao({ demandas }: { demandas: DemandaDaVisao[] }) {
  return (
    <TabelaDados
      colunas={COLUNAS_DEMANDAS}
      linhas={demandas}
      chave={(d) => d.numero}
      destaque={(d) => (d.vencida ? 'problema' : null)}
      vazio={<EstadoVazio titulo="Nenhuma demanda aberta." />}
    />
  )
}

export function TabelaItensDaVisao({ itens, vazio }: { itens: ItemDaVisao[]; vazio: string }) {
  return (
    <TabelaDados colunas={COLUNAS_ITENS} linhas={itens} chave={(i) => `${i.tipo}:${i.descricao}:${i.data}`} vazio={<EstadoVazio titulo={vazio} />} />
  )
}

type Nivel = NivelDimensao | MaturidadeGeral | null

type LinhaMaturidade = { dimensao: string; inicial: Nivel; atual: Nivel }

/** A maturidade inicial e a atual (RN-25): a geral, a prontidão e o nível por dimensão. */
export function TabelaMaturidadeDaVisao({ maturidade }: { maturidade: NonNullable<VisaoExecutiva['maturidade']> }) {
  const { inicial, atual } = maturidade
  const dimensoes = [...new Set([...inicial.dimensoes, ...atual.dimensoes].map((d) => d.dimensao))]
  const nivel = (lista: typeof inicial.dimensoes, dimensao: string) => lista.find((d) => d.dimensao === dimensao)?.nivel ?? 'Não avaliada'
  const linhas: LinhaMaturidade[] = [
    { dimensao: 'Maturidade geral', inicial: inicial.maturidadeGeral, atual: atual.maturidadeGeral },
    ...dimensoes.map((d) => ({ dimensao: d, inicial: nivel(inicial.dimensoes, d), atual: nivel(atual.dimensoes, d) })),
  ]
  const colunas: Coluna<LinhaMaturidade>[] = [
    { id: 'dimensao', titulo: 'Dimensão', largura: 'w-1/3', celula: (l) => l.dimensao },
    { id: 'inicial', titulo: 'Inicial', celula: (l) => <NivelMaturidade nivel={l.inicial} /> },
    { id: 'atual', titulo: 'Atual', celula: (l) => <NivelMaturidade nivel={l.atual} /> },
  ]
  return (
    <div className="space-y-3">
      <p className="px-5 pt-4 text-sm text-foreground">
        Avaliação inicial de <Num>{formatarData(inicial.data)}</Num> e atual de <Num>{formatarData(atual.data)}</Num>.
      </p>
      <TabelaDados colunas={colunas} linhas={linhas} chave={(l) => l.dimensao} vazio={null} />
      <p className="px-5 pb-4 text-sm text-foreground">
        Prontidão: <span className="font-medium">{inicial.prontidao ?? '—'}</span> na inicial,{' '}
        <span className="font-medium">{atual.prontidao ?? '—'}</span> na atual.
      </p>
    </div>
  )
}
