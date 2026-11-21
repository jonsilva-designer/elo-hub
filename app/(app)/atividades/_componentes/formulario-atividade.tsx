'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useRef, useState } from 'react'
import { Campo } from '@/components/elo/campo'
import { CampoData } from '@/components/elo/campo-data'
import { AvisoConfirmacao } from '@/components/elo/confirmacao'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { SelecaoDoFormulario } from '@/components/elo/selecao-do-formulario'
import { ValorFixo } from '@/components/elo/textos'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { salvarAtividade } from '@/lib/atividades/acoes'
import { ESTADO_INICIAL_SALVAR_ATIVIDADE, type EstadoSalvarAtividade } from '@/lib/atividades/estados'
import { destinosDaAtividade, reaberturaDaAtividade } from '@/lib/atividades/regras'
import type { DadosAtividade } from '@/lib/atividades/validacao'
import { avisarSalvo } from '@/lib/avisos'
import type { AtividadeDetalhada, Perfil, StatusAtividade } from '@/lib/dados/tipos'
import { PRIORIDADES } from '@/lib/escopos/regras'
import { formatarData } from '@/lib/formato'
import { enderecoDasMinhasAtividades, useEnderecoDasMinhasAtividades } from './voltar-para-minhas-atividades'

type Opcao = { valor: string; rotulo: string }

/** O texto de ajuda do status: o que acontece com a data de conclusão (DF-43, CN-22.2). */
function ajudaDoStatus(atual: StatusAtividade | null, novo: string): string | undefined {
  if (atual && reaberturaDaAtividade(atual, novo as StatusAtividade)) {
    return atual === 'Concluída' ? 'A data de conclusão é apagada na reabertura.' : undefined
  }
  if (novo === 'Concluída' && atual !== 'Concluída') return 'A data de conclusão é registrada ao salvar.'
  return undefined
}

/**
 * Cadastro e edição da atividade (parte 4, 5.7). O plano e o cliente são só leitura: a atividade nasce no plano e
 * herda o cliente (RN-02). O status oferece só os destinos do perfil (6.1), e a reabertura do Administrador pede
 * justificativa (RN-22). O prazo depois do prazo do plano ou da vigência mostra o aviso da RN-21 (na edição, só quando
 * o prazo muda). Quem confere tudo é o servidor; com `noValidate`, valem as mensagens da plataforma.
 */
export function FormularioAtividade({
  atividade,
  plano,
  perfil,
  responsaveis,
  origem,
}: {
  atividade: AtividadeDetalhada | null
  plano: { id: string; nome: string; nomeCliente: string }
  perfil: Perfil
  /** As pessoas que podem ser responsáveis no cliente do plano (RN-19). */
  responsaveis: Opcao[]
  /** Aberta a partir de Minhas atividades: volta para lá. */
  origem: 'minhas-atividades' | null
}) {
  const router = useRouter()
  const [estado, enviar, enviando] = useActionState(salvarAtividade, ESTADO_INICIAL_SALVAR_ATIVIDADE)
  const formulario = useRef<HTMLFormElement>(null)
  const confirmacao = useRef<HTMLInputElement>(null)
  const [avisoRevisado, setAvisoRevisado] = useState<EstadoSalvarAtividade | null>(null)
  const [responsavel, setResponsavel] = useState(atividade?.responsavelId ?? '')
  const [prazo, setPrazo] = useState<string | null>(atividade?.prazo ?? null)
  const [prioridade, setPrioridade] = useState<string>(atividade?.prioridade ?? '')
  const [status, setStatus] = useState<string>(atividade?.status ?? 'Não iniciada')

  useEffect(() => {
    if (!estado.sucesso) return
    avisarSalvo(estado.sucesso.mensagem)
    // Volta para Minhas atividades com os filtros que estavam aplicados (CA-16.2, revisão do código).
    router.push(estado.sucesso.destino === '/minhas-atividades' ? enderecoDasMinhasAtividades() : estado.sucesso.destino)
  }, [estado, router])

  // Depois de um erro ou do aviso, o React limpa o formulário: o valor padrão devolve o que foi digitado.
  const inicial = (campo: keyof Omit<DadosAtividade, 'confirmarAviso'>, daAtividade?: string) =>
    estado.valores?.[campo] ?? daAtividade ?? ''
  const erros = estado.erros
  const atual = atividade?.status ?? null
  const reabre = atual !== null && reaberturaDaAtividade(atual, status as StatusAtividade)
  const mostrarAviso = estado.aviso !== undefined && avisoRevisado !== estado
  const enderecoDaLista = useEnderecoDasMinhasAtividades()
  const destino = origem === 'minhas-atividades' ? enderecoDaLista : `/planos/${plano.id}`

  /** "Salvar mesmo assim": envia de novo o que está na tela, agora com a confirmação (RN-21). */
  function confirmarAviso() {
    if (confirmacao.current) confirmacao.current.value = 'sim'
    formulario.current?.requestSubmit()
  }

  return (
    <form ref={formulario} action={enviar} noValidate className="space-y-5">
      {atividade ? <input type="hidden" name="id" value={atividade.id} /> : null}
      <input type="hidden" name="planoId" value={plano.id} />
      {origem ? <input type="hidden" name="origem" value={origem} /> : null}
      <input ref={confirmacao} type="hidden" name="confirmarAviso" defaultValue="" />
      {estado.erroGeral ? (
        <Alert variant="destructive">
          <AlertDescription>{estado.erroGeral}</AlertDescription>
        </Alert>
      ) : null}

      <Painel titulo="Atividade">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Plano" grupo>
              {() => <ValorFixo>{plano.nome}</ValorFixo>}
            </Campo>
            <Campo rotulo="Cliente" grupo>
              {() => <ValorFixo>{plano.nomeCliente}</ValorFixo>}
            </Campo>
          </div>
          {atividade ? (
            <Campo rotulo="Criada em" grupo>
              {() => (
                <ValorFixo>
                  <Num>{formatarData(atividade.criadaEm)}</Num>
                </ValorFixo>
              )}
            </Campo>
          ) : null}
          <Campo rotulo="Nome" obrigatorio erro={erros.nome}>
            {(p) => <Input {...p} name="nome" defaultValue={inicial('nome', atividade?.nome)} />}
          </Campo>
          <Campo rotulo="Descrição">
            {(p) => <Textarea {...p} name="descricao" defaultValue={inicial('descricao', atividade?.descricao)} />}
          </Campo>
          <Campo rotulo="Responsável ELO" obrigatorio erro={erros.responsavelId} ajuda="Responde pela atividade e recebe os alertas">
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
          <Campo rotulo="Executor" ajuda="Quem executa, quando não é o responsável: pessoa do cliente ou especialista">
            {(p) => <Input {...p} name="executor" defaultValue={inicial('executor', atividade?.executor)} />}
          </Campo>
        </div>
      </Painel>

      <Painel titulo="Prazo e andamento">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Prazo" obrigatorio erro={erros.prazo}>
              {(p) => (
                <>
                  <CampoData
                    {...p}
                    valor={prazo}
                    onChange={(novo) => {
                      setPrazo(novo)
                      // O prazo mudou depois do aviso: o aviso sai, e o prazo novo é conferido de novo ao salvar (RN-21).
                      if (mostrarAviso) setAvisoRevisado(estado)
                    }}
                  />
                  <input type="hidden" name="prazo" value={prazo ?? ''} />
                </>
              )}
            </Campo>
            <Campo rotulo="Prioridade" obrigatorio erro={erros.prioridade}>
              {(p) => (
                <SelecaoDoFormulario
                  nome="prioridade"
                  valor={prioridade}
                  aoMudar={setPrioridade}
                  opcoes={PRIORIDADES}
                  atributos={p}
                />
              )}
            </Campo>
          </div>
          <Campo rotulo="Status" obrigatorio erro={erros.status} ajuda={ajudaDoStatus(atual, status)}>
            {(p) => (
              <SelecaoDoFormulario
                nome="status"
                valor={status}
                aoMudar={setStatus}
                opcoes={destinosDaAtividade(atual, perfil)}
                atributos={p}
                className="w-full sm:w-52"
              />
            )}
          </Campo>
          {atividade?.status === 'Concluída' && atividade.conclusao ? (
            // A data de conclusão é registrada pela plataforma, e aparece junto do prazo (DF-43, CA-08.6).
            <p className="text-secundario text-muted-foreground">
              <span>Concluída em</span> <Num>{formatarData(atividade.conclusao)}</Num>
            </p>
          ) : null}
          {reabre ? (
            <Campo rotulo="Justificativa" obrigatorio ajuda="A reabertura fica no histórico com o motivo." erro={erros.justificativa}>
              {(p) => <Textarea {...p} name="justificativa" defaultValue={inicial('justificativa')} />}
            </Campo>
          ) : null}
        </div>
      </Painel>

      <Painel titulo="Outros">
        <div className="space-y-4">
          <Campo rotulo="Observações">
            {(p) => <Textarea {...p} name="observacoes" defaultValue={inicial('observacoes', atividade?.observacoes)} />}
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
