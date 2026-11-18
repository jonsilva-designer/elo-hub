'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { Campo } from '@/components/elo/campo'
import { ListaImpedimentos } from '@/components/elo/confirmacao'
import { Painel } from '@/components/elo/painel'
import { SelecaoDoFormulario } from '@/components/elo/selecao-do-formulario'
import { SelecaoMultipla } from '@/components/elo/selecao-multipla'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { avisarSalvo } from '@/lib/avisos'
import type { UsuarioDetalhado } from '@/lib/dados/usuarios-configuracao'
import { salvarUsuario } from '@/lib/usuarios/acoes'
import { ESTADO_INICIAL_USUARIO } from '@/lib/usuarios/estados'
import { PERFIS } from '@/lib/usuarios/validacao'

/**
 * Cadastro e edição do usuário (parte 8, 4.1; F01): nome, e-mail, perfil e, na Equipe, os clientes vinculados (DF-23).
 * Quem confere tudo é o servidor: o e-mail único, o último Administrador (DF-37) e os vínculos com itens abertos, que
 * voltam listados (DF-36). Com `noValidate`, valem as mensagens da plataforma.
 */
export function FormularioUsuario({
  usuario,
  clientes,
}: {
  usuario: UsuarioDetalhado | null
  clientes: { valor: string; rotulo: string }[]
}) {
  const router = useRouter()
  const [estado, enviar, enviando] = useActionState(salvarUsuario, ESTADO_INICIAL_USUARIO)
  const [perfil, setPerfil] = useState<string>(usuario?.perfil ?? '')
  const [clienteIds, setClienteIds] = useState<string[]>(usuario?.clientes.map((c) => c.id) ?? [])

  useEffect(() => {
    if (!estado.sucesso) return
    avisarSalvo(estado.sucesso.mensagem)
    router.push(estado.sucesso.destino)
  }, [estado, router])

  // Depois de um erro, o React limpa o formulário: o valor padrão devolve o que foi digitado.
  const inicial = (campo: 'nome' | 'email') => estado.valores?.[campo] ?? usuario?.[campo] ?? ''
  const erros = estado.erros
  const voltar = usuario ? `/configuracoes/usuarios/${usuario.id}` : '/configuracoes/usuarios'

  return (
    <form action={enviar} noValidate className="space-y-5">
      {usuario ? <input type="hidden" name="id" value={usuario.id} /> : null}
      {perfil === 'Equipe' ? clienteIds.map((c) => <input key={c} type="hidden" name="clienteIds" value={c} />) : null}
      {estado.erroGeral ? (
        <Alert variant="destructive">
          <AlertDescription>
            <span className="block">{estado.erroGeral}</span>
            {estado.impedimentos ? (
              <span className="mt-2 block">
                <ListaImpedimentos itens={estado.impedimentos} />
              </span>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}

      <Painel titulo="Usuário">
        <div className="space-y-4">
          <Campo rotulo="Nome" obrigatorio erro={erros.nome}>
            {(p) => <Input {...p} name="nome" defaultValue={inicial('nome')} />}
          </Campo>
          <Campo rotulo="E-mail" obrigatorio erro={erros.email} ajuda="O login da pessoa. O convite para definir a senha sai para ele.">
            {(p) => <Input {...p} name="email" type="email" defaultValue={inicial('email')} />}
          </Campo>
          <Campo rotulo="Perfil" obrigatorio erro={erros.perfil}>
            {(p) => (
              <SelecaoDoFormulario nome="perfil" valor={perfil} aoMudar={setPerfil} opcoes={PERFIS} atributos={p} className="w-full sm:w-52" />
            )}
          </Campo>
          {perfil === 'Equipe' ? (
            <Campo rotulo="Clientes vinculados" obrigatorio erro={erros.clienteIds} ajuda="A Equipe vê só os clientes vinculados">
              {(p) => (
                <SelecaoMultipla
                  {...p}
                  opcoes={clientes}
                  valores={clienteIds}
                  onChange={setClienteIds}
                  placeholder="Escolha os clientes"
                />
              )}
            </Campo>
          ) : null}
        </div>
      </Painel>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" carregando={enviando}>
          {usuario ? 'Salvar' : 'Cadastrar e enviar o convite'}
        </Button>
        <Link href={voltar} className={buttonVariants({ variant: 'outline' })}>
          Cancelar
        </Link>
      </div>
    </form>
  )
}
