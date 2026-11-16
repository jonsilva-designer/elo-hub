'use client'

import { MoreHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { BotaoIcone } from '@/components/elo/botao-icone'
import { Campo } from '@/components/elo/campo'
import { CampoData } from '@/components/elo/campo-data'
import { ConfirmarAcao, ListaImpedimentos } from '@/components/elo/confirmacao'
import { Num } from '@/components/elo/num'
import { SelecaoDoFormulario } from '@/components/elo/selecao-do-formulario'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { avisarSalvo } from '@/lib/avisos'
import { contratoFechado } from '@/lib/contratos/regras'
import type { EscopoDetalhado, ItemQueImpede, StatusEscopo } from '@/lib/dados/tipos'
import { cancelarEscopo, concluirEscopo, excluirEscopo, moverEscopo, reabrirEscopo } from '@/lib/escopos/acoes'
import { escopoFechado, STATUS_ESCOPO_ABERTOS } from '@/lib/escopos/regras'
import type { ResultadoAcao } from '@/lib/resultado-acao'

type Janela = 'concluir' | 'cancelar' | 'reabrir' | 'mover' | 'excluir' | null

// As mesmas mensagens do servidor, conferidas antes de chamá-lo.
const MENSAGENS = {
  dataEfetiva: 'Informe a data efetiva de conclusão.',
  reabrir: 'Escreva a justificativa da reabertura.',
  excluir: 'Escreva a justificativa da exclusão.',
  destino: 'Escolha outro contrato aberto do mesmo cliente.',
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
 * Menu de ações do escopo, só do Administrador (parte 3, 5.9): Concluir e Cancelar (aberto), Reabrir (Concluído ou
 * Cancelado), Mover para outro contrato aberto do mesmo cliente e Excluir quando não há nada ligado. Cada item abre
 * uma janela de confirmação. No protótipo, nada é gravado: depois do aviso, a tela continua igual, menos na
 * exclusão, que volta à lista.
 */
export function AcoesEscopo({
  escopo,
  impedimentos,
  contratosDestino,
  podeExcluir,
}: {
  escopo: EscopoDetalhado
  /** As etapas Em andamento, que impedem concluir e cancelar (DF-59). */
  impedimentos: ItemQueImpede[]
  /** Os outros contratos abertos do cliente, na ordem da lista (DF-45). */
  contratosDestino: { valor: string; codigo: string; contratante: string }[]
  podeExcluir: boolean
}) {
  const router = useRouter()
  const [janela, setJanela] = useState<Janela>(null)
  const [pendente, iniciar] = useTransition()
  const [recusa, setRecusa] = useState<string | null>(null)
  const [erro, setErro] = useState<string | undefined>()
  const [justificativa, setJustificativa] = useState('')
  const [dataEfetiva, setDataEfetiva] = useState<string | null>(null)
  const [statusDeVolta, setStatusDeVolta] = useState<StatusEscopo>('Planejado')
  const [destino, setDestino] = useState('')

  function abrir(qual: Exclude<Janela, null>) {
    setRecusa(null)
    setErro(undefined)
    setJustificativa('')
    setDataEfetiva(null)
    setStatusDeVolta('Planejado')
    setDestino('')
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

  /** Campo obrigatório: sem ele, o erro aparece no campo e o servidor não é chamado. */
  function exigir(preenchido: boolean, mensagem: string, acao: () => void) {
    if (!preenchido) {
      setErro(mensagem)
      return
    }
    setErro(undefined)
    acao()
  }

  const aberto = !escopoFechado(escopo.status)
  const bloqueado = impedimentos.length > 0

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
          {aberto ? null : <DropdownMenuItem onSelect={() => abrir('reabrir')}>Reabrir</DropdownMenuItem>}
          {contratosDestino.length > 0 ? (
            <DropdownMenuItem onSelect={() => abrir('mover')}>Mover para outro contrato</DropdownMenuItem>
          ) : null}
          {podeExcluir ? (
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
            descricao={`Não é possível ${qual} este escopo enquanto houver etapas Em andamento.`}
            rotuloConfirmar={qual === 'concluir' ? 'Concluir' : 'Cancelar escopo'}
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
          titulo="Concluir escopo?"
          rotuloConfirmar="Concluir"
          onConfirmar={() =>
            exigir(dataEfetiva !== null, MENSAGENS.dataEfetiva, () =>
              executar(() => concluirEscopo(escopo.id, dataEfetiva ?? '')),
            )
          }
          conteudo={
            <div className="space-y-3">
              <Campo rotulo="Data efetiva de conclusão" obrigatorio erro={erro}>
                {(p) => <CampoData {...p} valor={dataEfetiva} onChange={setDataEfetiva} />}
              </Campo>
              <Recusa mensagem={recusa} />
            </div>
          }
          aberto={janela === 'concluir'}
          aoMudarAberto={aoMudarAberto}
          carregando={pendente}
        />
      )}

      {bloqueado ? null : (
        <ConfirmarAcao
          titulo="Cancelar escopo?"
          descricao="O escopo sai do andamento sem ser concluído."
          // O botão que fecha a janela já se chama "Cancelar".
          rotuloConfirmar="Cancelar escopo"
          onConfirmar={() => executar(() => cancelarEscopo(escopo.id))}
          conteudo={recusa ? <Recusa mensagem={recusa} /> : undefined}
          aberto={janela === 'cancelar'}
          aoMudarAberto={aoMudarAberto}
          carregando={pendente}
        />
      )}

      {contratoFechado(escopo.statusContrato) ? (
        // Escopo de contrato fechado não volta a andar: o contrato é reaberto antes (RN-23).
        <ConfirmarAcao
          titulo="Não é possível reabrir"
          descricao="O contrato está fechado. Reabra o contrato antes."
          rotuloConfirmar="Reabrir"
          bloqueado
          onConfirmar={() => {}}
          aberto={janela === 'reabrir'}
          aoMudarAberto={aoMudarAberto}
        />
      ) : (
        <ConfirmarAcao
          titulo="Reabrir escopo?"
          descricao="Escolha o status de volta e escreva o motivo."
          rotuloConfirmar="Reabrir"
          onConfirmar={() =>
            exigir(justificativa.trim() !== '', MENSAGENS.reabrir, () =>
              executar(() => reabrirEscopo(escopo.id, statusDeVolta, justificativa)),
            )
          }
          conteudo={
            <div className="space-y-3">
              <Campo rotulo="Status de volta" grupo>
                {(p) => (
                  <RadioGroup {...p} value={statusDeVolta} onValueChange={(v) => setStatusDeVolta(v as StatusEscopo)}>
                    {STATUS_ESCOPO_ABERTOS.map((s) => (
                      <div key={s} className="flex items-center gap-2">
                        <RadioGroupItem id={`reabrir-escopo-${s}`} value={s} />
                        <Label htmlFor={`reabrir-escopo-${s}`} className="font-normal">
                          {s}
                        </Label>
                      </div>
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
        titulo="Mover escopo?"
        descricao="Planos, atividades, Jornada, documentos e demandas vão junto para o contrato escolhido."
        rotuloConfirmar="Mover"
        onConfirmar={() =>
          exigir(destino !== '', MENSAGENS.destino, () => executar(() => moverEscopo(escopo.id, destino)))
        }
        conteudo={
          <div className="space-y-3">
            <Campo rotulo="Contrato de destino" obrigatorio erro={erro}>
              {(p) => (
                <SelecaoDoFormulario
                  nome="contratoDestino"
                  valor={destino}
                  aoMudar={setDestino}
                  opcoes={contratosDestino.map((c) => ({
                    valor: c.valor,
                    rotulo: (
                      <>
                        <Num>{c.codigo}</Num>
                        <span aria-hidden="true"> · </span>
                        {c.contratante}
                      </>
                    ),
                  }))}
                  atributos={p}
                />
              )}
            </Campo>
            <Recusa mensagem={recusa} />
          </div>
        }
        aberto={janela === 'mover'}
        aoMudarAberto={aoMudarAberto}
        carregando={pendente}
      />

      <ConfirmarAcao
        titulo="Excluir escopo?"
        descricao="A exclusão é definitiva. Escreva o motivo."
        rotuloConfirmar="Excluir"
        perigo
        onConfirmar={() =>
          exigir(justificativa.trim() !== '', MENSAGENS.excluir, () =>
            executar(
              () => excluirEscopo(escopo.id, justificativa),
              () => router.push('/escopos'),
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
