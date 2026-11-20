'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useRef, useState } from 'react'
import { Campo } from '@/components/elo/campo'
import { CampoData } from '@/components/elo/campo-data'
import { AvisoConfirmacao } from '@/components/elo/confirmacao'
import { EtiquetaCriticidade, EtiquetaStatus } from '@/components/elo/etiquetas'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { SelecaoDoFormulario } from '@/components/elo/selecao-do-formulario'
import { SelecaoMultipla } from '@/components/elo/selecao-multipla'
import { ValorFixo } from '@/components/elo/textos'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { avisarSalvo } from '@/lib/avisos'
import type { EscopoDetalhado, StatusEscopo } from '@/lib/dados/tipos'
import { salvarEscopo } from '@/lib/escopos/acoes'
import { ESTADO_INICIAL_SALVAR_ESCOPO, type EstadoSalvarEscopo } from '@/lib/escopos/estados'
import { CRITICIDADES, escopoFechado, PRIORIDADES, STATUS_ESCOPO_ABERTOS, transicaoListadaEscopo } from '@/lib/escopos/regras'
import { MENSAGENS_ESCOPO, type DadosEscopo } from '@/lib/escopos/validacao'

type Opcao = { valor: string; rotulo: string }

/**
 * Cadastro e edição do escopo (parte 3, 5.8). O contrato e o cliente são só leitura: o escopo nasce no contrato, e
 * mover é uma ação da página. A criticidade se escolhe só no cadastro; na edição, muda por Reclassificar. Quem
 * confere tudo é o servidor; com `noValidate`, valem as mensagens da plataforma.
 */
export function FormularioEscopo({
  escopo,
  contrato,
  responsaveis,
  ciclos,
  especialistas,
}: {
  escopo: EscopoDetalhado | null
  contrato: { id: string; codigo: string; nomeCliente: string }
  /** As pessoas que podem ser responsáveis no cliente do contrato (RN-19). */
  responsaveis: Opcao[]
  /** Os outros escopos do mesmo cliente, para o ciclo anterior (DF-57). */
  ciclos: Opcao[]
  /** Os especialistas Ativos e, na edição, os já ligados, mesmo Inativos (CA-11.2, DF-51). */
  especialistas: Opcao[]
}) {
  // Quem responde pelo escopo hoje continua nas opções, mesmo sem vínculo, para o campo não parecer vazio.
  const opcoesDeResponsavel =
    escopo && !responsaveis.some((r) => r.valor === escopo.responsavelId)
      ? [...responsaveis, { valor: escopo.responsavelId, rotulo: `${escopo.nomeResponsavel} (sem vínculo)` }]
      : responsaveis
  const router = useRouter()
  const [estado, enviar, enviando] = useActionState(salvarEscopo, ESTADO_INICIAL_SALVAR_ESCOPO)
  const formulario = useRef<HTMLFormElement>(null)
  const confirmacao = useRef<HTMLInputElement>(null)
  const [avisoRevisado, setAvisoRevisado] = useState<EstadoSalvarEscopo | null>(null)
  const [responsavel, setResponsavel] = useState(escopo?.responsavelId ?? '')
  const [status, setStatus] = useState<string>(escopo?.status ?? '')
  const [prioridade, setPrioridade] = useState<string>(escopo?.prioridade ?? '')
  const [criticidade, setCriticidade] = useState('')
  const [inicio, setInicio] = useState<string | null>(escopo?.inicio ?? null)
  const [conclusaoPrevista, setConclusaoPrevista] = useState<string | null>(escopo?.conclusaoPrevista ?? null)
  const [cicloAnterior, setCicloAnterior] = useState(escopo?.cicloAnteriorId ?? '')
  const [especialistasEscolhidos, setEspecialistasEscolhidos] = useState<string[]>(escopo?.especialistaIds ?? [])

  useEffect(() => {
    if (!estado.sucesso) return
    avisarSalvo(estado.sucesso.mensagem)
    router.push(estado.sucesso.destino)
  }, [estado, router])

  // Depois de um erro ou do aviso, o React limpa o formulário: o valor padrão devolve o que foi digitado.
  const inicial = (campo: keyof Omit<DadosEscopo, 'confirmarAviso'>, doEscopo?: string) =>
    estado.valores?.[campo] ?? doEscopo ?? ''
  const erros = estado.erros
  const fechado = escopo ? escopoFechado(escopo.status) : false
  const pedeJustificativa =
    escopo !== null && !fechado && status !== '' && !transicaoListadaEscopo(escopo.status, status as StatusEscopo)
  const mostrarAviso = estado.aviso !== undefined && avisoRevisado !== estado
  const destino = escopo ? `/escopos/${escopo.id}` : `/contratos/${contrato.id}`

  /** "Salvar mesmo assim": envia de novo o que está na tela, agora com a confirmação (RN-21). */
  function confirmarAviso() {
    if (confirmacao.current) confirmacao.current.value = 'sim'
    formulario.current?.requestSubmit()
  }

  return (
    <form ref={formulario} action={enviar} noValidate className="space-y-5">
      {escopo ? <input type="hidden" name="id" value={escopo.id} /> : null}
      <input type="hidden" name="contratoId" value={contrato.id} />
      <input ref={confirmacao} type="hidden" name="confirmarAviso" defaultValue="" />
      {estado.erroGeral ? (
        <Alert variant="destructive">
          <AlertDescription>{estado.erroGeral}</AlertDescription>
        </Alert>
      ) : null}

      <Painel titulo="Escopo">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Contrato" grupo>
              {() => (
                <ValorFixo>
                  <Num>{contrato.codigo}</Num>
                </ValorFixo>
              )}
            </Campo>
            <Campo rotulo="Cliente" grupo>
              {() => <ValorFixo>{contrato.nomeCliente}</ValorFixo>}
            </Campo>
          </div>
          <Campo rotulo="Nome" obrigatorio erro={erros.nome}>
            {(p) => <Input {...p} name="nome" defaultValue={inicial('nome', escopo?.nome)} />}
          </Campo>
          <Campo rotulo="Descrição">
            {(p) => <Textarea {...p} name="descricao" defaultValue={inicial('descricao', escopo?.descricao)} />}
          </Campo>
          <Campo rotulo="Responsável ELO" obrigatorio erro={erros.responsavelId}>
            {(p) => (
              <SelecaoDoFormulario
                nome="responsavelId"
                valor={responsavel}
                aoMudar={setResponsavel}
                opcoes={opcoesDeResponsavel}
                atributos={p}
              />
            )}
          </Campo>
          {fechado && escopo ? (
            // Só leitura: o escopo fechado só volta por Reabrir, que pede a justificativa (RN-17, RN-22).
            <Campo rotulo="Status" grupo ajuda={MENSAGENS_ESCOPO.fechado}>
              {() => (
                <div>
                  <EtiquetaStatus status={escopo.status} />
                  <input type="hidden" name="status" value={escopo.status} />
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
                  opcoes={STATUS_ESCOPO_ABERTOS}
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
              ajuda="Esta mudança de status é uma correção: diga o motivo."
              erro={erros.justificativa}
            >
              {(p) => <Textarea {...p} name="justificativa" defaultValue={inicial('justificativa')} />}
            </Campo>
          ) : null}
          <Campo rotulo="Prioridade" obrigatorio erro={erros.prioridade}>
            {(p) => (
              <SelecaoDoFormulario
                nome="prioridade"
                valor={prioridade}
                aoMudar={setPrioridade}
                opcoes={PRIORIDADES}
                atributos={p}
                className="w-full sm:w-52"
              />
            )}
          </Campo>
        </div>
      </Painel>

      <Painel titulo="Criticidade">
        {escopo ? (
          <Campo rotulo="Criticidade" grupo ajuda="Para mudar, use Reclassificar na página do escopo">
            {() => (
              <div>
                <EtiquetaCriticidade criticidade={escopo.criticidade} />
              </div>
            )}
          </Campo>
        ) : (
          <div className="space-y-4">
            <Campo rotulo="Criticidade" obrigatorio erro={erros.criticidade}>
              {(p) => (
                <SelecaoDoFormulario
                  nome="criticidade"
                  valor={criticidade}
                  aoMudar={setCriticidade}
                  opcoes={CRITICIDADES}
                  atributos={p}
                  className="w-full sm:w-52"
                />
              )}
            </Campo>
            <Campo rotulo="Justificativa da criticidade" obrigatorio erro={erros.justificativaCriticidade}>
              {(p) => (
                <Textarea {...p} name="justificativaCriticidade" defaultValue={inicial('justificativaCriticidade')} />
              )}
            </Campo>
          </div>
        )}
      </Painel>

      <Painel titulo="Datas">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Início" erro={erros.inicio}>
            {(p) => (
              <>
                <CampoData {...p} valor={inicio} onChange={setInicio} />
                <input type="hidden" name="inicio" value={inicio ?? ''} />
              </>
            )}
          </Campo>
          <Campo rotulo="Conclusão prevista" erro={erros.conclusaoPrevista}>
            {(p) => (
              <>
                <CampoData {...p} valor={conclusaoPrevista} onChange={setConclusaoPrevista} />
                <input type="hidden" name="conclusaoPrevista" value={conclusaoPrevista ?? ''} />
              </>
            )}
          </Campo>
        </div>
      </Painel>

      <Painel titulo="Outros">
        <div className="space-y-4">
          <Campo rotulo="Especialistas" ajuda="Só especialistas Ativos recebem vínculo novo">
            {(p) => (
              <>
                <SelecaoMultipla
                  {...p}
                  opcoes={especialistas}
                  valores={especialistasEscolhidos}
                  onChange={setEspecialistasEscolhidos}
                  placeholder="Nenhum especialista"
                />
                {especialistasEscolhidos.map((id) => (
                  <input key={id} type="hidden" name="especialistaIds" value={id} />
                ))}
              </>
            )}
          </Campo>
          <Campo rotulo="Ciclo anterior" ajuda="Outro escopo do mesmo cliente, no contrato recorrente">
            {(p) => (
              <SelecaoDoFormulario
                nome="cicloAnteriorId"
                valor={cicloAnterior}
                aoMudar={setCicloAnterior}
                opcoes={ciclos}
                rotuloVazio="Sem ciclo anterior"
                placeholder="Sem ciclo anterior"
                atributos={p}
              />
            )}
          </Campo>
          <Campo rotulo="Observações">
            {(p) => <Textarea {...p} name="observacoes" defaultValue={inicial('observacoes', escopo?.observacoes)} />}
          </Campo>
        </div>
      </Painel>

      {mostrarAviso && estado.aviso ? (
        <AvisoConfirmacao mensagem={estado.aviso} onConfirmar={confirmarAviso} onRevisar={() => setAvisoRevisado(estado)} />
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          carregando={enviando}
          onClick={() => {
            // Envio comum: sem a confirmação do aviso.
            if (confirmacao.current) confirmacao.current.value = ''
          }}
        >
          Salvar
        </Button>
        <Link href={destino} className={buttonVariants({ variant: 'outline' })}>
          Cancelar
        </Link>
      </div>
    </form>
  )
}
