'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { Campo } from '@/components/elo/campo'
import { Painel } from '@/components/elo/painel'
import { SelecaoDoFormulario } from '@/components/elo/selecao-do-formulario'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { avisarSalvo } from '@/lib/avisos'
import { registrarDemanda } from '@/lib/demandas/acoes'
import { ESTADO_INICIAL_REGISTRAR_DEMANDA } from '@/lib/demandas/estados'
import { ORIGENS_DEMANDA } from '@/lib/demandas/regras'
import type { DadosNovaDemanda } from '@/lib/demandas/validacao'
import { enderecoDaCentral, useEnderecoDaCentral } from '../../_componentes/voltar-para-central'

type Opcao = { valor: string; rotulo: string }

export type ClienteDaNovaDemanda = {
  id: string
  nome: string
  ehCadastroElo: boolean
  visivel: boolean
  responsaveis: Opcao[]
  contratos: Opcao[]
  escopos: (Opcao & { contratoId: string })[]
}

/**
 * Nova demanda (parte 5, 5.9; F09). A Equipe escolhe qualquer cliente Ativo, pelo nome (DF-39). Contrato e escopo só
 * aparecem para o cliente que o usuário vê (RN-01, DF-12). A origem Institucional só no cadastro da ELO (CA-09.15).
 * Quem confere tudo é o servidor; com `noValidate`, valem as mensagens da plataforma.
 */
export function FormularioNovaDemanda({ clientes, usuarioId }: { clientes: ClienteDaNovaDemanda[]; usuarioId: string }) {
  const router = useRouter()
  const [estado, enviar, enviando] = useActionState(registrarDemanda, ESTADO_INICIAL_REGISTRAR_DEMANDA)
  const [clienteId, setClienteId] = useState('')
  const [contratoId, setContratoId] = useState('')
  const [escopoId, setEscopoId] = useState('')
  const [origem, setOrigem] = useState('')
  const [triagem, setTriagem] = useState('')

  const enderecoDaFila = useEnderecoDaCentral()
  useEffect(() => {
    if (!estado.sucesso) return
    avisarSalvo(estado.sucesso.mensagem)
    // Volta para a fila com os filtros que estavam aplicados (CA-16.2, revisão do código).
    router.push(estado.sucesso.destino === '/central' ? enderecoDaCentral() : estado.sucesso.destino)
  }, [estado, router])

  const cliente = clientes.find((c) => c.id === clienteId) ?? null
  const origens = ORIGENS_DEMANDA.filter((o) => (cliente?.ehCadastroElo ? o === 'Institucional' : o !== 'Institucional'))
  const escopos = cliente?.escopos.filter((e) => !contratoId || e.contratoId === contratoId) ?? []
  const inicial = (campo: keyof DadosNovaDemanda) => estado.valores?.[campo] ?? ''
  const erros = estado.erros

  /** Trocar o cliente limpa o que dependia dele e propõe a pessoa que registra para a triagem, quando ela pode. */
  function mudarCliente(id: string) {
    const novo = clientes.find((c) => c.id === id)
    setClienteId(id)
    setContratoId('')
    setEscopoId('')
    setOrigem(novo?.ehCadastroElo ? 'Institucional' : '')
    setTriagem(novo?.responsaveis.some((r) => r.valor === usuarioId) ? usuarioId : '')
  }

  return (
    <form action={enviar} noValidate className="space-y-5">
      {estado.erroGeral ? (
        <Alert variant="destructive">
          <AlertDescription>{estado.erroGeral}</AlertDescription>
        </Alert>
      ) : null}

      <Painel titulo="Demanda">
        <div className="space-y-4">
          <Campo rotulo="Cliente" obrigatorio erro={erros.clienteId}>
            {(p) => (
              <SelecaoDoFormulario
                nome="clienteId"
                valor={clienteId}
                aoMudar={mudarCliente}
                opcoes={clientes.map((c) => ({ valor: c.id, rotulo: c.nome }))}
                atributos={p}
              />
            )}
          </Campo>
          {cliente && !cliente.visivel ? (
            <p className="text-secundario text-muted-foreground">
              Você não vê este cliente: a triagem fica com quem tem vínculo com ele.
            </p>
          ) : null}
          {cliente?.visivel && !cliente.ehCadastroElo ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo rotulo="Contrato" erro={erros.contratoId}>
                {(p) => (
                  <SelecaoDoFormulario
                    nome="contratoId"
                    valor={contratoId}
                    aoMudar={(id) => {
                      setContratoId(id)
                      setEscopoId('')
                    }}
                    opcoes={cliente.contratos}
                    rotuloVazio="Sem contrato"
                    placeholder="Sem contrato"
                    atributos={p}
                  />
                )}
              </Campo>
              <Campo rotulo="Escopo" erro={erros.escopoId}>
                {(p) => (
                  <SelecaoDoFormulario
                    nome="escopoId"
                    valor={escopoId}
                    aoMudar={setEscopoId}
                    opcoes={escopos}
                    rotuloVazio="Sem escopo"
                    placeholder="Sem escopo"
                    atributos={p}
                  />
                )}
              </Campo>
            </div>
          ) : null}
          <Campo rotulo="Origem" obrigatorio erro={erros.origem}>
            {(p) => (
              <SelecaoDoFormulario nome="origem" valor={origem} aoMudar={setOrigem} opcoes={origens} atributos={p} className="w-full sm:w-64" />
            )}
          </Campo>
          <Campo rotulo="Assunto" obrigatorio erro={erros.assunto}>
            {(p) => <Input {...p} name="assunto" defaultValue={inicial('assunto')} />}
          </Campo>
          <Campo rotulo="Descrição" obrigatorio erro={erros.descricao}>
            {(p) => <Textarea {...p} name="descricao" defaultValue={inicial('descricao')} />}
          </Campo>
          <Campo
            rotulo="Responsável pela triagem"
            obrigatorio
            erro={erros.responsavelTriagemId}
            ajuda="Um Administrador ou alguém da equipe vinculado ao cliente"
          >
            {(p) => (
              <SelecaoDoFormulario
                nome="responsavelTriagemId"
                valor={triagem}
                aoMudar={setTriagem}
                opcoes={cliente?.responsaveis ?? []}
                atributos={p}
              />
            )}
          </Campo>
        </div>
      </Painel>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" carregando={enviando}>
          Registrar
        </Button>
        <Link href={enderecoDaFila} className={buttonVariants({ variant: 'outline' })}>
          Cancelar
        </Link>
      </div>
    </form>
  )
}
