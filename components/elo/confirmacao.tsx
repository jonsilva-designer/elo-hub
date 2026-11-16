import Link from 'next/link'
import * as React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { EtiquetaStatus } from '@/components/elo/etiquetas'
import { Num } from '@/components/elo/num'
import type { ItemQueImpede } from '@/lib/dados/tipos'

/**
 * Janela de confirmação. O `children` é o gatilho.
 * - `conteudo`: o que vai entre o texto e os botões, como a lista do que impede, uma justificativa ou uma escolha.
 * - `bloqueado`: quando algo impede a ação, só há o botão Fechar.
 * - `aberto` e `aoMudarAberto`: janela controlada. Confirmar chama `onConfirmar` e não fecha sozinha; quem usa
 *   fecha depois que a ação der certo. Assim, ela pode ser aberta por um item de menu, sem gatilho.
 * - `carregando`: o botão de confirmar fica ocupado e não envia de novo.
 */
export function ConfirmarAcao({
  titulo,
  descricao,
  rotuloConfirmar,
  perigo,
  onConfirmar,
  children,
  conteudo,
  bloqueado = false,
  aberto,
  aoMudarAberto,
  carregando = false,
}: {
  titulo: string
  descricao?: string
  rotuloConfirmar: string
  perigo?: boolean
  onConfirmar: () => void
  children?: React.ReactElement
  conteudo?: React.ReactNode
  bloqueado?: boolean
  aberto?: boolean
  aoMudarAberto?: (aberto: boolean) => void
  carregando?: boolean
}) {
  const controlada = aberto !== undefined
  return (
    <AlertDialog {...(controlada ? { open: aberto, onOpenChange: aoMudarAberto } : {})}>
      {children ? <AlertDialogTrigger asChild>{children}</AlertDialogTrigger> : null}
      <AlertDialogContent {...(descricao ? {} : { 'aria-describedby': undefined })}>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          {descricao ? <AlertDialogDescription>{descricao}</AlertDialogDescription> : null}
        </AlertDialogHeader>
        {conteudo ? <div className="min-w-0 text-sm text-foreground">{conteudo}</div> : null}
        <AlertDialogFooter>
          {bloqueado ? (
            <AlertDialogCancel>Fechar</AlertDialogCancel>
          ) : (
            <>
              <AlertDialogCancel disabled={carregando}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                variant={perigo ? 'destructive' : 'default'}
                disabled={carregando}
                aria-busy={carregando || undefined}
                onClick={(evento) => {
                  if (controlada) evento.preventDefault()
                  onConfirmar()
                }}
              >
                {carregando ? <Spinner /> : null}
                {rotuloConfirmar}
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/** Os itens abertos que impedem a ação (RN-18), para o `conteudo` da janela bloqueada: tipo, link, status e responsável. */
export function ListaImpedimentos({ itens }: { itens: ItemQueImpede[] }) {
  return (
    <ul className="divide-y divide-divisoria rounded-xl border border-border">
      {itens.map((item) => (
        <li key={item.href} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5">
          <span className="text-xs text-muted-foreground">{item.tipo}</span>
          <Link href={item.href} className="rounded-sm font-medium text-primary underline-offset-4 hover:underline">
            {item.descricao}
          </Link>
          <EtiquetaStatus status={item.status} />
          <span className="text-secundario text-muted-foreground">{item.responsavel}</span>
        </li>
      ))}
    </ul>
  )
}

/** Aviso dentro da página, com borda âmbar, para confirmar um salvamento atípico. */
/**
 * A mensagem com cada número, como uma data "05/12/2026", em <Num> (JetBrains Mono em todos os números, padrão
 * visual). A mensagem vem pronta do servidor, como o aviso da RN-21.
 */
function comNumeros(texto: string) {
  return texto.split(/(\d(?:[\d/.,:]*\d)?)/).map((parte, i) => (i % 2 === 1 ? <Num key={i}>{parte}</Num> : parte))
}

export function AvisoConfirmacao({
  mensagem,
  onConfirmar,
  onRevisar,
}: {
  mensagem: string
  onConfirmar: () => void
  onRevisar: () => void
}) {
  return (
    <Alert className="border-[var(--elo-status-atencao)]">
      <AlertDescription className="text-foreground">{comNumeros(mensagem)}</AlertDescription>
      {/* type="button": o aviso costuma ficar dentro do formulário que ele confirma, e não deve enviá-lo. */}
      <div className="mt-2 flex gap-2">
        <Button type="button" onClick={onConfirmar}>
          Salvar mesmo assim
        </Button>
        <Button type="button" variant="outline" onClick={onRevisar}>
          Revisar
        </Button>
      </div>
    </Alert>
  )
}
