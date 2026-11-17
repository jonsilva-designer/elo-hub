'use client'

import { MoreHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { BotaoIcone } from '@/components/elo/botao-icone'
import { Campo } from '@/components/elo/campo'
import { ConfirmarAcao } from '@/components/elo/confirmacao'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { avisarSalvo } from '@/lib/avisos'
import { excluirEspecialista } from '@/lib/especialistas/acoes'

/**
 * Menu de ações do especialista, só do Administrador e só quando ele não tem vínculo (parte 5, 5.6): Excluir, com
 * justificativa (DF-33). No protótipo, nada é gravado: depois do aviso, volta à lista.
 */
export function AcoesEspecialista({ especialistaId }: { especialistaId: string }) {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [pendente, iniciar] = useTransition()
  const [justificativa, setJustificativa] = useState('')
  const [erro, setErro] = useState<string | undefined>()
  const [recusa, setRecusa] = useState<string | null>(null)

  function abrir() {
    setJustificativa('')
    setErro(undefined)
    setRecusa(null)
    setAberto(true)
  }

  function confirmar() {
    if (!justificativa.trim()) {
      setErro('Escreva a justificativa da exclusão.')
      return
    }
    setErro(undefined)
    iniciar(async () => {
      const resultado = await excluirEspecialista(especialistaId, justificativa)
      if (resultado.ok) {
        avisarSalvo(resultado.mensagem)
        setAberto(false)
        router.push('/especialistas')
      } else {
        setRecusa(resultado.mensagem)
      }
    })
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <BotaoIcone rotulo="Mais ações" icone={MoreHorizontal} variant="outline" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem variant="destructive" onSelect={abrir}>
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmarAcao
        titulo="Excluir especialista?"
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
        aoMudarAberto={(agora) => !pendente && setAberto(agora)}
        carregando={pendente}
      />
    </>
  )
}
