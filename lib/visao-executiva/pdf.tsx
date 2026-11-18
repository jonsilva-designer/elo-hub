import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import type { VisaoExecutiva } from '@/lib/dados/tipos'
import { formatarData, formatarDataHora } from '@/lib/formato'
import { ETAPAS } from '@/lib/jornada/regras'

// O PDF da Visão Executiva (F14, DF-74; arquitetura 3.5, DA-04): os mesmos blocos e a mesma leitura da tela, em A4
// retrato. O PDF não lê CSS: as cores são as da marca, iguais aos tokens --elo-azul-marinho, --elo-dourado e
// --elo-dourado-suave de app/globals.css. A fonte é a Helvetica do próprio PDF; o layout é a proposta da parte 7 (4.5),
// para a Cleo aprovar (DT-04).

const COR = {
  azul: '#182F4F',
  dourado: '#BD903F',
  douradoSuave: '#E9DBC0',
  texto: '#1F2937',
  apagado: '#6B7280',
  linha: '#E5E7EB',
}

const e = StyleSheet.create({
  pagina: { paddingTop: 28, paddingBottom: 40, paddingHorizontal: 32, fontFamily: 'Helvetica', fontSize: 9, color: COR.texto },
  faixa: { backgroundColor: COR.azul, marginHorizontal: -32, marginTop: -28, paddingHorizontal: 32, paddingVertical: 18, marginBottom: 14 },
  faixaLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { width: 70, height: 28, objectFit: 'contain' },
  titulo: { color: '#FFFFFF', fontSize: 18, fontFamily: 'Helvetica-Bold', marginTop: 10 },
  cliente: { color: COR.douradoSuave, fontSize: 12, marginTop: 2 },
  datas: { color: '#FFFFFF', fontSize: 8, marginTop: 8 },
  secao: { marginBottom: 12 },
  secaoTitulo: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COR.azul,
    borderBottomWidth: 1.5,
    borderBottomColor: COR.dourado,
    paddingBottom: 3,
    marginBottom: 5,
  },
  linha: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: COR.linha, paddingVertical: 3 },
  cabecalho: { flexDirection: 'row', paddingVertical: 3, borderBottomWidth: 0.8, borderBottomColor: COR.azul },
  celulaCabecalho: { fontFamily: 'Helvetica-Bold', color: COR.azul, paddingRight: 4 },
  celula: { paddingRight: 4 },
  vazio: { color: COR.apagado },
  paragrafo: { lineHeight: 1.4 },
  autor: { color: COR.apagado, fontSize: 8, marginTop: 3 },
  rodape: { position: 'absolute', bottom: 18, left: 32, right: 32, flexDirection: 'row', justifyContent: 'space-between', color: COR.apagado, fontSize: 7 },
})

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View style={e.secao}>
      {/* O título não fica sozinho no pé da página: ele vai junto com o começo do bloco. */}
      <Text style={e.secaoTitulo} minPresenceAhead={40}>
        {titulo}
      </Text>
      {children}
    </View>
  )
}

/** Uma tabela simples: as larguras são frações que somam 1. */
function Tabela({ colunas, linhas, vazio }: { colunas: { titulo: string; largura: number }[]; linhas: string[][]; vazio: string }) {
  if (linhas.length === 0) return <Text style={e.vazio}>{vazio}</Text>
  return (
    <View>
      <View style={e.cabecalho}>
        {colunas.map((c) => (
          <Text key={c.titulo} style={[e.celulaCabecalho, { width: `${c.largura * 100}%` }]}>
            {c.titulo}
          </Text>
        ))}
      </View>
      {linhas.map((linha, i) => (
        <View key={i} style={e.linha}>
          {linha.map((texto, j) => (
            <Text key={j} style={[e.celula, { width: `${colunas[j].largura * 100}%` }]}>
              {texto}
            </Text>
          ))}
        </View>
      ))}
    </View>
  )
}

const data = (valor: string | null) => (valor ? formatarData(valor) : '—')

export function DocumentoVisaoExecutiva({ visao, logo }: { visao: VisaoExecutiva; logo: string }) {
  const pendentes = visao.planos.flatMap((p) => p.pendentes.map((a) => ({ ...a, plano: p.nome })))
  const itens = (lista: VisaoExecutiva['entregas']) => lista.map((i) => [i.tipo, i.descricao, formatarData(i.data)])
  const colunasItens = [
    { titulo: 'Tipo', largura: 0.18 },
    { titulo: 'Descrição', largura: 0.62 },
    { titulo: 'Data', largura: 0.2 },
  ]
  return (
    <Document title={`Visão Executiva · ${visao.cliente.nome}`} author="ELO Governança Inteligente" language="pt-BR">
      <Page size="A4" style={e.pagina}>
        <View style={e.faixa}>
          <View style={e.faixaLinha}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- a Image do PDF não tem texto alternativo */}
            <Image src={logo} style={e.logo} />
            <Text style={{ color: COR.douradoSuave, fontSize: 8 }}>Uso em reunião com o cliente</Text>
          </View>
          <Text style={e.titulo}>Visão Executiva</Text>
          <Text style={e.cliente}>
            {visao.cliente.nome}
            {visao.contrato ? ` · Contrato ${visao.contrato.codigo}` : ' · Todos os contratos'}
          </Text>
          <Text style={e.datas}>
            Emitida em {formatarData(visao.hoje)} · Textos atualizados em {data(visao.textosAtualizadosEm)}
          </Text>
        </View>

        <Secao titulo="Escopos e situação atual">
          <Tabela
            colunas={[
              { titulo: 'Escopo', largura: 0.34 },
              { titulo: 'Contrato', largura: 0.24 },
              { titulo: 'Status', largura: 0.16 },
              { titulo: 'Prioridade', largura: 0.12 },
              { titulo: 'Criticidade', largura: 0.14 },
            ]}
            linhas={visao.escopos.map((s) => [
              s.planejamento ? `${s.nome} (planejamento)` : s.nome,
              `${s.codigoContrato} · ${s.contratante}`,
              s.status,
              s.prioridade,
              s.criticidade,
            ])}
            vazio="Nenhum escopo."
          />
        </Secao>

        <Secao titulo="Jornada ELO">
          <Tabela
            colunas={[{ titulo: 'Escopo', largura: 0.25 }, ...ETAPAS.map((etapa) => ({ titulo: etapa, largura: 0.15 }))]}
            linhas={visao.escopos.map((s) => [s.nome, ...ETAPAS.map((etapa) => s.etapas.find((l) => l.etapa === etapa)?.status ?? '—')])}
            vazio="Nenhum escopo."
          />
        </Secao>

        <Secao titulo="Planos de ação">
          <Tabela
            colunas={[
              { titulo: 'Plano', largura: 0.4 },
              { titulo: 'Status', largura: 0.18 },
              { titulo: 'Atividades', largura: 0.14 },
              { titulo: 'Concluídas', largura: 0.14 },
              { titulo: 'Atrasadas', largura: 0.14 },
            ]}
            linhas={visao.planos.map((p) => [p.nome, p.status, String(p.total), String(p.concluidas), String(p.atrasadas)])}
            vazio="Nenhum plano aberto."
          />
        </Secao>

        <Secao titulo="Atividades pendentes">
          <Tabela
            colunas={[
              { titulo: 'Atividade', largura: 0.38 },
              { titulo: 'Prazo', largura: 0.14 },
              { titulo: 'Responsável', largura: 0.2 },
              { titulo: 'Executor', largura: 0.28 },
            ]}
            linhas={pendentes.map((a) => [
              a.situacao ? `${a.nome} (${a.situacao})` : a.nome,
              formatarData(a.prazo),
              a.responsavel,
              a.executor || 'O responsável',
            ])}
            vazio="Nenhuma atividade pendente."
          />
        </Secao>

        <Secao titulo="Demandas">
          <Text style={{ marginBottom: 4 }}>
            {visao.demandas.porStatus
              .filter((s) => s.total > 0)
              .map((s) => `${s.status}: ${s.total}`)
              .join(' · ') || 'Nenhuma demanda.'}
          </Text>
          <Tabela
            colunas={[
              { titulo: 'Número', largura: 0.18 },
              { titulo: 'Assunto', largura: 0.42 },
              { titulo: 'Criticidade', largura: 0.2 },
              { titulo: 'Prazo', largura: 0.2 },
            ]}
            linhas={visao.demandas.abertas.map((d) => [
              d.numero,
              d.assunto,
              d.criticidade ?? 'Na triagem',
              d.prazo ? `${formatarData(d.prazo)}${d.vencida ? ' (vencida)' : ''}` : 'Sem prazo',
            ])}
            vazio="Nenhuma demanda aberta."
          />
        </Secao>

        <Secao titulo="Entregas realizadas (últimos 30 dias)">
          <Tabela colunas={colunasItens} linhas={itens(visao.entregas)} vazio="Nenhuma entrega nos últimos 30 dias." />
        </Secao>
        <Secao titulo="Próximos prazos (próximos 30 dias)">
          <Tabela colunas={colunasItens} linhas={itens(visao.proximosPrazos)} vazio="Nenhum prazo nos próximos 30 dias." />
        </Secao>
        <Secao titulo="Pendências">
          <Tabela colunas={colunasItens} linhas={itens(visao.pendencias)} vazio="Nenhuma pendência." />
        </Secao>

        <Secao titulo="Maturidade">
          {visao.maturidade ? (
            <Tabela
              colunas={[
                { titulo: 'Dimensão', largura: 0.4 },
                { titulo: `Inicial (${formatarData(visao.maturidade.inicial.data)})`, largura: 0.3 },
                { titulo: `Atual (${formatarData(visao.maturidade.atual.data)})`, largura: 0.3 },
              ]}
              linhas={[
                ['Maturidade geral', visao.maturidade.inicial.maturidadeGeral ?? '—', visao.maturidade.atual.maturidadeGeral ?? '—'],
                ['Prontidão', visao.maturidade.inicial.prontidao ?? '—', visao.maturidade.atual.prontidao ?? '—'],
                ...visao.maturidade.atual.dimensoes.map((d) => [
                  d.dimensao,
                  visao.maturidade!.inicial.dimensoes.find((x) => x.dimensao === d.dimensao)?.nivel ?? 'Não avaliada',
                  d.nivel,
                ]),
              ]}
              vazio=""
            />
          ) : (
            <Text style={e.vazio}>Nenhuma avaliação de maturidade concluída.</Text>
          )}
        </Secao>

        {visao.textos.map((t) => (
          <Secao key={t.campo} titulo={t.titulo}>
            {t.texto ? (
              <>
                <Text style={e.paragrafo}>{t.texto}</Text>
                {t.atualizadoEm ? (
                  <Text style={e.autor}>
                    Atualizado por {t.atualizadoPor} em {formatarDataHora(t.atualizadoEm)}
                  </Text>
                ) : null}
              </>
            ) : (
              <Text style={e.vazio}>Ainda não escrito.</Text>
            )}
          </Secao>
        ))}

        <View style={e.rodape} fixed>
          <Text>ELO Governança Inteligente · Visão Executiva de {visao.cliente.nome}</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
