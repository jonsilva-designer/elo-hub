'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { Campo } from '@/components/elo/campo'
import { CampoData } from '@/components/elo/campo-data'
import { EtiquetaStatus } from '@/components/elo/etiquetas'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { SelecaoDoFormulario } from '@/components/elo/selecao-do-formulario'
import { ValorFixo } from '@/components/elo/textos'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { avisarSalvo } from '@/lib/avisos'
import type { PlanoDetalhado, StatusAvaliacao } from '@/lib/dados/tipos'
import { formatarData } from '@/lib/formato'
import { salvarPlano } from '@/lib/planos/acoes'
import { ESTADO_INICIAL_SALVAR_PLANO } from '@/lib/planos/estados'
import { planoFechado, STATUS_PLANO_ABERTOS } from '@/lib/planos/regras'
import { MENSAGENS_PLANO, type DadosPlano } from '@/lib/planos/validacao'

type Opcao = { valor: string; rotulo: string }

/**
 * Cadastro e edição do plano de ação (parte 4, 5.6). O escopo e o cliente são só leitura: o plano nasce no escopo e
 * herda o cliente (RN-02). Concluir, cancelar e reabrir são ações da página do plano. Quem confere tudo é o
 * servidor; com `noValidate`, valem as mensagens da plataforma.
 */
export function FormularioPlano({
  plano,
  escopo,
  responsaveis,
  avaliacoes,
}: {
  plano: PlanoDetalhado | null
  escopo: { id: string; nome: string; nomeCliente: string }
  /** As pessoas que podem ser responsáveis no cliente do escopo (RN-19). */
  responsaveis: Opcao[]
  /** As avaliações de maturidade do cliente, para a origem do plano (DF-80). */
  avaliacoes: { id: string; data: string; status: StatusAvaliacao }[]
}) {
  const router = useRouter()
  const [estado, enviar, enviando] = useActionState(salvarPlano, ESTADO_INICIAL_SALVAR_PLANO)
  const [responsavel, setResponsavel] = useState(plano?.responsavelId ?? '')
  const [status, setStatus] = useState<string>(plano?.status ?? 'Aberto')
  const [prazo, setPrazo] = useState<string | null>(plano?.prazo ?? null)
  const [avaliacao, setAvaliacao] = useState(plano?.avaliacaoId ?? '')

  useEffect(() => {
    if (!estado.sucesso) return
    avisarSalvo(estado.sucesso.mensagem)
    router.push(estado.sucesso.destino)
  }, [estado, router])

  // Depois de um erro, o React limpa o formulário: o valor padrão devolve o que foi digitado.
  const inicial = (campo: keyof DadosPlano, doPlano?: string) => estado.valores?.[campo] ?? doPlano ?? ''
  const erros = estado.erros
  const fechado = plano ? planoFechado(plano.status) : false
  const destino = plano ? `/planos/${plano.id}` : `/escopos/${escopo.id}`

  return (
    <form action={enviar} noValidate className="space-y-5">
      {plano ? <input type="hidden" name="id" value={plano.id} /> : null}
      <input type="hidden" name="escopoId" value={escopo.id} />
      {estado.erroGeral ? (
        <Alert variant="destructive">
          <AlertDescription>{estado.erroGeral}</AlertDescription>
        </Alert>
      ) : null}

      <Painel titulo="Plano">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Escopo" grupo>
              {() => <ValorFixo>{escopo.nome}</ValorFixo>}
            </Campo>
            <Campo rotulo="Cliente" grupo>
              {() => <ValorFixo>{escopo.nomeCliente}</ValorFixo>}
            </Campo>
          </div>
          {plano ? (
            <Campo rotulo="Criado em" grupo>
              {() => (
                <ValorFixo>
                  <Num>{formatarData(plano.criadoEm)}</Num>
                </ValorFixo>
              )}
            </Campo>
          ) : null}
          <Campo rotulo="Nome" obrigatorio erro={erros.nome}>
            {(p) => <Input {...p} name="nome" defaultValue={inicial('nome', plano?.nome)} />}
          </Campo>
          <Campo rotulo="Descrição">
            {(p) => <Textarea {...p} name="descricao" defaultValue={inicial('descricao', plano?.descricao)} />}
          </Campo>
          <Campo rotulo="Responsável ELO" obrigatorio erro={erros.responsavelId}>
            {(p) => (
              <SelecaoDoFormulario
                nome="responsavelId"
                valor={responsavel}
                aoMudar={setResponsavel}
                opcoes={responsaveis}
                atributos={p}
              />
            )}
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Prazo" erro={erros.prazo}>
              {(p) => (
                <>
                  <CampoData {...p} valor={prazo} onChange={setPrazo} />
                  <input type="hidden" name="prazo" value={prazo ?? ''} />
                </>
              )}
            </Campo>
            {fechado && plano ? (
              // Só leitura: o plano fechado só volta por Reabrir, que pede a justificativa (RN-17, RN-22).
              <Campo rotulo="Status" grupo ajuda={MENSAGENS_PLANO.fechado}>
                {() => (
                  <div>
                    <EtiquetaStatus status={plano.status} />
                    <input type="hidden" name="status" value={plano.status} />
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
                    opcoes={STATUS_PLANO_ABERTOS}
                    atributos={p}
                    className="w-full sm:w-52"
                  />
                )}
              </Campo>
            )}
          </div>
        </div>
      </Painel>

      <Painel titulo="Outros">
        <div className="space-y-4">
          <Campo
            rotulo="Avaliação de maturidade"
            ajuda="Quando o plano é de desenvolvimento: a avaliação do cliente de onde ele saiu"
          >
            {(p) => (
              <SelecaoDoFormulario
                nome="avaliacaoId"
                valor={avaliacao}
                aoMudar={setAvaliacao}
                opcoes={avaliacoes.map((a) => ({
                  valor: a.id,
                  rotulo: (
                    <>
                      Avaliação de <Num>{formatarData(a.data)}</Num>
                      <span aria-hidden="true"> · </span>
                      {a.status}
                    </>
                  ),
                }))}
                rotuloVazio="Sem avaliação"
                placeholder="Sem avaliação"
                atributos={p}
              />
            )}
          </Campo>
          <Campo rotulo="Observações">
            {(p) => <Textarea {...p} name="observacoes" defaultValue={inicial('observacoes', plano?.observacoes)} />}
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
