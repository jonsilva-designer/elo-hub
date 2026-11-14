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
import { excluirCliente, inativarCliente, reativarCliente } from '@/lib/clientes/acoes'
import type { Cliente, ItemQueImpede } from '@/lib/dados/tipos'
import type { ResultadoAcao } from '@/lib/resultado-acao'

type Janela = 'inativar' | 'reativar' | 'excluir' | null

const SEM_JUSTIFICATIVA = 'Escreva a justificativa da exclusão.'

/** Recusa do servidor, dentro da janela. */
function Recusa({ mensagem }: { mensagem: string | null }) {
  return mensagem ? (
    <Alert variant="destructive">
      <AlertDescription>{mensagem}</AlertDescription>
    </Alert>
  ) : null
}

/**
 * Menu de ações do cliente, só do Administrador (parte 2, 5.7): Inativar ou Reativar, e Excluir quando não há
 * nada ligado. Cada item abre uma janela de confirmação. No protótipo, nada é gravado: depois do aviso, a tela
 * continua igual, menos na exclusão, que volta à lista.
 */
export function AcoesCliente({
  cliente,
  impedimentos,
  podeExcluir,
}: {
  cliente: Cliente
  impedimentos: ItemQueImpede[]
  podeExcluir: boolean
}) {
  const router = useRouter()
  const [janela, setJanela] = useState<Janela>(null)
  const [pendente, iniciar] = useTransition()
  const [recusa, setRecusa] = useState<string | null>(null)
  const [justificativa, setJustificativa] = useState('')
  const [erroJustificativa, setErroJustificativa] = useState<string | undefined>()
  const [statusDestino, setStatusDestino] = useState<'Prospect' | 'Ativo'>('Ativo')

  function abrir(qual: Exclude<Janela, null>) {
    setRecusa(null)
    setJustificativa('')
    setErroJustificativa(undefined)
    setStatusDestino('Ativo')
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

  function excluir() {
    if (!justificativa.trim()) {
      setErroJustificativa(SEM_JUSTIFICATIVA)
      return
    }
    setErroJustificativa(undefined)
    executar(
      () => excluirCliente(cliente.id, justificativa),
      () => router.push('/clientes'),
    )
  }

  const inativo = cliente.status === 'Inativo'
  const bloqueado = impedimentos.length > 0

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <BotaoIcone rotulo="Mais ações" icone={MoreHorizontal} variant="outline" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
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

      {bloqueado ? (
        <ConfirmarAcao
          titulo="Não é possível inativar"
          descricao="Não é possível inativar este cliente enquanto houver itens abertos ligados a ele."
          rotuloConfirmar="Inativar"
          bloqueado
          onConfirmar={() => {}}
          conteudo={<ListaImpedimentos itens={impedimentos} />}
          aberto={janela === 'inativar'}
          aoMudarAberto={aoMudarAberto}
        />
      ) : (
        <ConfirmarAcao
          titulo="Inativar cliente?"
          descricao="O cliente sai da lista padrão e não recebe novos registros."
          rotuloConfirmar="Inativar"
          onConfirmar={() => executar(() => inativarCliente(cliente.id))}
          conteudo={recusa ? <Recusa mensagem={recusa} /> : undefined}
          aberto={janela === 'inativar'}
          aoMudarAberto={aoMudarAberto}
          carregando={pendente}
        />
      )}

      <ConfirmarAcao
        titulo="Reativar cliente?"
        rotuloConfirmar="Reativar"
        onConfirmar={() => executar(() => reativarCliente(cliente.id, statusDestino))}
        conteudo={
          <div className="space-y-3">
            <Campo rotulo="Status depois de reativar" grupo>
              {(p) => (
                <RadioGroup
                  {...p}
                  value={statusDestino}
                  onValueChange={(v) => setStatusDestino(v as 'Prospect' | 'Ativo')}
                >
                  {(['Prospect', 'Ativo'] as const).map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <RadioGroupItem id={`reativar-${s}`} value={s} />
                      <Label htmlFor={`reativar-${s}`} className="font-normal">
                        {s}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </Campo>
            <Recusa mensagem={recusa} />
          </div>
        }
        aberto={janela === 'reativar'}
        aoMudarAberto={aoMudarAberto}
        carregando={pendente}
      />

      <ConfirmarAcao
        titulo="Excluir cliente?"
        descricao="A exclusão é definitiva. Escreva o motivo."
        rotuloConfirmar="Excluir"
        perigo
        onConfirmar={excluir}
        conteudo={
          <div className="space-y-3">
            <Campo rotulo="Justificativa" obrigatorio erro={erroJustificativa}>
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
