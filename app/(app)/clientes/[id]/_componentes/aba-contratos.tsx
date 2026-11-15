'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BotaoBloqueado } from '@/components/elo/botao-bloqueado'
import { EstadoVazio } from '@/components/elo/estados'
import { EtiquetaPlanejamento, EtiquetaStatus } from '@/components/elo/etiquetas'
import { IndicadorVigencia } from '@/components/elo/indicador-vigencia'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { TabelaDados, type Coluna } from '@/components/elo/tabela-dados'
import { Button } from '@/components/ui/button'
import { ordenarContratos } from '@/lib/contratos/filtros'
import { ehPlanejamento } from '@/lib/contratos/regras'
import { destaqueDaVigencia } from '@/lib/contratos/vigencia'
import type { Cliente, ContratoDetalhado } from '@/lib/dados/tipos'

// As colunas e a ordem da lista de contratos, sem o Cliente, que é o da página (parte 3, 5.11).
const COLUNAS: Coluna<ContratoDetalhado>[] = [
  {
    id: 'contrato',
    titulo: 'Contrato',
    largura: 'w-1/4',
    ordenarPor: (c) => c.codigo,
    celula: (c) => (
      <span className="flex min-w-0 flex-col items-start gap-1">
        <Num className="font-medium text-foreground">{c.codigo}</Num>
        {ehPlanejamento(c.status) ? <EtiquetaPlanejamento /> : null}
      </span>
    ),
  },
  { id: 'contratante', titulo: 'Contratante', largura: 'w-1/4', ordenarPor: (c) => c.contratante, celula: (c) => c.contratante },
  { id: 'status', titulo: 'Status', largura: 'w-1/6', ordenarPor: (c) => c.status, celula: (c) => <EtiquetaStatus status={c.status} /> },
  {
    id: 'vigencia',
    titulo: 'Vigência',
    ordenarPor: (c) => c.termino,
    celula: (c) => <IndicadorVigencia vigencia={c.vigencia} termino={c.termino} tipoVigencia={c.tipoVigencia} />,
  },
]

/** Novo contrato, do Administrador. No cliente Inativo, bloqueado: todo contrato nasce aberto (RN-18). */
function NovoContrato({ cliente }: { cliente: Cliente }) {
  if (cliente.status === 'Inativo') {
    return (
      <BotaoBloqueado variant="outline" motivo="Cliente inativo: reative o cliente para cadastrar contratos">
        Novo contrato
      </BotaoBloqueado>
    )
  }
  return (
    <Button asChild variant="outline">
      <Link href={`/contratos/novo?cliente=${cliente.id}`}>Novo contrato</Link>
    </Button>
  )
}

/** Aba Contratos do cliente (parte 3, 5.11): os contratos dele, como na lista. A linha abre o contrato. */
export function AbaContratos({
  cliente,
  contratos,
  ehAdmin,
}: {
  cliente: Cliente
  contratos: ContratoDetalhado[]
  ehAdmin: boolean
}) {
  const router = useRouter()
  const novo = ehAdmin ? <NovoContrato cliente={cliente} /> : null
  return (
    <Painel titulo="Contratos" acao={novo} semRespiro>
      <TabelaDados
        colunas={COLUNAS}
        linhas={ordenarContratos(contratos)}
        chave={(c) => c.id}
        aoClicarLinha={(c) => router.push(`/contratos/${c.id}`)}
        destaque={destaqueDaVigencia}
        vazio={<EstadoVazio titulo="Nenhum contrato deste cliente." acao={novo ?? undefined} />}
      />
    </Painel>
  )
}
