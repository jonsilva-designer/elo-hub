'use client'

import { useActionState, useEffect, useState } from 'react'
import { Campo } from '@/components/elo/campo'
import { CampoData } from '@/components/elo/campo-data'
import { SelecaoDoFormulario } from '@/components/elo/selecao-do-formulario'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { avisarSalvo } from '@/lib/avisos'
import { comentarDemanda } from '@/lib/demandas/acoes'
import { ESTADO_INICIAL_COMENTARIO } from '@/lib/demandas/estados'

type Tipo = 'Comentário' | 'Contato com especialista'

/**
 * Novo comentário na demanda aberta (F09; parte 5, 5.10). O contato com especialista pede um dos especialistas da
 * demanda e a data do contato (DF-30). Depois de registrado, o formulário volta vazio.
 */
export function FormularioComentario({
  numero,
  especialistas,
}: {
  numero: string
  /** Os especialistas ligados à demanda; sem nenhum, não há contato a registrar. */
  especialistas: { valor: string; rotulo: string }[]
}) {
  const [estado, enviar, enviando] = useActionState(comentarDemanda, ESTADO_INICIAL_COMENTARIO)
  const [tipo, setTipo] = useState<Tipo>('Comentário')
  const [especialista, setEspecialista] = useState('')
  const [dataContato, setDataContato] = useState<string | null>(null)
  const [texto, setTexto] = useState('')
  const [estadoAnterior, setEstadoAnterior] = useState(estado)

  // Chegou um resultado novo e deu certo: o formulário volta vazio. Feito durante a renderização, sem efeito.
  if (estado !== estadoAnterior) {
    setEstadoAnterior(estado)
    if (estado.sucesso) {
      setTipo('Comentário')
      setEspecialista('')
      setDataContato(null)
      setTexto('')
    }
  }

  useEffect(() => {
    if (estado.sucesso) avisarSalvo(estado.sucesso)
  }, [estado])

  const contato = tipo === 'Contato com especialista'

  return (
    <form action={enviar} noValidate className="space-y-4 border-t border-divisoria pt-4">
      <input type="hidden" name="numero" value={numero} />
      <input type="hidden" name="tipo" value={tipo} />
      {estado.erroGeral ? (
        <Alert variant="destructive">
          <AlertDescription>{estado.erroGeral}</AlertDescription>
        </Alert>
      ) : null}
      {especialistas.length > 0 ? (
        <Campo rotulo="Tipo" grupo>
          {(p) => (
            <RadioGroup {...p} value={tipo} onValueChange={(v) => setTipo(v as Tipo)} className="flex flex-wrap gap-4">
              {(['Comentário', 'Contato com especialista'] as const).map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <RadioGroupItem id={`tipo-comentario-${t}`} value={t} />
                  <Label htmlFor={`tipo-comentario-${t}`} className="font-normal">
                    {t}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </Campo>
      ) : null}
      {contato ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Especialista" obrigatorio erro={estado.erros.especialistaId}>
            {(p) => (
              <SelecaoDoFormulario nome="especialistaId" valor={especialista} aoMudar={setEspecialista} opcoes={especialistas} atributos={p} />
            )}
          </Campo>
          <Campo rotulo="Data do contato" obrigatorio erro={estado.erros.dataContato}>
            {(p) => (
              <>
                <CampoData {...p} valor={dataContato} onChange={setDataContato} />
                <input type="hidden" name="dataContato" value={dataContato ?? ''} />
              </>
            )}
          </Campo>
        </div>
      ) : null}
      <Campo rotulo="Comentário" obrigatorio erro={estado.erros.texto}>
        {(p) => <Textarea {...p} name="texto" value={texto} onChange={(e) => setTexto(e.target.value)} />}
      </Campo>
      <Button type="submit" variant="outline" carregando={enviando}>
        Registrar comentário
      </Button>
    </form>
  )
}
