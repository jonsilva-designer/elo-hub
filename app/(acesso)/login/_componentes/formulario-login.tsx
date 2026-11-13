'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { Campo } from '@/components/elo/campo'
import { EntradaSenha } from '@/components/elo/entrada-senha'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { entrar } from '@/lib/acesso/acoes'
import { ESTADO_INICIAL_ENTRAR } from '@/lib/acesso/estados'
import { cn } from '@/lib/utils'

/**
 * Formulário de e-mail e senha. `noValidate`: valem as mensagens da plataforma, e não as do navegador.
 * O React limpa o formulário depois da ação; o `defaultValue` devolve o e-mail digitado ao campo.
 */
export function FormularioLogin({ destino, aviso }: { destino: string; aviso?: string }) {
  const [estado, enviar, enviando] = useActionState(entrar, ESTADO_INICIAL_ENTRAR)

  return (
    <form action={enviar} noValidate className="space-y-4">
      {aviso ? (
        <Alert role="status">
          <AlertDescription className="text-foreground">{aviso}</AlertDescription>
        </Alert>
      ) : null}
      <input type="hidden" name="destino" value={destino} />
      <Campo rotulo="E-mail" erro={estado.erros.email}>
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
      <Campo rotulo="Senha" erro={estado.erros.senha}>
        {(p) => <EntradaSenha {...p} name="senha" autoComplete="current-password" />}
      </Campo>
      <div className="flex justify-end">
        <Link href="/recuperar-senha" className={cn(buttonVariants({ variant: 'link' }), 'h-auto px-0 text-[13px]')}>
          Esqueci minha senha
        </Link>
      </div>
      {estado.erroGeral ? (
        <Alert variant="destructive">
          <AlertDescription>{estado.erroGeral}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" className="w-full" carregando={enviando}>
        Entrar
      </Button>
    </form>
  )
}
