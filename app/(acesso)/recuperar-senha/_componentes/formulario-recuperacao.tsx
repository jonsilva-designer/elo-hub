'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { Campo } from '@/components/elo/campo'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { pedirRecuperacao } from '@/lib/acesso/acoes'
import { ESTADO_INICIAL_RECUPERACAO } from '@/lib/acesso/estados'
import { cn } from '@/lib/utils'

const CONFIRMACAO =
  'Se o e-mail estiver cadastrado, enviamos um link para criar uma nova senha. Confira também a caixa de spam.'

/** Pedido do link de nova senha. Depois do envio, o formulário dá lugar à confirmação. */
export function FormularioRecuperacao() {
  const [estado, enviar, enviando] = useActionState(pedirRecuperacao, ESTADO_INICIAL_RECUPERACAO)

  return (
    <div className="space-y-4">
      {estado.enviado ? (
        <p role="status" className="text-sm text-foreground">
          {CONFIRMACAO}
        </p>
      ) : (
        <form action={enviar} noValidate className="space-y-4">
          <Campo rotulo="E-mail" erro={estado.erro}>
            {(p) => (
              <Input
                {...p}
                name="email"
                type="email"
                autoComplete="email"
                placeholder="nome@elogovernance.com.br"
                defaultValue={estado.email}
              />
            )}
          </Campo>
          <Button type="submit" className="w-full" carregando={enviando}>
            Enviar link
          </Button>
        </form>
      )}
      <Link href="/login" className={cn(buttonVariants({ variant: 'link' }), 'h-auto px-0 text-secundario')}>
        Voltar para o login
      </Link>
    </div>
  )
}
