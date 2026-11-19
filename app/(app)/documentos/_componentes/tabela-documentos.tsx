'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { EtiquetaStatus } from '@/components/elo/etiquetas'
import { Num } from '@/components/elo/num'
import { TabelaDados, type Coluna } from '@/components/elo/tabela-dados'
import { Apagado, TextoComDetalhe } from '@/components/elo/textos'
import type { DocumentoDetalhado } from '@/lib/dados/tipos'
import { formatarData } from '@/lib/formato'

/** O nome e, embaixo, a categoria: as duas coisas que dizem o que é o documento. */
export function NomeDoDocumento({ documento }: { documento: DocumentoDetalhado }) {
  return (
    <TextoComDetalhe texto={documento.nome} detalhes={[documento.categoria]} />
  )
}

/** O status e, no inativo, a etiqueta Inativo ao lado (RN-24: sinal à parte do status). */
export function StatusDoDocumento({ documento }: { documento: DocumentoDetalhado }) {
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <EtiquetaStatus status={documento.status} />
      {documento.inativo ? <EtiquetaStatus status="Inativo" /> : null}
    </span>
  )
}

function colunas(comEtapa: boolean): Coluna<DocumentoDetalhado>[] {
  return [
    {
      id: 'documento',
      titulo: 'Documento',
      largura: 'w-1/2',
      ordenarPor: (d) => d.nome,
      celula: (d) => <NomeDoDocumento documento={d} />,
    },
    ...(comEtapa
      ? [
          {
            id: 'etapa',
            titulo: 'Etapa',
            ordenarPor: (d: DocumentoDetalhado) => d.etapa,
            celula: (d: DocumentoDetalhado) => d.etapa ?? <Apagado>Sem etapa</Apagado>,
          },
        ]
      : []),
    { id: 'data', titulo: 'Data', ordenarPor: (d) => d.data, celula: (d) => <Num>{formatarData(d.data)}</Num> },
    { id: 'status', titulo: 'Status', ordenarPor: (d) => d.status, celula: (d) => <StatusDoDocumento documento={d} /> },
  ]
}

/**
 * Os documentos ligados a um registro (parte 6, 4.4; CA-12.3), na ordem em que chegam: do mais recente para o mais
 * antigo. No escopo, a coluna Etapa diz em que etapa da Jornada o documento entrou. A linha abre o documento.
 */
export function TabelaDocumentos({
  documentos,
  comEtapa = false,
  vazio,
}: {
  documentos: DocumentoDetalhado[]
  comEtapa?: boolean
  vazio: ReactNode
}) {
  const router = useRouter()
  return (
    <TabelaDados
      colunas={colunas(comEtapa)}
      linhas={documentos}
      chave={(d) => d.id}
      aoClicarLinha={(d) => router.push(`/documentos/${d.id}`)}
      vazio={vazio}
    />
  )
}
