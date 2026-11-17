'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Campo } from '@/components/elo/campo'
import { ConfirmarAcao } from '@/components/elo/confirmacao'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { excluirAtividade } from '@/lib/atividades/acoes'
import { avisarSalvo } from '@/lib/avisos'

const SEM_JUSTIFICATIVA = 'Escreva a justificativa da exclusão.'

/**
 * "Excluir atividade", só do Administrador, na edição (parte 4, 5.7; DF-33). A exclusão é definitiva e pede a
 * justificativa. No protótipo, nada é gravado: depois do aviso, volta ao plano.
 */
export function ExcluirAtividade({ atividadeId, planoId }: { atividadeId: string; planoId: string }) {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [pendente, iniciar] = useTransition()
  const [justificativa, setJustificativa] = useState('')
  const [erro, setErro] = useState<string | undefined>()
  const [recusa, setRecusa] = useState<string | null>(null)

  function abrir(agora: boolean) {
    if (pendente) return
    if (agora) {
      setJustificativa('')
      setErro(undefined)
      setRecusa(null)
    }
    setAberto(agora)
  }

  function confirmar() {
    if (!justificativa.trim()) {
      setErro(SEM_JUSTIFICATIVA)
      return
    }
    setErro(undefined)
    iniciar(async () => {
      const resultado = await excluirAtividade(atividadeId, justificativa)
      if (resultado.ok) {
        avisarSalvo(resultado.mensagem)
        setAberto(false)
        router.push(`/planos/${planoId}`)
      } else {
        setRecusa(resultado.mensagem)
      }
    })
  }

  return (
    <ConfirmarAcao
      titulo="Excluir atividade?"
      descricao="A exclusão é definitiva. Escreva o motivo."
      rotuloConfirmar="Excluir"
      perigo
      onConfirmar={confirmar}
      conteudo={
        <div className="space-y-3">
          <Campo rotulo="Justificativa" obrigatorio erro={erro}>
            {(p) => <Textarea {...p} value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />}
          </Campo>
          {recusa ? (
            <Alert variant="destructive">
              <AlertDescription>{recusa}</AlertDescription>
            </Alert>
          ) : null}
        </div>
      }
      aberto={aberto}
      aoMudarAberto={abrir}
      carregando={pendente}
    >
      <Button type="button" variant="outline">
        <Trash2 aria-hidden="true" />
        Excluir atividade
      </Button>
    </ConfirmarAcao>
  )
}
