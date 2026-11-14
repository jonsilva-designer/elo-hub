'use client'

import { Check, Pencil, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Campo } from '@/components/elo/campo'
import { ConfirmarAcao } from '@/components/elo/confirmacao'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { avisarSalvo } from '@/lib/avisos'
import type { AvaliacaoMaturidade } from '@/lib/dados/tipos'
import { concluirAvaliacao, reabrirAvaliacao } from '@/lib/maturidade/acoes'
import type { ResultadoAcao } from '@/lib/resultado-acao'

type Janela = 'concluir' | 'reabrir' | null

const SEM_JUSTIFICATIVA = 'Escreva a justificativa da reabertura.'

/** Recusa do servidor, dentro da janela. */
function Recusa({ mensagem }: { mensagem: string | null }) {
  return mensagem ? (
    <Alert variant="destructive">
      <AlertDescription>{mensagem}</AlertDescription>
    </Alert>
  ) : null
}

/**
 * Ações da avaliação, no cabeçalho (parte 2, 5.9). Em elaboração: Editar, para quem pode editar, e Concluir,
 * só para o Administrador. Concluída: Reabrir, só para o Administrador. O servidor confere de novo.
 * No protótipo, nada é gravado: depois do aviso, a tela continua igual.
 */
export function AcoesAvaliacao({
  avaliacao,
  faltando,
  podeEditar,
  ehAdmin,
}: {
  avaliacao: Pick<AvaliacaoMaturidade, 'id' | 'status'>
  faltando: string[]
  podeEditar: boolean
  ehAdmin: boolean
}) {
  const [janela, setJanela] = useState<Janela>(null)
  const [pendente, iniciar] = useTransition()
  const [recusa, setRecusa] = useState<string | null>(null)
  const [justificativa, setJustificativa] = useState('')
  const [erroJustificativa, setErroJustificativa] = useState<string | undefined>()

  function abrir(qual: Exclude<Janela, null>) {
    setRecusa(null)
    setJustificativa('')
    setErroJustificativa(undefined)
    setJanela(qual)
  }

  function aoMudarAberto(aberto: boolean) {
    if (!aberto && !pendente) setJanela(null)
  }

  function executar(acao: () => Promise<ResultadoAcao>) {
    setRecusa(null)
    iniciar(async () => {
      const resultado = await acao()
      if (resultado.ok) {
        avisarSalvo(resultado.mensagem)
        setJanela(null)
      } else {
        setRecusa(resultado.mensagem)
      }
    })
  }

  function reabrir() {
    if (!justificativa.trim()) {
      setErroJustificativa(SEM_JUSTIFICATIVA)
      return
    }
    setErroJustificativa(undefined)
    executar(() => reabrirAvaliacao(avaliacao.id, justificativa))
  }

  const emElaboracao = avaliacao.status === 'Em elaboração'

  return (
    <>
      {podeEditar && emElaboracao ? (
        <Button asChild variant="outline">
          <Link href={`/avaliacoes/${avaliacao.id}/editar`}>
            <Pencil aria-hidden="true" />
            Editar
          </Link>
        </Button>
      ) : null}

      {ehAdmin && emElaboracao ? (
        <>
          <Button type="button" onClick={() => abrir('concluir')}>
            <Check aria-hidden="true" />
            Concluir
          </Button>
          {faltando.length > 0 ? (
            <ConfirmarAcao
              titulo="Não é possível concluir"
              descricao="Para concluir, preencha:"
              rotuloConfirmar="Concluir"
              bloqueado
              onConfirmar={() => {}}
              conteudo={
                <ul className="list-disc space-y-1 pl-5">
                  {faltando.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              }
              aberto={janela === 'concluir'}
              aoMudarAberto={aoMudarAberto}
            />
          ) : (
            <ConfirmarAcao
              titulo="Concluir avaliação?"
              descricao="Depois de concluída, a avaliação não muda. Só o Administrador pode reabri-la."
              rotuloConfirmar="Concluir"
              onConfirmar={() => executar(() => concluirAvaliacao(avaliacao.id))}
              conteudo={recusa ? <Recusa mensagem={recusa} /> : undefined}
              aberto={janela === 'concluir'}
              aoMudarAberto={aoMudarAberto}
              carregando={pendente}
            />
          )}
        </>
      ) : null}

      {ehAdmin && avaliacao.status === 'Concluída' ? (
        <>
          <Button type="button" variant="outline" onClick={() => abrir('reabrir')}>
            <RotateCcw aria-hidden="true" />
            Reabrir
          </Button>
          <ConfirmarAcao
            titulo="Reabrir avaliação?"
            descricao="A avaliação volta para Em elaboração."
            rotuloConfirmar="Reabrir"
            onConfirmar={reabrir}
            conteudo={
              <div className="space-y-3">
                <Campo rotulo="Justificativa" obrigatorio erro={erroJustificativa}>
                  {(p) => <Textarea {...p} value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />}
                </Campo>
                <Recusa mensagem={recusa} />
              </div>
            }
            aberto={janela === 'reabrir'}
            aoMudarAberto={aoMudarAberto}
            carregando={pendente}
          />
        </>
      ) : null}
    </>
  )
}
