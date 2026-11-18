'use client'

import { MoreHorizontal } from 'lucide-react'
import { useState, useTransition } from 'react'
import { BotaoIcone } from '@/components/elo/botao-icone'
import { ConfirmarAcao, ListaImpedimentos } from '@/components/elo/confirmacao'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { avisarSalvo } from '@/lib/avisos'
import type { ItemQueImpede, StatusUsuario } from '@/lib/dados/tipos'
import { inativarUsuario, reativarUsuario } from '@/lib/usuarios/acoes'

/**
 * Inativar ou reativar o usuário (parte 8, 4.1; 6.1). A recusa do servidor aparece na janela: o último Administrador
 * ativo (DF-37) e os itens abertos, listados para a redistribuição no painel da página (DF-36, CA-01.7).
 */
export function AcoesUsuario({ usuarioId, status }: { usuarioId: string; status: StatusUsuario }) {
  const [aberto, setAberto] = useState(false)
  const [pendente, iniciar] = useTransition()
  const [recusa, setRecusa] = useState<{ mensagem: string; itens?: ItemQueImpede[] } | null>(null)
  const inativar = status === 'Ativo'

  function confirmar() {
    setRecusa(null)
    iniciar(async () => {
      const resultado = inativar ? await inativarUsuario(usuarioId) : await reativarUsuario(usuarioId)
      if (resultado.ok) {
        avisarSalvo(resultado.mensagem)
        setAberto(false)
      } else {
        setRecusa({ mensagem: resultado.mensagem, itens: resultado.impedimentos })
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
          <DropdownMenuItem
            onSelect={() => {
              setRecusa(null)
              setAberto(true)
            }}
          >
            {inativar ? 'Inativar' : 'Reativar'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmarAcao
        titulo={inativar ? 'Inativar usuário?' : 'Reativar usuário?'}
        descricao={
          inativar
            ? 'A pessoa deixa de entrar na plataforma e continua no histórico dos registros.'
            : 'A pessoa volta a entrar, com o perfil e os vínculos que tinha.'
        }
        rotuloConfirmar={inativar ? 'Inativar' : 'Reativar'}
        perigo={inativar}
        onConfirmar={confirmar}
        conteudo={
          recusa ? (
            <div className="space-y-3">
              <Alert variant="destructive">
                <AlertDescription>{recusa.mensagem}</AlertDescription>
              </Alert>
              {recusa.itens ? <ListaImpedimentos itens={recusa.itens} /> : null}
            </div>
          ) : undefined
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
