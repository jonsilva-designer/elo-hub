'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { Campo } from '@/components/elo/campo'
import { CampoData } from '@/components/elo/campo-data'
import { EtiquetaStatus } from '@/components/elo/etiquetas'
import { Painel } from '@/components/elo/painel'
import { SelecaoDoFormulario } from '@/components/elo/selecao-do-formulario'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { avisarSalvo } from '@/lib/avisos'
import type { AvaliacaoDetalhada, Usuario } from '@/lib/dados/tipos'
import { salvarAvaliacao } from '@/lib/maturidade/acoes'
import { ESTADO_INICIAL_SALVAR_AVALIACAO } from '@/lib/maturidade/estados'
import { NIVEIS_DIMENSAO, NIVEIS_GERAIS, PRONTIDOES } from '@/lib/maturidade/regras'

const EM_BRANCO = 'Em branco'

/** A média como o avaliador digita: 4,1 e não 4.10. Sem média, campo vazio. */
const mediaComoTexto = (media: number | null) => (media === null ? '' : String(media).replace('.', ','))

/**
 * Cadastro e edição da avaliação de maturidade (F20, parte 2, 5.8). Quem confere tudo é o servidor; enquanto a
 * avaliação está Em elaboração, níveis, maturidade geral e prontidão podem ficar em branco. Concluir é uma
 * ação da página da avaliação.
 */
export function FormularioAvaliacao({
  cliente,
  avaliacao,
  dimensoes,
  avaliadores,
  usuarioAtualId,
}: {
  cliente: { id: string; nome: string }
  avaliacao: AvaliacaoDetalhada | null
  dimensoes: string[]
  avaliadores: Usuario[]
  usuarioAtualId: string
}) {
  const router = useRouter()
  const [estado, enviar, enviando] = useActionState(salvarAvaliacao, ESTADO_INICIAL_SALVAR_AVALIACAO)

  const linhaDe = (dimensao: string) => avaliacao?.dimensoes.find((d) => d.dimensao === dimensao)
  const avaliadorInicial =
    avaliacao?.avaliadorId ?? (avaliadores.some((u) => u.id === usuarioAtualId) ? usuarioAtualId : '')

  const [data, setData] = useState<string | null>(avaliacao?.data ?? null)
  const [avaliadorId, setAvaliadorId] = useState(avaliadorInicial)
  const [niveis, setNiveis] = useState<string[]>(dimensoes.map((d) => linhaDe(d)?.nivel ?? ''))
  const [maturidadeGeral, setMaturidadeGeral] = useState<string>(avaliacao?.maturidadeGeral ?? '')
  const [prontidao, setProntidao] = useState<string>(avaliacao?.prontidao ?? '')

  useEffect(() => {
    if (!estado.sucesso) return
    avisarSalvo(estado.sucesso.mensagem)
    router.push(estado.sucesso.destino)
  }, [estado, router])

  // Depois de um erro, o React limpa o formulário: o valor padrão devolve o que foi digitado.
  const valores = estado.valores
  const erros = estado.erros
  const destino = avaliacao ? `/avaliacoes/${avaliacao.id}` : `/clientes/${cliente.id}?aba=maturidade`

  return (
    <form action={enviar} noValidate className="space-y-5">
      {avaliacao ? (
        <input type="hidden" name="avaliacaoId" value={avaliacao.id} />
      ) : (
        <input type="hidden" name="clienteId" value={cliente.id} />
      )}
      {estado.erroGeral ? (
        <Alert variant="destructive">
          <AlertDescription>{estado.erroGeral}</AlertDescription>
        </Alert>
      ) : null}

      <Painel titulo="Dados da avaliação">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Cliente" grupo>
            {() => <p className="text-sm font-medium text-foreground">{cliente.nome}</p>}
          </Campo>
          <Campo rotulo="Contrato de referência">
            {(p) => (
              <SelecaoDoFormulario
                nome="contratoId"
                valor=""
                aoMudar={() => {}}
                opcoes={[]}
                atributos={p}
                disabled
                placeholder="Nenhum contrato deste cliente"
              />
            )}
          </Campo>
          <Campo rotulo="Data da avaliação" obrigatorio erro={erros.data}>
            {(p) => (
              <>
                <CampoData {...p} valor={data} onChange={setData} />
                <input type="hidden" name="data" value={data ?? ''} />
              </>
            )}
          </Campo>
          <Campo rotulo="Avaliador" obrigatorio erro={erros.avaliadorId}>
            {(p) => (
              <SelecaoDoFormulario
                nome="avaliadorId"
                valor={avaliadorId}
                aoMudar={setAvaliadorId}
                opcoes={avaliadores.map((u) => ({ valor: u.id, rotulo: u.nome }))}
                atributos={p}
              />
            )}
          </Campo>
          <Campo rotulo="Status" grupo>
            {() => (
              <div>
                <EtiquetaStatus status="Em elaboração" />
              </div>
            )}
          </Campo>
        </div>
      </Painel>

      <Painel titulo="Níveis por dimensão">
        <div className="divide-y divide-divisoria">
          {dimensoes.map((dimensao, i) => {
            const linha = linhaDe(dimensao)
            return (
              <div key={dimensao} className="py-4 first:pt-0 last:pb-0">
                <Campo rotulo={dimensao} grupo>
                  {() => (
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Campo rotulo="Nível">
                        {(p) => (
                          <SelecaoDoFormulario
                            nome={`nivel-${i}`}
                            valor={niveis[i] ?? ''}
                            aoMudar={(v) => setNiveis((atual) => atual.map((n, j) => (j === i ? v : n)))}
                            opcoes={NIVEIS_DIMENSAO}
                            rotuloVazio={EM_BRANCO}
                            atributos={p}
                          />
                        )}
                      </Campo>
                      <Campo rotulo="Média" ajuda="De 1,00 a 5,00, opcional" erro={erros.medias?.[i]}>
                        {(p) => (
                          <Input
                            {...p}
                            name={`media-${i}`}
                            inputMode="decimal"
                            className="font-mono"
                            defaultValue={valores?.medias[i] ?? mediaComoTexto(linha?.media ?? null)}
                          />
                        )}
                      </Campo>
                      <Campo rotulo="Principal lacuna">
                        {(p) => <Input {...p} name={`lacuna-${i}`} defaultValue={valores?.lacunas[i] ?? linha?.lacuna ?? ''} />}
                      </Campo>
                    </div>
                  )}
                </Campo>
              </div>
            )
          })}
        </div>
      </Painel>

      <Painel titulo="Resultado">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Maturidade geral">
            {(p) => (
              <SelecaoDoFormulario
                nome="maturidadeGeral"
                valor={maturidadeGeral}
                aoMudar={setMaturidadeGeral}
                opcoes={NIVEIS_GERAIS}
                rotuloVazio={EM_BRANCO}
                atributos={p}
              />
            )}
          </Campo>
          <Campo rotulo="Prontidão">
            {(p) => (
              <SelecaoDoFormulario
                nome="prontidao"
                valor={prontidao}
                aoMudar={setProntidao}
                opcoes={PRONTIDOES}
                rotuloVazio={EM_BRANCO}
                atributos={p}
              />
            )}
          </Campo>
        </div>
      </Painel>

      <Painel titulo="Parecer">
        <div className="space-y-4">
          <Campo rotulo="Pontos fortes">
            {(p) => <Textarea {...p} name="pontosFortes" defaultValue={valores?.pontosFortes ?? avaliacao?.pontosFortes ?? ''} />}
          </Campo>
          <Campo rotulo="Lacunas prioritárias">
            {(p) => (
              <Textarea
                {...p}
                name="lacunasPrioritarias"
                defaultValue={valores?.lacunasPrioritarias ?? avaliacao?.lacunasPrioritarias ?? ''}
              />
            )}
          </Campo>
          <Campo rotulo="Recomendação ELO">
            {(p) => <Textarea {...p} name="recomendacao" defaultValue={valores?.recomendacao ?? avaliacao?.recomendacao ?? ''} />}
          </Campo>
          <Campo rotulo="Observações internas" ajuda="Uso interno. Não sai na Visão Executiva nem no PDF">
            {(p) => (
              <Textarea
                {...p}
                name="observacoesInternas"
                defaultValue={valores?.observacoesInternas ?? avaliacao?.observacoesInternas ?? ''}
              />
            )}
          </Campo>
        </div>
      </Painel>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" carregando={enviando}>
          Salvar
        </Button>
        <Link href={destino} className={buttonVariants({ variant: 'outline' })}>
          Cancelar
        </Link>
      </div>
    </form>
  )
}
