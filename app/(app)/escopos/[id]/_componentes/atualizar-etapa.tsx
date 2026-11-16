'use client'

import { useActionState, useCallback, useEffect, useState } from 'react'
import { Campo } from '@/components/elo/campo'
import { CampoData } from '@/components/elo/campo-data'
import { SelecaoDoFormulario } from '@/components/elo/selecao-do-formulario'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { avisarSalvo } from '@/lib/avisos'
import type { LinhaEtapaDetalhada, Perfil, StatusEtapa } from '@/lib/dados/tipos'
import { atualizarEtapa } from '@/lib/jornada/acoes'
import { ESTADO_INICIAL_ATUALIZAR_ETAPA } from '@/lib/jornada/estados'
import { etapaPedeJustificativa } from '@/lib/jornada/regras'

type Props = {
  escopoId: string
  etapa: LinhaEtapaDetalhada
  perfil: Perfil
  /** Os status para onde a etapa pode ir, calculados no servidor (`mudancasDaEtapa`). */
  destinos: StatusEtapa[]
  /** Por que o Não aplicável não está entre os destinos (DF-49), ou null. */
  motivo: string | null
  /** Quem pode ser responsável no cliente (RN-19). Só o Administrador escolhe. */
  responsaveis: { valor: string; rotulo: string }[]
}

/** O formulário da janela. Fica dentro dela para começar limpo a cada abertura. */
function FormularioEtapa({ escopoId, etapa, perfil, destinos, motivo, responsaveis, aoSalvar }: Props & { aoSalvar: () => void }) {
  const [estado, enviar, enviando] = useActionState(atualizarEtapa, ESTADO_INICIAL_ATUALIZAR_ETAPA)
  const [status, setStatus] = useState<string>(etapa.status)
  const [responsavel, setResponsavel] = useState(etapa.responsavelId ?? '')
  const [inicio, setInicio] = useState<string | null>(etapa.inicio)
  const [conclusao, setConclusao] = useState<string | null>(etapa.conclusao)

  useEffect(() => {
    if (!estado.sucesso) return
    avisarSalvo(estado.sucesso.mensagem)
    aoSalvar()
  }, [estado, aoSalvar])

  const erros = estado.erros
  const pedeJustificativa = etapaPedeJustificativa(etapa.status, status as StatusEtapa)
  // Depois de um erro, o React limpa o formulário: o valor padrão devolve o que foi digitado.
  const observacoes = estado.valores?.observacoes ?? etapa.observacoes

  return (
    <form action={enviar} noValidate className="space-y-4">
      <input type="hidden" name="escopoId" value={escopoId} />
      <input type="hidden" name="etapa" value={etapa.etapa} />
      {estado.erroGeral ? (
        <Alert variant="destructive">
          <AlertDescription>{estado.erroGeral}</AlertDescription>
        </Alert>
      ) : null}
      <Campo rotulo="Status" obrigatorio erro={erros.status} ajuda={motivo ?? undefined}>
        {(p) => (
          <SelecaoDoFormulario
            nome="status"
            valor={status}
            aoMudar={setStatus}
            opcoes={[etapa.status, ...destinos]}
            atributos={p}
          />
        )}
      </Campo>
      {perfil === 'Administrador' ? (
        <Campo rotulo="Responsável" erro={erros.responsavelId}>
          {(p) => (
            <SelecaoDoFormulario
              nome="responsavelId"
              valor={responsavel}
              aoMudar={setResponsavel}
              opcoes={responsaveis}
              rotuloVazio="Sem responsável"
              placeholder="Sem responsável"
              atributos={p}
            />
          )}
        </Campo>
      ) : (
        // A Equipe não troca o responsável (matriz 4.3): só leitura, e o valor atual vai junto.
        <Campo rotulo="Responsável" grupo>
          {() => (
            <div>
              <p className={etapa.nomeResponsavel ? 'text-sm text-foreground' : 'text-sm text-muted-foreground'}>
                {etapa.nomeResponsavel || 'Sem responsável'}
              </p>
              <input type="hidden" name="responsavelId" value={etapa.responsavelId ?? ''} />
            </div>
          )}
        </Campo>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Início" erro={erros.inicio}>
          {(p) => (
            <>
              <CampoData {...p} valor={inicio} onChange={setInicio} />
              <input type="hidden" name="inicio" value={inicio ?? ''} />
            </>
          )}
        </Campo>
        <Campo rotulo="Conclusão" erro={erros.conclusao} ajuda="Obrigatória para concluir">
          {(p) => (
            <>
              <CampoData {...p} valor={conclusao} onChange={setConclusao} />
              <input type="hidden" name="conclusao" value={conclusao ?? ''} />
            </>
          )}
        </Campo>
      </div>
      <Campo rotulo="Observações">
        {(p) => <Textarea {...p} name="observacoes" defaultValue={observacoes} />}
      </Campo>
      {pedeJustificativa ? (
        <Campo
          rotulo="Justificativa"
          obrigatorio
          erro={erros.justificativa}
          ajuda={
            etapa.status === 'Concluída'
              ? 'Reabrir apaga a data de conclusão: diga o motivo.'
              : 'Esta mudança de status é uma correção: diga o motivo.'
          }
        >
          {(p) => <Textarea {...p} name="justificativa" defaultValue={estado.valores?.justificativa ?? ''} />}
        </Campo>
      ) : null}
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit" carregando={enviando}>
          Salvar
        </Button>
      </DialogFooter>
    </form>
  )
}

/**
 * O "Atualizar" de uma etapa da Jornada e a janela com o status, o responsável, as datas, as observações e, quando
 * a mudança pede, a justificativa (parte 3, 5.10). No sucesso, avisa e fecha.
 */
export function AtualizarEtapa(props: Props) {
  const [aberta, setAberta] = useState(false)
  // Estável: o aviso de salvo não se repete enquanto a janela some.
  const fechar = useCallback(() => setAberta(false), [])
  const titulo = `Atualizar ${props.etapa.etapa}`
  return (
    <Dialog open={aberta} onOpenChange={setAberta}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" aria-label={titulo}>
          Atualizar
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
        </DialogHeader>
        <FormularioEtapa {...props} aoSalvar={fechar} />
      </DialogContent>
    </Dialog>
  )
}
