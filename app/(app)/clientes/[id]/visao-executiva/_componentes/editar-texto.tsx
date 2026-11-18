'use client'

import { Pencil } from 'lucide-react'
import { useState, useTransition } from 'react'
import { BotaoIcone } from '@/components/elo/botao-icone'
import { Campo } from '@/components/elo/campo'
import { ConfirmarAcao } from '@/components/elo/confirmacao'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { avisarSalvo } from '@/lib/avisos'
import type { CampoTexto } from '@/lib/dados/tipos'
import { salvarTextoExecutivo } from '@/lib/visao-executiva/acoes'

/**
 * "Editar" de um dos três textos da Visão Executiva (CA-14.7), na janela da biblioteca. O Administrador e a Equipe
 * vinculada; quem chega à página já tem o vínculo. No protótipo, nada é gravado: depois do aviso, o texto continua o
 * de antes.
 */
export function EditarTexto({ clienteId, campo, titulo, texto }: { clienteId: string; campo: CampoTexto; titulo: string; texto: string }) {
  const [aberto, setAberto] = useState(false)
  const [valor, setValor] = useState(texto)
  const [recusa, setRecusa] = useState<string | null>(null)
  const [pendente, iniciar] = useTransition()

  function abrir() {
    setValor(texto)
    setRecusa(null)
    setAberto(true)
  }

  function salvar() {
    setRecusa(null)
    iniciar(async () => {
      const resultado = await salvarTextoExecutivo(clienteId, campo, valor)
      if (resultado.ok) {
        avisarSalvo(resultado.mensagem)
        setAberto(false)
      } else {
        setRecusa(resultado.mensagem)
      }
    })
  }

  return (
    <>
      <BotaoIcone rotulo={`Editar ${titulo}`} icone={Pencil} variant="outline" size="icon-sm" onClick={abrir} />
      <ConfirmarAcao
        titulo={titulo}
        descricao="O texto vai para a Visão Executiva e para o PDF. A versão anterior fica no histórico."
        rotuloConfirmar="Salvar"
        onConfirmar={salvar}
        conteudo={
          <div className="space-y-3">
            <Campo rotulo={titulo}>
              {(p) => <Textarea {...p} rows={6} value={valor} onChange={(e) => setValor(e.target.value)} />}
            </Campo>
            {recusa ? (
              <Alert variant="destructive">
                <AlertDescription>{recusa}</AlertDescription>
              </Alert>
            ) : null}
          </div>
        }
        aberto={aberto}
        aoMudarAberto={(agora) => {
          if (!agora && !pendente) setAberto(false)
        }}
        carregando={pendente}
      />
    </>
  )
}
