'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState, type FormEvent } from 'react'
import { Campo } from '@/components/elo/campo'
import { CampoArquivo } from '@/components/elo/campo-arquivo'
import { CampoData } from '@/components/elo/campo-data'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { SelecaoDoFormulario } from '@/components/elo/selecao-do-formulario'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { avisarSalvo } from '@/lib/avisos'
import type { OpcoesDeVinculo } from '@/lib/dados/opcoes-documento'
import type { DocumentoDetalhado } from '@/lib/dados/tipos'
import { incluirDocumento } from '@/lib/documentos/acoes'
import { ESTADO_INICIAL_DOCUMENTO } from '@/lib/documentos/estados'
import { ACEITAR_ARQUIVO, DOCUMENTO_DO_ESPECIALISTA, erroDoArquivo } from '@/lib/documentos/regras'
import type { DadosDocumento } from '@/lib/documentos/validacao'
import { formatarData, formatarTamanho } from '@/lib/formato'
import { ETAPAS } from '@/lib/jornada/regras'

const opcao = (o: { id: string; rotulo: string }) => ({ valor: o.id, rotulo: o.rotulo })

/**
 * Inclusão e edição do documento (parte 6, 4.2 e 4.4; F12). Uma página só para todos os registros: os vínculos chegam
 * preenchidos pelo endereço, e as opções descem a partir do cliente escolhido (RN-02). Na inclusão, o arquivo é
 * conferido na tela antes de enviar e guardado no estado, para não se perder quando o servidor recusa outro campo; a
 * ação confere tudo de novo. Na edição, a data e o arquivo ficam só leitura (matriz 4.3): o arquivo muda por nova
 * versão. Quem confere tudo é o servidor; com `noValidate`, valem as mensagens da plataforma.
 */
export function FormularioDocumento({
  documento,
  inicial,
  substitui,
  categorias,
  opcoes,
  semClientePermitido,
  voltar,
}: {
  /** Na edição; null na inclusão. */
  documento: DocumentoDetalhado | null
  inicial: DadosDocumento
  /** Na nova versão: o documento que passa a Superado (DF-44). */
  substitui: { id: string; nome: string } | null
  categorias: string[]
  opcoes: OpcoesDeVinculo
  /** O Administrador pode deixar o Documento do Especialista sem cliente (DF-65). */
  semClientePermitido: boolean
  voltar: string
}) {
  const router = useRouter()
  const editando = documento !== null
  const [estado, enviar, enviando] = useActionState(incluirDocumento, ESTADO_INICIAL_DOCUMENTO)
  const [categoria, setCategoria] = useState(inicial.categoria)
  const [clienteId, setClienteId] = useState(inicial.clienteId)
  const [especialistaId, setEspecialistaId] = useState(inicial.especialistaId)
  const [contratoId, setContratoId] = useState(inicial.contratoId)
  const [escopoId, setEscopoId] = useState(inicial.escopoId)
  const [etapa, setEtapa] = useState(inicial.etapa)
  const [planoId, setPlanoId] = useState(inicial.planoId)
  const [atividadeId, setAtividadeId] = useState(inicial.atividadeId)
  const [demandaNumero, setDemandaNumero] = useState(inicial.demandaNumero)
  const [avaliacaoId, setAvaliacaoId] = useState(inicial.avaliacaoId)
  const [data, setData] = useState<string | null>(inicial.data || null)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [erroArquivoNaTela, setErroArquivoNaTela] = useState<string | null>(null)

  useEffect(() => {
    if (!estado.sucesso) return
    avisarSalvo(estado.sucesso.mensagem)
    router.push(estado.sucesso.destino)
  }, [estado, router])

  // Depois de um erro, o React limpa o formulário: o valor padrão devolve o que foi digitado.
  const valorInicial = (campo: 'nome' | 'observacoes') => estado.valores?.[campo] ?? inicial[campo]
  const erros = estado.erros
  const doEspecialista = categoria === DOCUMENTO_DO_ESPECIALISTA

  const contratos = opcoes.contratos.filter((c) => c.clienteId === clienteId)
  const escopos = opcoes.escopos.filter((e) => e.clienteId === clienteId && (!contratoId || e.contratoId === contratoId))
  const planos = opcoes.planos.filter((p) => p.escopoId === escopoId)
  const atividades = opcoes.atividades.filter((a) => a.planoId === planoId)
  const demandas = opcoes.demandas.filter((d) => d.clienteId === clienteId)
  const avaliacoes = opcoes.avaliacoes.filter((a) => a.clienteId === clienteId)

  /** Trocar o cliente limpa todos os vínculos, que são dele (RN-02). */
  function mudarCliente(valor: string) {
    setClienteId(valor)
    for (const limpar of [setContratoId, setEscopoId, setEtapa, setPlanoId, setAtividadeId, setDemandaNumero, setAvaliacaoId]) {
      limpar('')
    }
  }
  function mudarContrato(valor: string) {
    setContratoId(valor)
    if (valor && opcoes.escopos.find((e) => e.id === escopoId)?.contratoId !== valor) mudarEscopo('')
  }
  /** O escopo leva o contrato dele; trocar o escopo limpa a etapa, o plano e a atividade. */
  function mudarEscopo(valor: string) {
    setEscopoId(valor)
    const escopo = opcoes.escopos.find((e) => e.id === valor)
    if (escopo) setContratoId(escopo.contratoId)
    if (!valor) setEtapa('')
    setPlanoId('')
    setAtividadeId('')
  }
  function mudarPlano(valor: string) {
    setPlanoId(valor)
    setAtividadeId('')
  }
  function mudarCategoria(valor: string) {
    setCategoria(valor)
    if (valor !== DOCUMENTO_DO_ESPECIALISTA) setEspecialistaId('')
  }

  function escolherArquivo(novo: File | null) {
    setArquivo(novo)
    setErroArquivoNaTela(novo ? erroDoArquivo({ nome: novo.name, tamanho: novo.size }) : null)
  }

  /** A tela confere o arquivo escolhido antes de enviar (CA-12.2); sem arquivo, o servidor diz o que falta. */
  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    if (!editando && arquivo && erroDoArquivo({ nome: arquivo.name, tamanho: arquivo.size })) evento.preventDefault()
  }

  /** O arquivo vai do estado: o controle do arquivo não tem nome, para não ser limpo pelo React com o formulário. */
  function acao(formData: FormData) {
    if (!editando && arquivo) formData.set('arquivo', arquivo)
    enviar(formData)
  }

  return (
    <form action={acao} onSubmit={aoEnviar} noValidate className="space-y-5">
      {documento ? <input type="hidden" name="id" value={documento.id} /> : null}
      <input type="hidden" name="origem" value={inicial.origem} />
      {substitui ? <input type="hidden" name="substitui" value={substitui.id} /> : null}
      {estado.erroGeral ? (
        <Alert variant="destructive">
          <AlertDescription>{estado.erroGeral}</AlertDescription>
        </Alert>
      ) : null}
      {substitui ? (
        <Alert>
          <AlertDescription>
            Nova versão de <strong className="font-semibold">{substitui.nome}</strong>. Ao salvar, o anterior passa a
            Superado e fica ligado a este (DF-44).
          </AlertDescription>
        </Alert>
      ) : null}

      <Painel titulo="Documento">
        <div className="space-y-4">
          <Campo rotulo="Nome" obrigatorio erro={erros.nome}>
            {(p) => <Input {...p} name="nome" defaultValue={valorInicial('nome')} />}
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Categoria" obrigatorio erro={erros.categoria}>
              {(p) => (
                <SelecaoDoFormulario nome="categoria" valor={categoria} aoMudar={mudarCategoria} opcoes={categorias} atributos={p} />
              )}
            </Campo>
            {documento ? (
              <Campo rotulo="Data do documento" grupo>
                {() => (
                  <p className="text-sm font-medium text-foreground">
                    <Num>{formatarData(documento.data)}</Num>
                  </p>
                )}
              </Campo>
            ) : (
              <Campo rotulo="Data do documento" obrigatorio erro={erros.data}>
                {(p) => (
                  <>
                    <CampoData {...p} valor={data} onChange={setData} />
                    <input type="hidden" name="data" value={data ?? ''} />
                  </>
                )}
              </Campo>
            )}
          </div>
          {documento ? (
            <Campo rotulo="Arquivo" grupo ajuda="Para trocar o arquivo, envie uma nova versão.">
              {() => (
                <p className="flex flex-wrap items-baseline gap-x-2 text-sm font-medium text-foreground">
                  <span>{documento.arquivo.nome}</span>
                  <Num className="font-normal text-muted-foreground">{formatarTamanho(documento.arquivo.tamanho)}</Num>
                </p>
              )}
            </Campo>
          ) : (
            <Campo
              rotulo="Arquivo"
              obrigatorio
              erro={erroArquivoNaTela ?? erros.arquivo}
              ajuda="PDF, Word, Excel, PowerPoint, imagem (.jpg ou .png) ou e-mail salvo (.msg ou .eml), até 10 MB"
            >
              {(p) => <CampoArquivo {...p} aceitar={ACEITAR_ARQUIVO} onChange={escolherArquivo} />}
            </Campo>
          )}
          <Campo rotulo="Observações">
            {(p) => <Textarea {...p} name="observacoes" defaultValue={valorInicial('observacoes')} />}
          </Campo>
        </div>
      </Painel>

      <Painel titulo="Vínculos">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              rotulo="Cliente"
              obrigatorio={!(doEspecialista && semClientePermitido)}
              erro={erros.clienteId}
              ajuda={doEspecialista && semClientePermitido ? 'Sem cliente, todos consultam e baixam; só o Administrador altera' : undefined}
            >
              {(p) => (
                <SelecaoDoFormulario
                  nome="clienteId"
                  valor={clienteId}
                  aoMudar={mudarCliente}
                  opcoes={opcoes.clientes.map(opcao)}
                  rotuloVazio={doEspecialista && semClientePermitido ? 'Sem cliente' : undefined}
                  placeholder={doEspecialista && semClientePermitido ? 'Sem cliente' : 'Selecione'}
                  atributos={p}
                />
              )}
            </Campo>
            {doEspecialista ? (
              <Campo rotulo="Especialista" obrigatorio erro={erros.especialistaId}>
                {(p) => (
                  <SelecaoDoFormulario
                    nome="especialistaId"
                    valor={especialistaId}
                    aoMudar={setEspecialistaId}
                    opcoes={opcoes.especialistas.map(opcao)}
                    atributos={p}
                  />
                )}
              </Campo>
            ) : null}
          </div>
          {clienteId ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo rotulo="Contrato" erro={erros.contratoId}>
                  {(p) => (
                    <SelecaoDoFormulario
                      nome="contratoId"
                      valor={contratoId}
                      aoMudar={mudarContrato}
                      opcoes={contratos.map(opcao)}
                      rotuloVazio="Nenhum"
                      placeholder="Nenhum"
                      atributos={p}
                    />
                  )}
                </Campo>
                <Campo rotulo="Escopo Contratado" erro={erros.escopoId}>
                  {(p) => (
                    <SelecaoDoFormulario
                      nome="escopoId"
                      valor={escopoId}
                      aoMudar={mudarEscopo}
                      opcoes={escopos.map(opcao)}
                      rotuloVazio="Nenhum"
                      placeholder="Nenhum"
                      atributos={p}
                    />
                  )}
                </Campo>
              </div>
              {escopoId ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Campo rotulo="Etapa da Jornada" erro={erros.etapa}>
                    {(p) => (
                      <SelecaoDoFormulario
                        nome="etapa"
                        valor={etapa}
                        aoMudar={setEtapa}
                        opcoes={ETAPAS}
                        rotuloVazio="Nenhuma"
                        placeholder="Nenhuma"
                        atributos={p}
                      />
                    )}
                  </Campo>
                  <Campo rotulo="Plano de ação" erro={erros.planoId}>
                    {(p) => (
                      <SelecaoDoFormulario
                        nome="planoId"
                        valor={planoId}
                        aoMudar={mudarPlano}
                        opcoes={planos.map(opcao)}
                        rotuloVazio="Nenhum"
                        placeholder="Nenhum"
                        atributos={p}
                      />
                    )}
                  </Campo>
                </div>
              ) : null}
              {planoId ? (
                <Campo rotulo="Atividade" erro={erros.atividadeId}>
                  {(p) => (
                    <SelecaoDoFormulario
                      nome="atividadeId"
                      valor={atividadeId}
                      aoMudar={setAtividadeId}
                      opcoes={atividades.map(opcao)}
                      rotuloVazio="Nenhuma"
                      placeholder="Nenhuma"
                      atributos={p}
                    />
                  )}
                </Campo>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo rotulo="Demanda" erro={erros.demandaNumero}>
                  {(p) => (
                    <SelecaoDoFormulario
                      nome="demandaNumero"
                      valor={demandaNumero}
                      aoMudar={setDemandaNumero}
                      opcoes={demandas.map(opcao)}
                      rotuloVazio="Nenhuma"
                      placeholder="Nenhuma"
                      atributos={p}
                    />
                  )}
                </Campo>
                <Campo rotulo="Avaliação de maturidade" erro={erros.avaliacaoId}>
                  {(p) => (
                    <SelecaoDoFormulario
                      nome="avaliacaoId"
                      valor={avaliacaoId}
                      aoMudar={setAvaliacaoId}
                      opcoes={avaliacoes.map(opcao)}
                      rotuloVazio="Nenhuma"
                      placeholder="Nenhuma"
                      atributos={p}
                    />
                  )}
                </Campo>
              </div>
            </>
          ) : null}
        </div>
      </Painel>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" carregando={enviando}>
          {editando ? 'Salvar' : 'Incluir documento'}
        </Button>
        <Link href={voltar} className={buttonVariants({ variant: 'outline' })}>
          Cancelar
        </Link>
      </div>
    </form>
  )
}
