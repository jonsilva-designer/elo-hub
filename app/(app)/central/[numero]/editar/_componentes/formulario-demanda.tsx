'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { Campo } from '@/components/elo/campo'
import { CampoData } from '@/components/elo/campo-data'
import { Painel } from '@/components/elo/painel'
import { SelecaoDoFormulario } from '@/components/elo/selecao-do-formulario'
import { SelecaoMultipla } from '@/components/elo/selecao-multipla'
import { OpcaoRadio, ValorFixo } from '@/components/elo/textos'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { avisarSalvo } from '@/lib/avisos'
import type { DemandaDetalhada } from '@/lib/dados/tipos'
import { salvarDemanda } from '@/lib/demandas/acoes'
import { ESTADO_INICIAL_SALVAR_DEMANDA } from '@/lib/demandas/estados'
import { ORIGENS_DEMANDA } from '@/lib/demandas/regras'
import type { DadosDemanda } from '@/lib/demandas/validacao'
import type { Criticidade } from '@/lib/design/status'
import { CRITICIDADES } from '@/lib/escopos/regras'

type Opcao = { valor: string; rotulo: string }

/** A orientação da DF-22: a referência de prazo da criticidade, sem preencher o prazo (CA-09.14). */
function referenciaDoPrazo(criticidade: string, referencias: Partial<Record<Criticidade, number>>): string | undefined {
  if (!criticidade) return undefined
  const dias = referencias[criticidade as Criticidade]
  return dias === undefined
    ? 'Sem referência de prazo cadastrada para esta criticidade.'
    : `Referência de prazo para a criticidade ${criticidade}: ${dias} dias. O prazo não é preenchido sozinho.`
}

/**
 * Editar a demanda (parte 5, 5.11): os dados e a triagem. O cliente não muda. Especialista novo só Ativo; com mais
 * de um, o principal é obrigatório (DF-32). Quem confere tudo é o servidor; com `noValidate`, valem as mensagens da
 * plataforma.
 */
export function FormularioDemanda({
  demanda,
  ehCadastroElo,
  contratos,
  escopos,
  categorias,
  responsaveis,
  especialistas,
  referencias,
}: {
  demanda: DemandaDetalhada
  ehCadastroElo: boolean
  contratos: Opcao[]
  escopos: (Opcao & { contratoId: string })[]
  categorias: string[]
  responsaveis: Opcao[]
  especialistas: Opcao[]
  referencias: Partial<Record<Criticidade, number>>
}) {
  // Quem responde hoje continua nas opções, mesmo sem vínculo, para o campo não parecer vazio (revisão do código).
  const comResponsavelDeHoje = (id: string | null, nome: string) =>
    id && !responsaveis.some((r) => r.valor === id) ? [...responsaveis, { valor: id, rotulo: `${nome} (sem vínculo)` }] : responsaveis
  const router = useRouter()
  const [estado, enviar, enviando] = useActionState(salvarDemanda, ESTADO_INICIAL_SALVAR_DEMANDA)
  const [contratoId, setContratoId] = useState(demanda.contratoId ?? '')
  const [escopoId, setEscopoId] = useState(demanda.escopoId ?? '')
  const [origem, setOrigem] = useState<string>(demanda.origem)
  const [categoria, setCategoria] = useState(demanda.categoria ?? '')
  const [criticidade, setCriticidade] = useState<string>(demanda.criticidade ?? '')
  const [prazo, setPrazo] = useState<string | null>(demanda.prazo)
  const [triagem, setTriagem] = useState(demanda.responsavelTriagemId)
  const [atendimento, setAtendimento] = useState(demanda.responsavelAtendimentoId ?? '')
  const [escolhidos, setEscolhidos] = useState<string[]>(demanda.especialistas.map((e) => e.id))
  const [principal, setPrincipal] = useState(demanda.especialistas.find((e) => e.principal)?.id ?? '')

  useEffect(() => {
    if (!estado.sucesso) return
    avisarSalvo(estado.sucesso.mensagem)
    router.push(estado.sucesso.destino)
  }, [estado, router])

  const inicial = (campo: 'assunto' | 'descricao') => (estado.valores as DadosDemanda | null)?.[campo] ?? demanda[campo]
  const erros = estado.erros
  const origens = ORIGENS_DEMANDA.filter((o) => (ehCadastroElo ? o === 'Institucional' : o !== 'Institucional'))
  const escoposDoContrato = escopos.filter((e) => !contratoId || e.contratoId === contratoId)
  const rotuloDe = (id: string) => especialistas.find((e) => e.valor === id)?.rotulo.split(' · ')[0] ?? id

  return (
    <form action={enviar} noValidate className="space-y-5">
      <input type="hidden" name="numero" value={demanda.numero} />
      {estado.erroGeral ? (
        <Alert variant="destructive">
          <AlertDescription>{estado.erroGeral}</AlertDescription>
        </Alert>
      ) : null}

      <Painel titulo="Dados">
        <div className="space-y-4">
          <Campo rotulo="Cliente" grupo>
            {() => <ValorFixo>{demanda.nomeCliente}</ValorFixo>}
          </Campo>
          {ehCadastroElo ? null : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo rotulo="Contrato" erro={erros.contratoId}>
                {(p) => (
                  <SelecaoDoFormulario
                    nome="contratoId"
                    valor={contratoId}
                    aoMudar={(id) => {
                      setContratoId(id)
                      setEscopoId('')
                    }}
                    opcoes={contratos}
                    rotuloVazio="Sem contrato"
                    placeholder="Sem contrato"
                    atributos={p}
                  />
                )}
              </Campo>
              <Campo rotulo="Escopo" erro={erros.escopoId}>
                {(p) => (
                  <SelecaoDoFormulario
                    nome="escopoId"
                    valor={escopoId}
                    aoMudar={setEscopoId}
                    opcoes={escoposDoContrato}
                    rotuloVazio="Sem escopo"
                    placeholder="Sem escopo"
                    atributos={p}
                  />
                )}
              </Campo>
            </div>
          )}
          <Campo rotulo="Origem" obrigatorio erro={erros.origem}>
            {(p) => (
              <SelecaoDoFormulario nome="origem" valor={origem} aoMudar={setOrigem} opcoes={origens} atributos={p} className="w-full sm:w-64" />
            )}
          </Campo>
          <Campo rotulo="Assunto" obrigatorio erro={erros.assunto}>
            {(p) => <Input {...p} name="assunto" defaultValue={inicial('assunto')} />}
          </Campo>
          <Campo rotulo="Descrição" obrigatorio erro={erros.descricao}>
            {(p) => <Textarea {...p} name="descricao" defaultValue={inicial('descricao')} />}
          </Campo>
        </div>
      </Painel>

      <Painel titulo="Triagem">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Categoria" erro={erros.categoria}>
              {(p) => (
                <SelecaoDoFormulario
                  nome="categoria"
                  valor={categoria}
                  aoMudar={setCategoria}
                  opcoes={categorias}
                  rotuloVazio="Sem categoria"
                  placeholder="Sem categoria"
                  atributos={p}
                />
              )}
            </Campo>
            <Campo rotulo="Criticidade" erro={erros.criticidade} ajuda={referenciaDoPrazo(criticidade, referencias)}>
              {(p) => (
                <SelecaoDoFormulario
                  nome="criticidade"
                  valor={criticidade}
                  aoMudar={setCriticidade}
                  opcoes={CRITICIDADES}
                  rotuloVazio="Sem criticidade"
                  placeholder="Sem criticidade"
                  atributos={p}
                />
              )}
            </Campo>
          </div>
          <Campo rotulo="Prazo" erro={erros.prazo}>
            {(p) => (
              <>
                <CampoData {...p} valor={prazo} onChange={setPrazo} />
                <input type="hidden" name="prazo" value={prazo ?? ''} />
              </>
            )}
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Responsável pela triagem" obrigatorio erro={erros.responsavelTriagemId}>
              {(p) => (
                <SelecaoDoFormulario
                  nome="responsavelTriagemId"
                  valor={triagem}
                  aoMudar={setTriagem}
                  opcoes={comResponsavelDeHoje(demanda.responsavelTriagemId, demanda.nomeTriagem)}
                  atributos={p}
                />
              )}
            </Campo>
            <Campo rotulo="Responsável pelo atendimento" erro={erros.responsavelAtendimentoId}>
              {(p) => (
                <SelecaoDoFormulario
                  nome="responsavelAtendimentoId"
                  valor={atendimento}
                  aoMudar={setAtendimento}
                  opcoes={comResponsavelDeHoje(demanda.responsavelAtendimentoId, demanda.nomeAtendimento)}
                  rotuloVazio="Sem atendente"
                  placeholder="Sem atendente"
                  atributos={p}
                />
              )}
            </Campo>
          </div>
          <Campo rotulo="Especialistas" erro={erros.especialistas} ajuda="Só especialistas Ativos recebem vínculo novo">
            {(p) => (
              <>
                <SelecaoMultipla
                  {...p}
                  opcoes={especialistas}
                  valores={escolhidos}
                  onChange={(ids) => {
                    setEscolhidos(ids)
                    if (!ids.includes(principal)) setPrincipal(ids.length === 1 ? ids[0] : '')
                  }}
                  placeholder="Nenhum especialista"
                />
                {escolhidos.map((id) => (
                  <input key={id} type="hidden" name="especialistaIds" value={id} />
                ))}
              </>
            )}
          </Campo>
          {escolhidos.length > 1 ? (
            <Campo rotulo="Especialista principal" grupo obrigatorio>
              {(p) => (
                <RadioGroup {...p} value={principal} onValueChange={setPrincipal}>
                  {escolhidos.map((id) => (
                    <OpcaoRadio key={id} id={`principal-${id}`} valor={id}>{rotuloDe(id)}</OpcaoRadio>
                  ))}
                </RadioGroup>
              )}
            </Campo>
          ) : null}
          <input type="hidden" name="principalId" value={principal} />
        </div>
      </Painel>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" carregando={enviando}>
          Salvar
        </Button>
        <Link href={`/central/${demanda.numero}`} className={buttonVariants({ variant: 'outline' })}>
          Cancelar
        </Link>
      </div>
    </form>
  )
}
