'use client'

import { MoreHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { BotaoIcone } from '@/components/elo/botao-icone'
import { Campo } from '@/components/elo/campo'
import { ConfirmarAcao, ListaImpedimentos } from '@/components/elo/confirmacao'
import { OpcaoRadio } from '@/components/elo/textos'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { RadioGroup } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { avisarSalvo } from '@/lib/avisos'
import type { ItemQueImpede, Perfil, PlanoDetalhado, StatusPlano } from '@/lib/dados/tipos'
import { escopoFechado } from '@/lib/escopos/regras'
import { cancelarPlano, concluirPlano, excluirPlano, reabrirPlano } from '@/lib/planos/acoes'
import { planoFechado, STATUS_PLANO_ABERTOS } from '@/lib/planos/regras'
import type { ResultadoAcao } from '@/lib/resultado-acao'

type Janela = 'concluir' | 'cancelar' | 'reabrir' | 'excluir' | null

// As mesmas mensagens do servidor, conferidas antes de chamá-lo.
const MENSAGENS = {
  reabrir: 'Escreva a justificativa da reabertura.',
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
 * Menu de ações do plano (parte 4, 5.5). Concluir e Cancelar no plano aberto, para o Administrador e a Equipe (6.1);
 * Reabrir no fechado e Excluir no plano sem atividades, só para o Administrador (RN-17, DF-33). Sem item para o
 * perfil, o menu não aparece. No protótipo, nada é gravado: depois do aviso, a tela continua igual, menos na
 * exclusão, que volta ao escopo.
 */
export function AcoesPlano({
  plano,
  perfil,
  impedimentos,
  podeExcluir,
}: {
  plano: PlanoDetalhado
  perfil: Perfil
  /** As atividades abertas, que impedem concluir e cancelar (RN-18). */
  impedimentos: ItemQueImpede[]
  podeExcluir: boolean
}) {
  const router = useRouter()
  const [janela, setJanela] = useState<Janela>(null)
  const [pendente, iniciar] = useTransition()
  const [recusa, setRecusa] = useState<string | null>(null)
  const [erro, setErro] = useState<string | undefined>()
  const [justificativa, setJustificativa] = useState('')
  const [statusDeVolta, setStatusDeVolta] = useState<StatusPlano>('Aberto')

  const admin = perfil === 'Administrador'
  const aberto = !planoFechado(plano.status)
  const bloqueado = impedimentos.length > 0
  const reabre = admin && !aberto
  const exclui = admin && podeExcluir
  if (!aberto && !reabre && !exclui) return null

  function abrir(qual: Exclude<Janela, null>) {
    setRecusa(null)
    setErro(undefined)
    setJustificativa('')
    setStatusDeVolta('Aberto')
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

  /** Justificativa obrigatória: sem ela, o erro aparece no campo e o servidor não é chamado. */
  function comJustificativa(mensagem: string, acao: () => void) {
    if (!justificativa.trim()) {
      setErro(mensagem)
      return
    }
    setErro(undefined)
    acao()
  }

  const campoJustificativa = (
    <Campo rotulo="Justificativa" obrigatorio erro={erro}>
      {(p) => <Textarea {...p} value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />}
    </Campo>
  )

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <BotaoIcone rotulo="Mais ações" icone={MoreHorizontal} variant="outline" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {aberto ? <DropdownMenuItem onSelect={() => abrir('concluir')}>Concluir</DropdownMenuItem> : null}
          {aberto ? <DropdownMenuItem onSelect={() => abrir('cancelar')}>Cancelar</DropdownMenuItem> : null}
          {reabre ? <DropdownMenuItem onSelect={() => abrir('reabrir')}>Reabrir</DropdownMenuItem> : null}
          {exclui ? (
            <DropdownMenuItem variant="destructive" onSelect={() => abrir('excluir')}>
              Excluir
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {(['concluir', 'cancelar'] as const).map((qual) =>
        bloqueado ? (
          <ConfirmarAcao
            key={qual}
            titulo={`Não é possível ${qual}`}
            descricao={`Não é possível ${qual} este plano enquanto houver atividades abertas.`}
            rotuloConfirmar={qual === 'concluir' ? 'Concluir' : 'Cancelar plano'}
            bloqueado
            onConfirmar={() => {}}
            conteudo={<ListaImpedimentos itens={impedimentos} />}
            aberto={janela === qual}
            aoMudarAberto={aoMudarAberto}
          />
        ) : null,
      )}

      {bloqueado ? null : (
        <ConfirmarAcao
          titulo="Concluir plano?"
          descricao="O plano passa a Concluído. Só o Administrador reabre."
          rotuloConfirmar="Concluir"
          onConfirmar={() => executar(() => concluirPlano(plano.id))}
          conteudo={recusa ? <Recusa mensagem={recusa} /> : undefined}
          aberto={janela === 'concluir'}
          aoMudarAberto={aoMudarAberto}
          carregando={pendente}
        />
      )}

      {bloqueado ? null : (
        <ConfirmarAcao
          titulo="Cancelar plano?"
          descricao="O plano sai do andamento sem ser concluído. Só o Administrador reabre."
          // O botão que fecha a janela já se chama "Cancelar".
          rotuloConfirmar="Cancelar plano"
          onConfirmar={() => executar(() => cancelarPlano(plano.id))}
          conteudo={recusa ? <Recusa mensagem={recusa} /> : undefined}
          aberto={janela === 'cancelar'}
          aoMudarAberto={aoMudarAberto}
          carregando={pendente}
        />
      )}

      {escopoFechado(plano.statusEscopo) ? (
        // Plano de escopo fechado não volta a andar: o escopo é reaberto antes (RN-23).
        <ConfirmarAcao
          titulo="Não é possível reabrir"
          descricao="O escopo está fechado. Reabra o escopo antes."
          rotuloConfirmar="Reabrir"
          bloqueado
          onConfirmar={() => {}}
          aberto={janela === 'reabrir'}
          aoMudarAberto={aoMudarAberto}
        />
      ) : (
        <ConfirmarAcao
          titulo="Reabrir plano?"
          descricao="Escolha o status de volta e escreva o motivo."
          rotuloConfirmar="Reabrir"
          onConfirmar={() =>
            comJustificativa(MENSAGENS.reabrir, () => executar(() => reabrirPlano(plano.id, statusDeVolta, justificativa)))
          }
          conteudo={
            <div className="space-y-3">
              <Campo rotulo="Status de volta" grupo>
                {(p) => (
                  <RadioGroup {...p} value={statusDeVolta} onValueChange={(v) => setStatusDeVolta(v as StatusPlano)}>
                    {STATUS_PLANO_ABERTOS.map((s) => (
                      <OpcaoRadio key={s} id={`reabrir-plano-${s}`} valor={s}>{s}</OpcaoRadio>
                    ))}
                  </RadioGroup>
                )}
              </Campo>
              {campoJustificativa}
              <Recusa mensagem={recusa} />
            </div>
          }
          aberto={janela === 'reabrir'}
          aoMudarAberto={aoMudarAberto}
          carregando={pendente}
        />
      )}

      <ConfirmarAcao
        titulo="Excluir plano?"
        descricao="A exclusão é definitiva. Escreva o motivo."
        rotuloConfirmar="Excluir"
        perigo
        onConfirmar={() =>
          comJustificativa(MENSAGENS.excluir, () =>
            executar(
              () => excluirPlano(plano.id, justificativa),
              () => router.push(`/escopos/${plano.escopoId}`),
            ),
          )
        }
        conteudo={
          <div className="space-y-3">
            {campoJustificativa}
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
