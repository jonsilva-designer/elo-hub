'use client'

import { MoreHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { BotaoIcone } from '@/components/elo/botao-icone'
import { Campo } from '@/components/elo/campo'
import { ConfirmarAcao } from '@/components/elo/confirmacao'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { avisarSalvo } from '@/lib/avisos'
import type { StatusDocumento } from '@/lib/dados/tipos'
import { excluirDocumento, inativarDocumento, mudarStatusDocumento, reativarDocumento } from '@/lib/documentos/acoes'
import { acoesDeStatus } from '@/lib/documentos/regras'
import type { ResultadoAcao } from '@/lib/resultado-acao'

type Janela = 'encerrar' | 'marcar-superado' | 'voltar-a-vigente' | 'inativar' | 'reativar' | 'excluir' | null

// As mesmas mensagens do servidor, conferidas antes de chamá-lo.
const MENSAGENS = {
  substituto: 'Escolha o documento que substitui este.',
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
 * Menu do Administrador na página do documento (parte 6, 4.4; PRD 6.1, CA-12.6): encerrar e marcar como Superado no
 * Vigente, voltar a Vigente no Superado e no Encerrado, inativar e reativar (RN-24) e excluir, só sem ligação (DF-33).
 * O Superado exige o substituto (CA-12.4). No protótipo, nada é gravado: depois do aviso, a tela continua igual, menos
 * na exclusão, que volta à lista.
 */
export function AcoesDocumento({
  documentoId,
  status,
  inativo,
  substitutos,
  podeExcluir,
}: {
  documentoId: string
  status: StatusDocumento
  inativo: boolean
  /** Os documentos Vigentes do mesmo dono que podem substituir este (`substitutosPossiveis`). */
  substitutos: { id: string; nome: string }[]
  podeExcluir: boolean
}) {
  const router = useRouter()
  const [janela, setJanela] = useState<Janela>(null)
  const [pendente, iniciar] = useTransition()
  const [recusa, setRecusa] = useState<string | null>(null)
  const [erro, setErro] = useState<string | undefined>()
  const [justificativa, setJustificativa] = useState('')
  const [substituto, setSubstituto] = useState('')

  const deStatus = acoesDeStatus(status)

  function abrir(qual: Exclude<Janela, null>) {
    setRecusa(null)
    setErro(undefined)
    setJustificativa('')
    setSubstituto('')
    setJanela(qual)
  }

  function aoMudarAberto(abertoAgora: boolean) {
    if (!abertoAgora && !pendente) setJanela(null)
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

  /** Sem o valor exigido, o erro aparece no campo e o servidor não é chamado. */
  function exigindo(valor: string, mensagem: string, acao: () => void) {
    if (!valor.trim()) {
      setErro(mensagem)
      return
    }
    setErro(undefined)
    acao()
  }

  const confirmacaoSimples = (qual: 'encerrar' | 'voltar-a-vigente' | 'inativar' | 'reativar') => {
    const textos = {
      encerrar: { titulo: 'Encerrar documento?', descricao: 'O documento passa a Encerrado: a finalidade ou a vigência acabou.', rotulo: 'Encerrar' },
      'voltar-a-vigente': {
        titulo: 'Voltar a Vigente?',
        descricao: 'Correção do status: o documento volta a valer. No Superado, a ligação com o substituto é desfeita.',
        rotulo: 'Voltar a Vigente',
      },
      inativar: {
        titulo: 'Inativar documento?',
        descricao: 'O documento sai da lista e dos painéis padrão e continua abrindo pela página, com o histórico.',
        rotulo: 'Inativar',
      },
      reativar: { titulo: 'Reativar documento?', descricao: 'O documento volta às listas, com o status que tinha.', rotulo: 'Reativar' },
    }[qual]
    const acao = {
      encerrar: () => mudarStatusDocumento(documentoId, 'encerrar', ''),
      'voltar-a-vigente': () => mudarStatusDocumento(documentoId, 'voltar-a-vigente', ''),
      inativar: () => inativarDocumento(documentoId),
      reativar: () => reativarDocumento(documentoId),
    }[qual]
    return (
      <ConfirmarAcao
        key={qual}
        titulo={textos.titulo}
        descricao={textos.descricao}
        rotuloConfirmar={textos.rotulo}
        onConfirmar={() => executar(acao)}
        conteudo={recusa ? <Recusa mensagem={recusa} /> : undefined}
        aberto={janela === qual}
        aoMudarAberto={aoMudarAberto}
        carregando={pendente}
      />
    )
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <BotaoIcone rotulo="Mais ações" icone={MoreHorizontal} variant="outline" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {deStatus.includes('encerrar') ? <DropdownMenuItem onSelect={() => abrir('encerrar')}>Encerrar</DropdownMenuItem> : null}
          {deStatus.includes('marcar-superado') ? (
            <DropdownMenuItem onSelect={() => abrir('marcar-superado')}>Marcar como Superado</DropdownMenuItem>
          ) : null}
          {deStatus.includes('voltar-a-vigente') ? (
            <DropdownMenuItem onSelect={() => abrir('voltar-a-vigente')}>Voltar a Vigente</DropdownMenuItem>
          ) : null}
          {inativo ? (
            <DropdownMenuItem onSelect={() => abrir('reativar')}>Reativar</DropdownMenuItem>
          ) : (
            <DropdownMenuItem onSelect={() => abrir('inativar')}>Inativar</DropdownMenuItem>
          )}
          {podeExcluir ? (
            <DropdownMenuItem variant="destructive" onSelect={() => abrir('excluir')}>
              Excluir
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {(['encerrar', 'voltar-a-vigente', 'inativar', 'reativar'] as const).map(confirmacaoSimples)}

      {substitutos.length === 0 ? (
        <ConfirmarAcao
          titulo="Não é possível marcar como Superado"
          descricao="Nenhum outro documento Vigente do mesmo cliente pode substituir este. Inclua a nova versão pela página do documento."
          rotuloConfirmar="Marcar como Superado"
          bloqueado
          onConfirmar={() => {}}
          aberto={janela === 'marcar-superado'}
          aoMudarAberto={aoMudarAberto}
        />
      ) : (
        <ConfirmarAcao
          titulo="Marcar como Superado?"
          descricao="Escolha o documento que substitui este. Os dois ficam ligados, e este continua consultável."
          rotuloConfirmar="Marcar como Superado"
          onConfirmar={() =>
            exigindo(substituto, MENSAGENS.substituto, () =>
              executar(() => mudarStatusDocumento(documentoId, 'marcar-superado', substituto)),
            )
          }
          conteudo={
            <div className="space-y-3">
              <Campo rotulo="Substituído por" grupo obrigatorio erro={erro}>
                {(p) => (
                  <RadioGroup {...p} value={substituto} onValueChange={setSubstituto}>
                    {substitutos.map((s) => (
                      <div key={s.id} className="flex items-center gap-2">
                        <RadioGroupItem id={`substituto-${s.id}`} value={s.id} />
                        <Label htmlFor={`substituto-${s.id}`} className="font-normal">
                          {s.nome}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </Campo>
              <Recusa mensagem={recusa} />
            </div>
          }
          aberto={janela === 'marcar-superado'}
          aoMudarAberto={aoMudarAberto}
          carregando={pendente}
        />
      )}

      <ConfirmarAcao
        titulo="Excluir documento?"
        descricao="A exclusão é definitiva. Escreva o motivo."
        rotuloConfirmar="Excluir"
        perigo
        onConfirmar={() =>
          exigindo(justificativa, MENSAGENS.excluir, () =>
            executar(
              () => excluirDocumento(documentoId, justificativa),
              () => router.push('/documentos'),
            ),
          )
        }
        conteudo={
          <div className="space-y-3">
            <Campo rotulo="Justificativa" obrigatorio erro={erro}>
              {(p) => <Textarea {...p} value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />}
            </Campo>
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
