'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { Campo } from '@/components/elo/campo'
import { EtiquetaStatus } from '@/components/elo/etiquetas'
import { Painel } from '@/components/elo/painel'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { avisarSalvo } from '@/lib/avisos'
import { salvarCliente } from '@/lib/clientes/acoes'
import { ESTADO_INICIAL_SALVAR_CLIENTE } from '@/lib/clientes/estados'
import type { DadosCliente } from '@/lib/clientes/validacao'
import { formatarCnpj } from '@/lib/cnpj'
import type { Cliente } from '@/lib/dados/tipos'
import { UFS } from '@/lib/ufs'

/** Item "sem valor" das seleções opcionais: a seleção não aceita texto vazio como item. */
const NAO_INFORMADO = 'nao-informado'

/** Seleção opcional ou obrigatória, com o valor num campo oculto para o envio do formulário. */
function SelecaoDoFormulario({
  nome,
  valor,
  aoMudar,
  opcoes,
  opcional,
  atributos,
  className,
}: {
  nome: string
  valor: string
  aoMudar: (valor: string) => void
  opcoes: readonly string[]
  opcional?: boolean
  atributos: Record<string, unknown>
  className?: string
}) {
  return (
    <>
      <Select value={valor} onValueChange={(v) => aoMudar(v === NAO_INFORMADO ? '' : v)}>
        <SelectTrigger {...atributos} className={className ?? 'w-full'}>
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          {opcional ? <SelectItem value={NAO_INFORMADO}>Não informado</SelectItem> : null}
          {opcoes.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input type="hidden" name={nome} value={valor} />
    </>
  )
}

/**
 * Cadastro e edição do cliente (F02, parte 2, 5.5). Quem confere tudo é o servidor; com `noValidate`,
 * valem as mensagens da plataforma. Salvo, mostra o aviso e vai para o destino que a ação devolve.
 */
export function FormularioCliente({ cliente, segmentos }: { cliente: Cliente | null; segmentos: string[] }) {
  const router = useRouter()
  const [estado, enviar, enviando] = useActionState(salvarCliente, ESTADO_INICIAL_SALVAR_CLIENTE)
  const [status, setStatus] = useState<string>(cliente?.status ?? '')
  const [segmento, setSegmento] = useState(cliente?.segmento ?? '')
  const [uf, setUf] = useState(cliente?.uf ?? '')

  useEffect(() => {
    if (!estado.sucesso) return
    avisarSalvo(estado.sucesso.mensagem)
    router.push(estado.sucesso.destino)
  }, [estado, router])

  // Depois de um erro, o React limpa o formulário: o valor padrão devolve o que foi digitado.
  const inicial = (campo: keyof DadosCliente, doCliente?: string) => estado.valores?.[campo] ?? doCliente ?? ''
  const erros = estado.erros
  const destino = cliente ? `/clientes/${cliente.id}` : '/clientes'
  const inativo = cliente?.status === 'Inativo'
  const pedeJustificativa = cliente?.status === 'Ativo' && status === 'Prospect'

  return (
    <form action={enviar} noValidate className="space-y-5">
      {cliente ? <input type="hidden" name="id" value={cliente.id} /> : null}
      {estado.erroGeral ? (
        <Alert variant="destructive">
          <AlertDescription>{estado.erroGeral}</AlertDescription>
        </Alert>
      ) : null}

      <Painel titulo="Empresa">
        <div className="space-y-4">
          <Campo rotulo="Razão Social" obrigatorio erro={erros.razaoSocial}>
            {(p) => <Input {...p} name="razaoSocial" defaultValue={inicial('razaoSocial', cliente?.razaoSocial)} />}
          </Campo>
          <Campo rotulo="Nome Fantasia">
            {(p) => <Input {...p} name="nomeFantasia" defaultValue={inicial('nomeFantasia', cliente?.nomeFantasia)} />}
          </Campo>
          <Campo rotulo="CNPJ" obrigatorio erro={erros.cnpj}>
            {(p) => (
              <Input
                {...p}
                name="cnpj"
                inputMode="numeric"
                placeholder="00.000.000/0000-00"
                className="font-mono"
                defaultValue={inicial('cnpj', cliente ? formatarCnpj(cliente.cnpj) : undefined)}
              />
            )}
          </Campo>
          <Campo rotulo="Segmento">
            {(p) => (
              <SelecaoDoFormulario nome="segmento" valor={segmento} aoMudar={setSegmento} opcoes={segmentos} opcional atributos={p} />
            )}
          </Campo>
          <Campo rotulo="Cidade">
            {(p) => <Input {...p} name="cidade" defaultValue={inicial('cidade', cliente?.cidade)} />}
          </Campo>
          <Campo rotulo="Estado">
            {(p) => (
              <SelecaoDoFormulario
                nome="uf"
                valor={uf}
                aoMudar={setUf}
                opcoes={UFS}
                opcional
                atributos={p}
                className="w-full sm:w-40"
              />
            )}
          </Campo>
          {inativo ? (
            // Só leitura: um grupo com legenda, porque não há controle para o rótulo apontar.
            <Campo rotulo="Status" grupo ajuda="Para reativar, use Reativar na página do cliente">
              {() => (
                <div>
                  <EtiquetaStatus status="Inativo" />
                  <input type="hidden" name="status" value="Inativo" />
                </div>
              )}
            </Campo>
          ) : (
            <Campo rotulo="Status" obrigatorio erro={erros.status}>
              {(p) => (
                <SelecaoDoFormulario
                  nome="status"
                  valor={status}
                  aoMudar={setStatus}
                  opcoes={['Prospect', 'Ativo']}
                  atributos={p}
                  className="w-full sm:w-52"
                />
              )}
            </Campo>
          )}
          {pedeJustificativa ? (
            <Campo
              rotulo="Justificativa"
              obrigatorio
              ajuda="Ativo para Prospect é uma correção: diga o motivo."
              erro={erros.justificativa}
            >
              {(p) => <Textarea {...p} name="justificativa" defaultValue={inicial('justificativa')} />}
            </Campo>
          ) : null}
        </div>
      </Painel>

      <Painel titulo="Contato">
        <div className="space-y-4">
          <Campo rotulo="Contato Principal">
            {(p) => (
              <Input {...p} name="contatoPrincipal" defaultValue={inicial('contatoPrincipal', cliente?.contatoPrincipal)} />
            )}
          </Campo>
          <Campo rotulo="Cargo">
            {(p) => <Input {...p} name="cargo" defaultValue={inicial('cargo', cliente?.cargo)} />}
          </Campo>
          <Campo rotulo="Telefone">
            {(p) => (
              <Input {...p} name="telefone" type="tel" autoComplete="off" defaultValue={inicial('telefone', cliente?.telefone)} />
            )}
          </Campo>
          <Campo rotulo="E-mail" erro={erros.email}>
            {(p) => (
              <Input {...p} name="email" type="email" autoComplete="off" defaultValue={inicial('email', cliente?.email)} />
            )}
          </Campo>
          <Campo rotulo="Observações">
            {(p) => <Textarea {...p} name="observacoes" defaultValue={inicial('observacoes', cliente?.observacoes)} />}
          </Campo>
        </div>
      </Painel>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" carregando={enviando}>
          Salvar
        </Button>
        <Link href={destino} className={buttonVariants({ variant: 'outline' })}>
          Cancelar
        </Link>
      </div>
    </form>
  )
}
