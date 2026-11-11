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

/** Janela de confirmação. O `children` é o gatilho. */
export function ConfirmarAcao({
  titulo,
  descricao,
  rotuloConfirmar,
  perigo,
  onConfirmar,
  children,
}: {
  titulo: string
  descricao?: string
  rotuloConfirmar: string
  perigo?: boolean
  onConfirmar: () => void
  children: React.ReactElement
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent {...(descricao ? {} : { 'aria-describedby': undefined })}>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          {descricao ? <AlertDialogDescription>{descricao}</AlertDialogDescription> : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant={perigo ? 'destructive' : 'default'} onClick={onConfirmar}>
            {rotuloConfirmar}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/** Aviso dentro da página, com borda âmbar, para confirmar um salvamento atípico. */
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
      <AlertDescription className="text-foreground">{mensagem}</AlertDescription>
      <div className="mt-2 flex gap-2">
        <Button onClick={onConfirmar}>Salvar mesmo assim</Button>
        <Button variant="outline" onClick={onRevisar}>Revisar</Button>
      </div>
    </Alert>
  )
}
