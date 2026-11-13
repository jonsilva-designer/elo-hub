'use client'

import { useActionState } from 'react'
import { Campo } from '@/components/elo/campo'
import { EntradaSenha } from '@/components/elo/entrada-senha'
import { Button } from '@/components/ui/button'
import { definirSenha } from '@/lib/acesso/acoes'
import { ESTADO_INICIAL_DEFINIR_SENHA } from '@/lib/acesso/estados'

/** Nova senha e confirmação. Com tudo certo, a ação leva ao login com o aviso de senha definida. */
export function FormularioDefinirSenha() {
  const [estado, enviar, enviando] = useActionState(definirSenha, ESTADO_INICIAL_DEFINIR_SENHA)

  return (
    <form action={enviar} noValidate className="space-y-4">
      <Campo rotulo="Nova senha" erro={estado.erros.senha}>
        {(p) => <EntradaSenha {...p} name="senha" autoComplete="new-password" />}
      </Campo>
      <Campo rotulo="Confirme a nova senha" erro={estado.erros.confirmacao}>
        {(p) => <EntradaSenha {...p} name="confirmacao" autoComplete="new-password" />}
      </Campo>
      <Button type="submit" className="w-full" carregando={enviando}>
        Salvar senha
      </Button>
    </form>
  )
}
