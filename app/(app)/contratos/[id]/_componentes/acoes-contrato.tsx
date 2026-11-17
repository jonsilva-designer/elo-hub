'use client'

import { MoreHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { BotaoIcone } from '@/components/elo/botao-icone'
import { Campo } from '@/components/elo/campo'
import { ConfirmarAcao, ListaImpedimentos } from '@/components/elo/confirmacao'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { avisarSalvo } from '@/lib/avisos'
import { cancelarContrato, encerrarContrato, excluirContrato, reabrirContrato } from '@/lib/contratos/acoes'
import { STATUS_ABERTOS } from '@/lib/contratos/regras'
import type { ContratoDetalhado, ItemQueImpede, StatusContrato } from '@/lib/dados/tipos'
import type { ResultadoAcao } from '@/lib/resultado-acao'

type Janela = 'encerrar' | 'cancelar' | 'reabrir' | 'excluir' | null

const SEM_JUSTIFICATIVA = {
  reabrir: 'Escreva a justificativa da reabertura.',
  excluir: 'Escreva a justificativa da exclusão.',
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
 * Menu de ações do contrato, só do Administrador (parte 3, 5.6): Encerrar (Ativo, Suspenso), Cancelar (Proposta,
 * Em contratação), Reabrir (Encerrado, Cancelado) e Excluir quando não há nada ligado. Cada item abre uma janela
 * de confirmação. No protótipo, nada é gravado: depois do aviso, a tela continua igual, menos na exclusão, que
 * volta à lista.
 */
export function AcoesContrato({
  contrato,
  impedimentos,
  podeExcluir,
}: {
  contrato: ContratoDetalhado
  impedimentos: ItemQueImpede[]
  podeExcluir: boolean
}) {
  const router = useRouter()
  const [janela, setJanela] = useState<Janela>(null)
  const [pendente, iniciar] = useTransition()
  const [recusa, setRecusa] = useState<string | null>(null)
  const [justificativa, setJustificativa] = useState('')
  const [erroJustificativa, setErroJustificativa] = useState<string | undefined>()
  const [statusDestino, setStatusDestino] = useState<StatusContrato>('Proposta')

  function abrir(qual: Exclude<Janela, null>) {
    setRecusa(null)
    setJustificativa('')
    setErroJustificativa(undefined)
    setStatusDestino('Proposta')
    setJanela(qual)
  }

  function aoMudarAberto(aberto: boolean) {
    if (!aberto && !pendente) setJanela(null)
  }

  function executar(acao: () => Promise<ResultadoAcao>, depois?: () => void) {
    setRecusa(null)
    iniciar(async () => {
      const resultado = await acao()
      if (resultado.ok) {
        avisarSalvo(resultado.mensagem)
        setJanela(null)
        depois?.()
      } else {
        setRecusa(resultado.mensagem)
      }
    })
  }

  /** Justificativa obrigatória: sem ela, o erro aparece no campo e o servidor não é chamado. */
  function comJustificativa(qual: 'reabrir' | 'excluir', acao: () => void) {
    if (!justificativa.trim()) {
      setErroJustificativa(SEM_JUSTIFICATIVA[qual])
      return
    }
    setErroJustificativa(undefined)
    acao()
  }

  const { status } = contrato
  const podeEncerrar = status === 'Ativo' || status === 'Suspenso'
  const podeCancelar = status === 'Proposta' || status === 'Em contratação'
  const podeReabrir = status === 'Encerrado' || status === 'Cancelado'
  const bloqueado = impedimentos.length > 0

  const campoJustificativa = (
    <Campo rotulo="Justificativa" obrigatorio erro={erroJustificativa}>
      {(p) => <Textarea {...p} value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />}
    </Campo>
  )

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <BotaoIcone rotulo="Mais ações" icone={MoreHorizontal} variant="outline" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {podeEncerrar ? <DropdownMenuItem onSelect={() => abrir('encerrar')}>Encerrar</DropdownMenuItem> : null}
          {podeCancelar ? <DropdownMenuItem onSelect={() => abrir('cancelar')}>Cancelar</DropdownMenuItem> : null}
          {podeReabrir ? <DropdownMenuItem onSelect={() => abrir('reabrir')}>Reabrir</DropdownMenuItem> : null}
          {podeExcluir ? (
            <DropdownMenuItem variant="destructive" onSelect={() => abrir('excluir')}>
              Excluir
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {(['encerrar', 'cancelar'] as const).map((qual) => {
        const encerrar = qual === 'encerrar'
        const verbo = encerrar ? 'encerrar' : 'cancelar'
        return bloqueado ? (
          <ConfirmarAcao
            key={qual}
            titulo={`Não é possível ${verbo}`}
            descricao={`Não é possível ${verbo} este contrato enquanto houver escopos ou demandas abertos.`}
            rotuloConfirmar={encerrar ? 'Encerrar' : 'Cancelar contrato'}
            bloqueado
            onConfirmar={() => {}}
            conteudo={<ListaImpedimentos itens={impedimentos} />}
            aberto={janela === qual}
            aoMudarAberto={aoMudarAberto}
          />
        ) : (
          <ConfirmarAcao
            key={qual}
            titulo={encerrar ? 'Encerrar contrato?' : 'Cancelar contrato?'}
            descricao={
              encerrar
                ? 'O contrato vigorou e terminou. Ele sai dos alertas de vencimento.'
                : 'O contrato ou a proposta não chegou a vigorar.'
            }
            // O botão que fecha a janela já se chama "Cancelar".
            rotuloConfirmar={encerrar ? 'Encerrar' : 'Cancelar contrato'}
            onConfirmar={() => executar(() => (encerrar ? encerrarContrato(contrato.id) : cancelarContrato(contrato.id)))}
            conteudo={recusa ? <Recusa mensagem={recusa} /> : undefined}
            aberto={janela === qual}
            aoMudarAberto={aoMudarAberto}
            carregando={pendente}
          />
        )
      })}

      <ConfirmarAcao
        titulo="Reabrir contrato?"
        descricao="Escolha o status de volta e escreva o motivo."
        rotuloConfirmar="Reabrir"
        onConfirmar={() =>
          comJustificativa('reabrir', () => executar(() => reabrirContrato(contrato.id, statusDestino, justificativa)))
        }
        conteudo={
          <div className="space-y-3">
            <Campo rotulo="Status de volta" grupo>
              {(p) => (
                <RadioGroup {...p} value={statusDestino} onValueChange={(v) => setStatusDestino(v as StatusContrato)}>
                  {STATUS_ABERTOS.map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <RadioGroupItem id={`reabrir-${s}`} value={s} />
                      <Label htmlFor={`reabrir-${s}`} className="font-normal">
                        {s}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </Campo>
            {campoJustificativa}
            <Recusa mensagem={recusa} />
          </div>
        }
        aberto={janela === 'reabrir'}
        aoMudarAberto={aoMudarAberto}
        carregando={pendente}
      />

      <ConfirmarAcao
        titulo="Excluir contrato?"
        descricao="A exclusão é definitiva. Escreva o motivo."
        rotuloConfirmar="Excluir"
        perigo
        onConfirmar={() =>
          comJustificativa('excluir', () =>
            executar(
              () => excluirContrato(contrato.id, justificativa),
              () => router.push('/contratos'),
            ),
          )
        }
        conteudo={
          <div className="space-y-3">
            {campoJustificativa}
            <Recusa mensagem={recusa} />
          </div>
        }
        aberto={janela === 'excluir'}
        aoMudarAberto={aoMudarAberto}
        carregando={pendente}
      />
    </>
  )
}
