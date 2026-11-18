import { Plus } from 'lucide-react'
import Link from 'next/link'
import { EstadoVazio } from '@/components/elo/estados'
import { Painel } from '@/components/elo/painel'
import { Button } from '@/components/ui/button'
import type { FiltroDocumentos } from '@/lib/dados/documentos'
import type { DocumentoDetalhado } from '@/lib/dados/tipos'
import { TabelaDocumentos } from './tabela-documentos'

/** O parâmetro do endereço da inclusão para cada vínculo: a inclusão já vem ligada ao registro (parte 6, 3). */
const PARAMETRO: Partial<Record<keyof FiltroDocumentos, string>> = {
  clienteId: 'cliente',
  contratoId: 'contrato',
  escopoId: 'escopo',
  planoId: 'plano',
  atividadeId: 'atividade',
  demandaNumero: 'demanda',
  especialistaId: 'especialista',
  avaliacaoId: 'avaliacao',
}

/**
 * O painel de documentos de um registro (parte 6, 4.4; CA-12.3): os documentos ligados que o usuário vê, sem os
 * inativos (`listarDocumentosLigados`, lido pela página), e "Incluir documento" com o vínculo no endereço. Quem vê
 * o registro pode incluir: o Administrador e a Equipe vinculada; no especialista, a Equipe escolhe um cliente
 * vinculado (DF-65), o que a inclusão confere.
 */
export function PainelDocumentos({
  titulo = 'Documentos',
  documentos,
  ligadoA,
  vazio,
  comEtapa = false,
}: {
  titulo?: string
  documentos: DocumentoDetalhado[]
  /** Um só vínculo: o do registro da tela. */
  ligadoA: FiltroDocumentos
  vazio: string
  comEtapa?: boolean
}) {
  const [chave, valor] = Object.entries(ligadoA)[0] as [keyof FiltroDocumentos, string]
  const href = `/documentos/novo?${PARAMETRO[chave]}=${encodeURIComponent(valor)}`
  return (
    <Painel
      titulo={titulo}
      acao={
        <Button asChild variant="outline">
          <Link href={href}>
            <Plus aria-hidden="true" />
            Incluir documento
          </Link>
        </Button>
      }
      semRespiro
    >
      <TabelaDocumentos documentos={documentos} comEtapa={comEtapa} vazio={<EstadoVazio titulo={vazio} />} />
    </Painel>
  )
}
