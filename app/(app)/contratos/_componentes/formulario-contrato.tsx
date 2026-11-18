'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { Campo } from '@/components/elo/campo'
import { CampoData } from '@/components/elo/campo-data'
import { CampoValor } from '@/components/elo/campo-valor'
import { EtiquetaStatus } from '@/components/elo/etiquetas'
import { Painel } from '@/components/elo/painel'
import { SelecaoDoFormulario } from '@/components/elo/selecao-do-formulario'
import { SelecaoMultipla } from '@/components/elo/selecao-multipla'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { avisarSalvo } from '@/lib/avisos'
import { salvarContrato } from '@/lib/contratos/acoes'
import { ESTADO_INICIAL_SALVAR_CONTRATO } from '@/lib/contratos/estados'
import { contratoFechado, STATUS_ABERTOS, STATUS_DO_CADASTRO, TIPOS_VIGENCIA, transicaoListada } from '@/lib/contratos/regras'
import { MENSAGENS_CONTRATO, type DadosContrato } from '@/lib/contratos/validacao'
import type { ContratoDetalhado, StatusContrato } from '@/lib/dados/tipos'
import { escreverValorEmReais } from '@/lib/formato'

type Opcao = { valor: string; rotulo: string }

const comoOpcoes = (lista: string[]): Opcao[] => lista.map((s) => ({ valor: s, rotulo: s }))

/**
 * Cadastro e edição do contrato ou proposta (F03, parte 3, 5.5). Quem confere tudo é o servidor; com `noValidate`,
 * valem as mensagens da plataforma. O responsável lista só quem tem vínculo com o cliente escolhido (RN-19).
 */
export function FormularioContrato({
  contrato,
  clienteInicial,
  clientes,
  responsaveisPorCliente,
  contratantes,
  servicos,
  documentos,
}: {
  contrato: ContratoDetalhado | null
  clienteInicial: string | null
  /** Os clientes que podem receber contrato. Só no cadastro: na edição, o cliente não muda. */
  clientes: Opcao[]
  responsaveisPorCliente: Record<string, Opcao[]>
  contratantes: string[]
  servicos: string[]
  /** Na edição: os Contratos e Propostas Comerciais ligados ao contrato e o principal de hoje (F03). */
  documentos?: { opcoes: Opcao[]; principal: string }
}) {
  const router = useRouter()
  const [estado, enviar, enviando] = useActionState(salvarContrato, ESTADO_INICIAL_SALVAR_CONTRATO)
  const [cliente, setCliente] = useState(contrato?.clienteId ?? clienteInicial ?? '')
  const [contratante, setContratante] = useState(contrato?.contratante ?? '')
  const [servicosEscolhidos, setServicosEscolhidos] = useState<string[]>(contrato?.servicos ?? [])
  const [responsavel, setResponsavel] = useState(contrato?.responsavelId ?? '')
  const [status, setStatus] = useState<string>(contrato?.status ?? '')
  const [principal, setPrincipal] = useState(documentos?.principal ?? '')
  const [tipoVigencia, setTipoVigencia] = useState<string>(contrato?.tipoVigencia ?? 'Prazo determinado')
  const [dataProposta, setDataProposta] = useState<string | null>(contrato?.dataProposta ?? null)
  const [inicio, setInicio] = useState<string | null>(contrato?.inicio ?? null)
  const [termino, setTermino] = useState<string | null>(contrato?.termino ?? null)
  const [valor, setValor] = useState<number | null>(contrato?.valor ?? null)

  useEffect(() => {
    if (!estado.sucesso) return
    avisarSalvo(estado.sucesso.mensagem)
    router.push(estado.sucesso.destino)
  }, [estado, router])

  // Depois de um erro, o React limpa o formulário: o valor padrão devolve o que foi digitado.
  const inicial = (campo: keyof Omit<DadosContrato, 'servicos'>, doContrato?: string) =>
    estado.valores?.[campo] ?? doContrato ?? ''
  const erros = estado.erros
  const fechado = contrato ? contratoFechado(contrato.status) : false
  const pedeJustificativa =
    contrato !== null && !fechado && status !== '' && !transicaoListada(contrato.status, status as StatusContrato)
  const indeterminado = tipoVigencia === 'Prazo indeterminado'
  const responsaveis = responsaveisPorCliente[cliente] ?? []
  const destino = contrato
    ? `/contratos/${contrato.id}`
    : clienteInicial
      ? `/clientes/${clienteInicial}?aba=contratos`
      : '/contratos'

  return (
    <form action={enviar} noValidate className="space-y-5">
      {contrato ? <input type="hidden" name="id" value={contrato.id} /> : null}
      {servicosEscolhidos.map((s) => (
        <input key={s} type="hidden" name="servicos" value={s} />
      ))}
      {estado.erroGeral ? (
        <Alert variant="destructive">
          <AlertDescription>{estado.erroGeral}</AlertDescription>
        </Alert>
      ) : null}

      <Painel titulo="Contrato">
        <div className="space-y-4">
          {contrato ? (
            <Campo rotulo="Cliente" grupo>
              {() => <p className="text-sm font-medium text-foreground">{contrato.nomeCliente}</p>}
            </Campo>
          ) : (
            <Campo rotulo="Cliente" obrigatorio erro={erros.clienteId}>
              {(p) => (
                <SelecaoDoFormulario
                  nome="clienteId"
                  valor={cliente}
                  aoMudar={(v) => {
                    setCliente(v)
                    setResponsavel('')
                  }}
                  opcoes={clientes}
                  atributos={p}
                />
              )}
            </Campo>
          )}
          <Campo rotulo="Código" obrigatorio erro={erros.codigo} ajuda="Número do contrato ou da proposta">
            {(p) => <Input {...p} name="codigo" className="font-mono" defaultValue={inicial('codigo', contrato?.codigo)} />}
          </Campo>
          <Campo rotulo="Contratante" obrigatorio erro={erros.contratante}>
            {(p) => (
              <SelecaoDoFormulario
                nome="contratante"
                valor={contratante}
                aoMudar={setContratante}
                opcoes={contratantes}
                atributos={p}
              />
            )}
          </Campo>
          <Campo rotulo="Objeto" obrigatorio erro={erros.objeto}>
            {(p) => <Input {...p} name="objeto" defaultValue={inicial('objeto', contrato?.objeto)} />}
          </Campo>
          <Campo rotulo="Serviços" obrigatorio erro={erros.servicos} ajuda="Um ou mais, da lista oficial">
            {(p) => (
              <SelecaoMultipla
                {...p}
                opcoes={comoOpcoes(servicos)}
                valores={servicosEscolhidos}
                onChange={setServicosEscolhidos}
              />
            )}
          </Campo>
          <Campo rotulo="Responsável ELO" obrigatorio erro={erros.responsavelId}>
            {(p) => (
              <SelecaoDoFormulario
                nome="responsavelId"
                valor={responsavel}
                aoMudar={setResponsavel}
                opcoes={responsaveis}
                atributos={p}
                disabled={!cliente}
                placeholder={cliente ? 'Selecione' : 'Escolha o cliente primeiro'}
              />
            )}
          </Campo>
          {fechado && contrato ? (
            // Só leitura: o contrato fechado só volta por Reabrir, que pede a justificativa (RN-22).
            <Campo rotulo="Status" grupo ajuda={MENSAGENS_CONTRATO.fechado}>
              {() => (
                <div>
                  <EtiquetaStatus status={contrato.status} />
                  <input type="hidden" name="status" value={contrato.status} />
                </div>
              )}
            </Campo>
          ) : (
            <Campo rotulo="Status" obrigatorio erro={erros.status}>
              {(p) => (
                <SelecaoDoFormulario
                  nome="status"
                  valor={status}
                  aoMudar={setStatus}
                  opcoes={contrato ? STATUS_ABERTOS : STATUS_DO_CADASTRO}
                  atributos={p}
                  className="w-full sm:w-52"
                />
              )}
            </Campo>
          )}
          {pedeJustificativa ? (
            <Campo
              rotulo="Justificativa"
              obrigatorio
              ajuda="Esta mudança de status é uma correção: diga o motivo."
              erro={erros.justificativa}
            >
              {(p) => <Textarea {...p} name="justificativa" defaultValue={inicial('justificativa')} />}
            </Campo>
          ) : null}
        </div>
      </Painel>

      <Painel titulo="Vigência">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Tipo de vigência" obrigatorio erro={erros.tipoVigencia}>
            {(p) => (
              <SelecaoDoFormulario
                nome="tipoVigencia"
                valor={tipoVigencia}
                aoMudar={setTipoVigencia}
                opcoes={TIPOS_VIGENCIA}
                atributos={p}
              />
            )}
          </Campo>
          <Campo rotulo="Data da proposta" erro={erros.dataProposta}>
            {(p) => (
              <>
                <CampoData {...p} valor={dataProposta} onChange={setDataProposta} />
                <input type="hidden" name="dataProposta" value={dataProposta ?? ''} />
              </>
            )}
          </Campo>
          <Campo rotulo="Início da vigência" erro={erros.inicio} ajuda="Obrigatório em Ativo e Suspenso">
            {(p) => (
              <>
                <CampoData {...p} valor={inicio} onChange={setInicio} />
                <input type="hidden" name="inicio" value={inicio ?? ''} />
              </>
            )}
          </Campo>
          {indeterminado ? null : (
            <Campo rotulo="Término da vigência" erro={erros.termino} ajuda="Obrigatório em Ativo e Suspenso">
              {(p) => (
                <>
                  <CampoData {...p} valor={termino} onChange={setTermino} />
                  <input type="hidden" name="termino" value={termino ?? ''} />
                </>
              )}
            </Campo>
          )}
          <Campo rotulo="Valor" erro={erros.valor}>
            {(p) => (
              <>
                <CampoValor {...p} valor={valor} onChange={setValor} />
                <input type="hidden" name="valor" value={escreverValorEmReais(valor)} />
              </>
            )}
          </Campo>
        </div>
      </Painel>

      <Painel titulo="Outros">
        <div className="space-y-4">
          <Campo
            rotulo="Documento principal"
            erro={estado.erros.documentoPrincipalId}
            ajuda={
              contrato
                ? 'Um Contrato ou Proposta Comercial já incluído neste contrato'
                : 'Inclua o documento depois de salvar o contrato.'
            }
          >
            {(p) => (
              <SelecaoDoFormulario
                nome="documentoPrincipalId"
                valor={principal}
                aoMudar={setPrincipal}
                opcoes={documentos?.opcoes ?? []}
                rotuloVazio="Nenhum"
                atributos={p}
                disabled={!contrato}
                placeholder="Nenhum"
              />
            )}
          </Campo>
          <Campo rotulo="Observações">
            {(p) => <Textarea {...p} name="observacoes" defaultValue={inicial('observacoes', contrato?.observacoes)} />}
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
