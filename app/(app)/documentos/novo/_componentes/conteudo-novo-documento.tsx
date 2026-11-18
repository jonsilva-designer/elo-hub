import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { AcessoNegado, EstadoVazio } from '@/components/elo/estados'
import { LinkVoltar } from '@/components/elo/link-voltar'
import { Button } from '@/components/ui/button'
import { obterDocumento, usuarioAlteraDocumento } from '@/lib/dados/documentos'
import { listarCategoriasDeDocumento } from '@/lib/dados/listas'
import { opcoesDeVinculoDoDocumento, type OpcoesDeVinculo } from '@/lib/dados/opcoes-documento'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { DOCUMENTO_DO_ESPECIALISTA } from '@/lib/documentos/regras'
import { completarVinculos, destinoDaInclusao, MENSAGENS_DOCUMENTO, type DadosDocumento } from '@/lib/documentos/validacao'
import { ETAPAS } from '@/lib/jornada/regras'
import { FormularioDocumento } from '../../_componentes/formulario-documento'

type Busca = Record<string, string | string[] | undefined>

const primeiro = (valor: string | string[] | undefined) => (Array.isArray(valor) ? valor[0] : valor)

const VAZIO: DadosDocumento = {
  id: '',
  nome: '',
  categoria: '',
  clienteId: '',
  especialistaId: '',
  contratoId: '',
  escopoId: '',
  etapa: '',
  planoId: '',
  atividadeId: '',
  demandaNumero: '',
  avaliacaoId: '',
  data: '',
  observacoes: '',
  substitui: '',
  origem: '',
}

/** Os vínculos que o endereço pode trazer, do mais específico ao mais geral: vale o primeiro presente. */
const ORIGENS = [
  { parametro: 'atividade', campo: 'atividadeId', lista: 'atividades' },
  { parametro: 'plano', campo: 'planoId', lista: 'planos' },
  { parametro: 'escopo', campo: 'escopoId', lista: 'escopos' },
  { parametro: 'contrato', campo: 'contratoId', lista: 'contratos' },
  { parametro: 'demanda', campo: 'demandaNumero', lista: 'demandas' },
  { parametro: 'avaliacao', campo: 'avaliacaoId', lista: 'avaliacoes' },
  { parametro: 'especialista', campo: 'especialistaId', lista: 'especialistas' },
  { parametro: 'cliente', campo: 'clienteId', lista: 'clientes' },
] as const satisfies readonly { parametro: string; campo: keyof DadosDocumento; lista: keyof OpcoesDeVinculo }[]

/**
 * Incluir documento (parte 6, 4.2 e 4.4; UC-15). Aberta a partir de um registro (`?atividade=`, `?escopo=` e os outros),
 * já vem ligada a ele e volta para ele; o registro fora do alcance do usuário dá "não encontrado" (CA-12.5). Aberta por
 * "Enviar nova versão" (`?substitui=`), vem preenchida com o anterior: quem não pode alterá-lo vê o acesso negado
 * (DF-65), e só o Vigente recebe nova versão (6.1).
 */
export async function ConteudoNovoDocumento({ searchParams }: { searchParams: Promise<Busca> }) {
  const busca = await searchParams
  const [usuario, categorias, opcoes] = await Promise.all([
    obterUsuarioAtual(),
    listarCategoriasDeDocumento(),
    opcoesDeVinculoDoDocumento(),
  ])

  let inicial: DadosDocumento = { ...VAZIO }
  let voltar = { href: '/documentos', rotulo: 'Documentos' }
  let substitui: { id: string; nome: string } | null = null

  const idAnterior = primeiro(busca.substitui)
  if (idAnterior) {
    const anterior = await obterDocumento(idAnterior)
    if (!anterior) notFound()
    voltar = { href: `/documentos/${anterior.id}`, rotulo: anterior.nome }
    const cabecalho = (
      <>
        <div className="mb-3">
          <LinkVoltar href={voltar.href} rotulo={voltar.rotulo} />
        </div>
        <CabecalhoPagina titulo="Nova versão" />
      </>
    )
    if (!(await usuarioAlteraDocumento(anterior))) {
      return (
        <>
          {cabecalho}
          <AcessoNegado />
        </>
      )
    }
    if (anterior.status !== 'Vigente' || anterior.inativo) {
      return (
        <>
          {cabecalho}
          <EstadoVazio
            titulo={MENSAGENS_DOCUMENTO.soVigente}
            acao={
              <Button asChild variant="outline">
                <Link href={voltar.href}>Voltar ao documento</Link>
              </Button>
            }
          />
        </>
      )
    }
    substitui = { id: anterior.id, nome: anterior.nome }
    inicial = {
      ...VAZIO,
      nome: anterior.nome,
      categoria: anterior.categoria,
      clienteId: anterior.clienteId ?? '',
      especialistaId: anterior.especialistaId ?? '',
      contratoId: anterior.contratoId ?? '',
      escopoId: anterior.escopoId ?? '',
      etapa: anterior.etapa ?? '',
      planoId: anterior.planoId ?? '',
      atividadeId: anterior.atividadeId ?? '',
      demandaNumero: anterior.demandaNumero ?? '',
      avaliacaoId: anterior.avaliacaoId ?? '',
      substitui: anterior.id,
      origem: 'substitui',
    }
  } else {
    const origem = ORIGENS.find((o) => primeiro(busca[o.parametro]))
    if (origem) {
      const id = primeiro(busca[origem.parametro])!
      const registro = (opcoes[origem.lista] as { id: string; rotulo: string }[]).find((r) => r.id === id)
      if (!registro) notFound()
      inicial = completarVinculos({ ...VAZIO, [origem.campo]: id, origem: origem.parametro }, opcoes)
      if (origem.parametro === 'especialista') {
        inicial = { ...inicial, categoria: DOCUMENTO_DO_ESPECIALISTA, especialistaId: id }
      }
      const etapa = primeiro(busca.etapa)
      if (inicial.escopoId && etapa && (ETAPAS as string[]).includes(etapa)) inicial.etapa = etapa
      // O rótulo da volta: o nome do registro, sem o complemento da opção (a especialidade, o contratante).
      voltar = { href: destinoDaInclusao(inicial), rotulo: registro.rotulo.split(' · ')[0] }
      if (origem.parametro === 'demanda' || origem.parametro === 'atividade' || origem.parametro === 'plano') {
        voltar.rotulo = registro.rotulo
      }
    }
  }

  return (
    <>
      <div className="mb-3">
        <LinkVoltar href={voltar.href} rotulo={voltar.rotulo} />
      </div>
      <CabecalhoPagina titulo={substitui ? 'Nova versão' : 'Incluir documento'} />
      <FormularioDocumento
        documento={null}
        inicial={inicial}
        substitui={substitui}
        categorias={categorias}
        opcoes={opcoes}
        semClientePermitido={ehAdmin(usuario)}
        voltar={voltar.href}
      />
    </>
  )
}
