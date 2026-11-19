'use client'

import { ChevronDown } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Campo } from '@/components/elo/campo'
import { ConfirmarAcao } from '@/components/elo/confirmacao'
import { LinkTexto, OpcaoRadio } from '@/components/elo/textos'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { RadioGroup } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { avisarSalvo } from '@/lib/avisos'
import type { StatusDemanda } from '@/lib/dados/tipos'
import { corrigirStatusDemanda, mudarStatusDemanda, reabrirDemanda } from '@/lib/demandas/acoes'
import { STATUS_DEMANDA_ABERTOS, type AcaoDemanda } from '@/lib/demandas/regras'
import type { ResultadoAcao } from '@/lib/resultado-acao'

/** Como cada mudança aparece: o item do menu, a janela e, quando há, o campo de texto que ela exige. */
const COMO: Record<AcaoDemanda, { rotulo: string; titulo: string; descricao: string; campo?: { rotulo: string; falta: string } }> = {
  'iniciar-triagem': { rotulo: 'Iniciar triagem', titulo: 'Iniciar a triagem?', descricao: 'A demanda passa a Em triagem.' },
  'iniciar-atendimento': {
    rotulo: 'Iniciar atendimento',
    titulo: 'Iniciar o atendimento?',
    descricao: 'A demanda passa a Em atendimento, com o atendente da triagem.',
  },
  'aguardar-retorno': {
    rotulo: 'Aguardar retorno',
    titulo: 'Aguardar retorno?',
    descricao: 'O prazo continua valendo enquanto a demanda aguarda retorno.',
  },
  'retomar-atendimento': { rotulo: 'Retomar atendimento', titulo: 'Retomar o atendimento?', descricao: 'A demanda volta a Em atendimento.' },
  resolver: {
    rotulo: 'Resolver',
    titulo: 'Resolver a demanda?',
    descricao: 'Registre a solução dada.',
    campo: { rotulo: 'Solução', falta: 'Escreva a solução.' },
  },
  'voltar-ao-atendimento': {
    rotulo: 'Voltar ao atendimento',
    titulo: 'Voltar ao atendimento?',
    descricao: 'Explique por que a demanda resolvida volta: o motivo fica como comentário.',
    campo: { rotulo: 'Motivo', falta: 'Escreva o motivo da volta ao atendimento.' },
  },
  encerrar: {
    rotulo: 'Encerrar',
    titulo: 'Encerrar a demanda?',
    descricao: 'Registre o retorno dado ao cliente. Só o Administrador reabre.',
    campo: { rotulo: 'Retorno ao cliente', falta: 'Escreva o retorno dado ao cliente.' },
  },
  'encerrar-sem-resolver': {
    rotulo: 'Encerrar sem resolver',
    titulo: 'Encerrar sem resolver?',
    descricao: 'Para duplicada ou desistência. A justificativa vai para a solução. Só o Administrador reabre.',
    campo: { rotulo: 'Justificativa', falta: 'Escreva a justificativa do encerramento.' },
  },
  reabrir: {
    rotulo: 'Reabrir',
    titulo: 'Reabrir a demanda?',
    descricao: 'Escolha o status de volta e escreva o motivo. A data de encerramento é apagada.',
    campo: { rotulo: 'Justificativa', falta: 'Escreva a justificativa da reabertura.' },
  },
  'corrigir-status': {
    rotulo: 'Corrigir status',
    titulo: 'Corrigir o status?',
    descricao:
      'Para um status fora das mudanças do menu. Escolha o status certo e escreva o motivo, que fica no histórico com o status anterior e o novo.',
    campo: { rotulo: 'Justificativa', falta: 'Escreva a justificativa da correção.' },
  },
}

/** Recusa do servidor, dentro da janela. */
function Recusa({ mensagem }: { mensagem: string | null }) {
  return mensagem ? (
    <Alert variant="destructive">
      <AlertDescription>{mensagem}</AlertDescription>
    </Alert>
  ) : null
}

/**
 * As mudanças de status da demanda (parte 5, 5.10; PRD 6.1), num menu "Mudar status". Cada uma abre uma janela com o
 * que a transição exige. Iniciar o atendimento sem a triagem completa fica bloqueado, com o que falta (CA-09.2). No
 * protótipo, nada é gravado: depois do aviso, a tela continua igual.
 */
export function AcoesDemanda({
  numero,
  acoes,
  falta,
  correcoes = [],
}: {
  numero: string
  /** As mudanças que valem para o status e para o usuário (acoesDaDemanda). */
  acoes: AcaoDemanda[]
  /** O que falta da triagem para iniciar o atendimento. */
  falta: string[]
  /** Os status para onde o Administrador corrige a demanda (correcoesDaDemanda, RN-22). */
  correcoes?: StatusDemanda[]
}) {
  const [janela, setJanela] = useState<AcaoDemanda | null>(null)
  const [pendente, iniciar] = useTransition()
  const [texto, setTexto] = useState('')
  const [erro, setErro] = useState<string | undefined>()
  const [recusa, setRecusa] = useState<string | null>(null)
  const [statusDeVolta, setStatusDeVolta] = useState<StatusDemanda>('Nova')

  if (acoes.length === 0) return null

  function abrir(acao: AcaoDemanda) {
    setTexto('')
    setErro(undefined)
    setRecusa(null)
    setStatusDeVolta(acao === 'corrigir-status' ? (correcoes[0] ?? 'Nova') : 'Nova')
    setJanela(acao)
  }

  function aoMudarAberto(aberto: boolean) {
    if (!aberto && !pendente) setJanela(null)
  }

  function confirmar(acao: AcaoDemanda) {
    const campo = COMO[acao].campo
    if (campo && !texto.trim()) {
      setErro(campo.falta)
      return
    }
    setErro(undefined)
    setRecusa(null)
    iniciar(async () => {
      const resultado: ResultadoAcao =
        acao === 'reabrir'
          ? await reabrirDemanda(numero, statusDeVolta, texto)
          : acao === 'corrigir-status'
            ? await corrigirStatusDemanda(numero, statusDeVolta, texto)
            : await mudarStatusDemanda(numero, acao, texto)
      if (resultado.ok) {
        avisarSalvo(resultado.mensagem)
        setJanela(null)
      } else {
        setRecusa(resultado.mensagem)
      }
    })
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline">
            Mudar status
            <ChevronDown aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {acoes.map((a) => (
            <DropdownMenuItem key={a} onSelect={() => abrir(a)}>
              {COMO[a].rotulo}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {acoes.map((a) => {
        const como = COMO[a]
        if (a === 'iniciar-atendimento' && falta.length > 0) {
          return (
            <ConfirmarAcao
              key={a}
              titulo="Não é possível iniciar o atendimento"
              descricao={`Falta para iniciar o atendimento: ${falta.join(', ')}.`}
              rotuloConfirmar={como.rotulo}
              bloqueado
              onConfirmar={() => {}}
              conteudo={
                <LinkTexto href={`/central/${numero}/editar`} className="text-sm">
                  Editar a triagem
                </LinkTexto>
              }
              aberto={janela === a}
              aoMudarAberto={aoMudarAberto}
            />
          )
        }
        return (
          <ConfirmarAcao
            key={a}
            titulo={como.titulo}
            descricao={como.descricao}
            rotuloConfirmar={como.rotulo}
            onConfirmar={() => confirmar(a)}
            conteudo={
              como.campo || recusa ? (
                <div className="space-y-3">
                  {a === 'reabrir' || a === 'corrigir-status' ? (
                    <Campo rotulo={a === 'reabrir' ? 'Status de volta' : 'Status certo'} grupo>
                      {(p) => (
                        <RadioGroup {...p} value={statusDeVolta} onValueChange={(v) => setStatusDeVolta(v as StatusDemanda)}>
                          {(a === 'reabrir' ? STATUS_DEMANDA_ABERTOS : correcoes).map((s) => (
                            <OpcaoRadio key={s} id={`${a}-demanda-${s}`} valor={s}>
                              {s}
                            </OpcaoRadio>
                          ))}
                        </RadioGroup>
                      )}
                    </Campo>
                  ) : null}
                  {como.campo ? (
                    <Campo rotulo={como.campo.rotulo} obrigatorio erro={erro}>
                      {(p) => <Textarea {...p} value={texto} onChange={(e) => setTexto(e.target.value)} />}
                    </Campo>
                  ) : null}
                  <Recusa mensagem={recusa} />
                </div>
              ) : undefined
            }
            aberto={janela === a}
            aoMudarAberto={aoMudarAberto}
            carregando={pendente}
          />
        )
      })}
    </>
  )
}
