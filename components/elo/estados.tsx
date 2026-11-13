import { CircleAlert, Inbox, Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

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
