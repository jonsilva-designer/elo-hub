'use client'

import { useState, useTransition } from 'react'
import { Campo } from '@/components/elo/campo'
import { ConfirmarAcao } from '@/components/elo/confirmacao'
import { SelecaoDoFormulario } from '@/components/elo/selecao-do-formulario'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { avisarSalvo } from '@/lib/avisos'
import type { EscopoDetalhado } from '@/lib/dados/tipos'
import { reclassificarCriticidade } from '@/lib/escopos/acoes'
import { CRITICIDADES } from '@/lib/escopos/regras'
import { MENSAGENS_ESCOPO } from '@/lib/escopos/validacao'

/**
 * "Reclassificar" do painel Criticidade, só do Administrador e no escopo aberto (F05, CA-05.2). A janela começa na
 * criticidade atual e pede a justificativa, conferida antes de chamar o servidor, com a mesma mensagem dele.
 */
export function ReclassificarCriticidade({ escopo }: { escopo: EscopoDetalhado }) {
  const [aberta, setAberta] = useState(false)
  const [pendente, iniciar] = useTransition()
  const [criticidade, setCriticidade] = useState<string>(escopo.criticidade)
  const [justificativa, setJustificativa] = useState('')
  const [erroJustificativa, setErroJustificativa] = useState<string | undefined>()
  const [recusa, setRecusa] = useState<string | null>(null)

  function aoMudarAberta(aberto: boolean) {
    if (pendente) return
    if (aberto) {
      setCriticidade(escopo.criticidade)
      setJustificativa('')
      setErroJustificativa(undefined)
      setRecusa(null)
    }
    setAberta(aberto)
  }

  function confirmar() {
    if (!justificativa.trim()) {
      setErroJustificativa(MENSAGENS_ESCOPO.justificativaCriticidade)
      return
    }
    setErroJustificativa(undefined)
    setRecusa(null)
    iniciar(async () => {
      const resultado = await reclassificarCriticidade(escopo.id, criticidade, justificativa)
      if (resultado.ok) {
        avisarSalvo(resultado.mensagem)
        setAberta(false)
      } else {
        setRecusa(resultado.mensagem)
      }
    })
  }

  return (
    <ConfirmarAcao
      titulo="Reclassificar a criticidade?"
      rotuloConfirmar="Reclassificar"
      onConfirmar={confirmar}
      aberto={aberta}
      aoMudarAberto={aoMudarAberta}
      carregando={pendente}
      conteudo={
        <div className="space-y-3">
          <Campo rotulo="Criticidade" obrigatorio>
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
          <Campo rotulo="Justificativa" obrigatorio erro={erroJustificativa}>
            {(p) => <Textarea {...p} value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />}
          </Campo>
          {recusa ? (
            <Alert variant="destructive">
              <AlertDescription>{recusa}</AlertDescription>
            </Alert>
          ) : null}
        </div>
      }
    >
      <Button type="button" variant="outline" size="sm">
        Reclassificar
      </Button>
    </ConfirmarAcao>
  )
}
