import type { Metadata } from 'next'
import { MolduraAcesso } from '@/components/elo/moldura-acesso'
import { FormularioDefinirSenha } from './_componentes/formulario-definir-senha'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Definir senha | Plataforma ELO' }

// A mesma tela serve ao convite de um usuário novo e à redefinição de senha (DF-04).
export default function PaginaDefinirSenha() {
  return (
    <MolduraAcesso
      titulo="Definir senha"
      descricao="Crie a senha que você vai usar para entrar na Plataforma ELO. Use pelo menos 8 caracteres."
    >
      <FormularioDefinirSenha />
    </MolduraAcesso>
  )
}
