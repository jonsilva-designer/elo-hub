import { CircleAlert, Inbox, Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { cn } from '@/lib/utils'

// Os textos padrão destes estados são provisórios (DT-03).

/** Lista ou tabela sem registros. */
export function EstadoVazio({
  titulo,
  descricao,
  acao,
}: {
  titulo: string
  descricao?: string
  acao?: ReactNode
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Inbox aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{titulo}</EmptyTitle>
        {descricao ? <EmptyDescription>{descricao}</EmptyDescription> : null}
      </EmptyHeader>
      {acao ? <EmptyContent>{acao}</EmptyContent> : null}
    </Empty>
  )
}

// Recebe uma função: só pode ser usado a partir de um componente de cliente.
/** Falha ao buscar os dados, com botão para tentar de novo. */
export function ErroCarregamento({
  mensagem = 'Não foi possível carregar.',
  onTentarDeNovo,
}: {
  mensagem?: string
  onTentarDeNovo: () => void
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CircleAlert aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{mensagem}</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={onTentarDeNovo}>
          Tentar de novo
        </Button>
      </EmptyContent>
    </Empty>
  )
}

/** Larguras dos blocos cinza do meio, que se repetem: linhas de tamanhos diferentes, como um texto real. */
const LARGURAS = ['w-3/5', 'w-2/5', 'w-1/2', 'w-2/3']

/**
 * Lista ou painel carregando: blocos cinza no formato de linhas de registro (padrão 7).
 * Serve de espera dos Suspense das telas. O `rotulo` só é lido pelo leitor de tela.
 */
export function Carregando({ linhas = 4, rotulo = 'Carregando' }: { linhas?: number; rotulo?: string }) {
  return (
    <div role="status" aria-busy="true" className="space-y-4 py-2">
      <span className="sr-only">{rotulo}</span>
      {Array.from({ length: linhas }, (_, i) => (
        <div key={i} data-carregando-linha className="flex items-center gap-4">
          <Skeleton className="h-4 w-24 shrink-0" />
          <Skeleton className={cn('h-4', LARGURAS[i % LARGURAS.length])} />
          <Skeleton className="ml-auto h-4 w-16 shrink-0" />
        </div>
      ))}
    </div>
  )
}

/** Perfil sem permissão para a página. */
export function AcessoNegado() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Lock aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>Você não tem acesso a esta página.</EmptyTitle>
      </EmptyHeader>
    </Empty>
  )
}
