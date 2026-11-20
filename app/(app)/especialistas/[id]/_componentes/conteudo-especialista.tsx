import { Pencil } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { EtiquetaSinal, EtiquetaStatus } from '@/components/elo/etiquetas'
import { ListaCampos } from '@/components/elo/lista-campos'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { LinhaAutoria, PainelHistorico } from '@/components/elo/painel-historico'
import { Apagado, LinkExterno } from '@/components/elo/textos'
import { Button } from '@/components/ui/button'
import {
  candidaturasComOMesmoEmail,
  especialistaTemItensLigados,
  ligacoesDoEspecialista,
  obterEspecialista,
} from '@/lib/dados/especialistas'
import { listarHistorico } from '@/lib/dados/historico'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import type { EspecialistaDetalhado } from '@/lib/dados/tipos'
import { formatarData } from '@/lib/formato'
import { VoltarParaEspecialistas } from '../../_componentes/voltar-para-especialistas'
import { AcoesEspecialista } from './acoes-especialista'
import { TabelaCandidaturas, TabelaLigacoes } from './tabelas-especialista'
import { PainelDocumentos } from '../../../documentos/_componentes/painel-documentos'
import { listarDocumentosLigados } from '@/lib/dados/documentos'


const naoInformado = <Apagado>Não informado</Apagado>

const ou = (valor: string) => (valor.trim() ? valor : naoInformado)

/** Os campos do painel Dados do especialista (F11, DF-27). */
function camposDoEspecialista(e: EspecialistaDetalhado): { rotulo: string; valor: ReactNode }[] {
  return [
    { rotulo: 'E-mail', valor: e.email },
    { rotulo: 'Telefone', valor: <Num>{e.telefone}</Num> },
    { rotulo: 'Subespecialidade', valor: ou(e.subespecialidade) },
    { rotulo: 'Data de nascimento', valor: e.dataNascimento ? <Num>{formatarData(e.dataNascimento)}</Num> : naoInformado },
    { rotulo: 'Cidade/UF', valor: e.cidade ? `${e.cidade}${e.uf ? `/${e.uf}` : ''}` : naoInformado },
    { rotulo: 'Empresa', valor: ou(e.empresa) },
    {
      rotulo: 'Currículo ou LinkedIn',
      valor: e.curriculo ? (
        <LinkExterno href={e.curriculo}>Abrir o link</LinkExterno>
      ) : (
        naoInformado
      ),
    },
    { rotulo: 'Origem', valor: e.origem },
    { rotulo: 'Cadastrado em', valor: <Num>{formatarData(e.cadastradoEm)}</Num> },
  ]
}

/**
 * Página do especialista (parte 5, 5.6). Todos os usuários leem o cadastro (DF-02); os escopos e as demandas ligados
 * seguem o vínculo de quem vê (CA-11.4). Só o Administrador edita e exclui; excluir só sem vínculo (DF-33).
 */
export async function ConteudoEspecialista({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [usuario, especialista] = await Promise.all([obterUsuarioAtual(), obterEspecialista(id)])
  if (!especialista) notFound()
  const admin = ehAdmin(usuario)
  const [ligacoes, candidaturas, historico, ligado] = await Promise.all([
    ligacoesDoEspecialista(especialista.id),
    candidaturasComOMesmoEmail(especialista.id),
    listarHistorico('especialista', especialista.id),
    admin ? especialistaTemItensLigados(especialista.id) : Promise.resolve(true),
  ])

  const documentos = await listarDocumentosLigados({ especialistaId: especialista.id })
  return (
    <>
      <div className="mb-3">
        <VoltarParaEspecialistas />
      </div>
      <CabecalhoPagina
        titulo={especialista.nome}
        contexto={
          <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <span>{especialista.especialidade}</span>
            <span aria-hidden="true">·</span>
            <EtiquetaStatus status={especialista.status} />
            {especialista.emailRepetido ? <EtiquetaSinal texto="E-mail já cadastrado" tom="atencao" /> : null}
          </span>
        }
        acoes={
          admin ? (
            <>
              <Button asChild variant="outline">
                <Link href={`/especialistas/${especialista.id}/editar`}>
                  <Pencil aria-hidden="true" />
                  Editar
                </Link>
              </Button>
              {ligado ? null : <AcoesEspecialista especialistaId={especialista.id} />}
            </>
          ) : null
        }
      />
      <div className="space-y-5">
        <Painel titulo="Dados do especialista">
          <ListaCampos itens={camposDoEspecialista(especialista)} />
        </Painel>
        <Painel titulo="Observações internas">
          <div className="space-y-2">
            <p className="text-secundario text-muted-foreground">Uso interno da equipe da ELO.</p>
            <p className="text-sm text-foreground">{especialista.observacoes.trim() || naoInformado}</p>
          </div>
        </Painel>
        <Painel titulo="Escopos e demandas" semRespiro>
          <TabelaLigacoes ligacoes={ligacoes} />
        </Painel>
        {candidaturas.length > 0 ? (
          <Painel titulo="Outras candidaturas com o mesmo e-mail" semRespiro>
            <TabelaCandidaturas candidaturas={candidaturas} />
          </Painel>
        ) : null}
        <PainelDocumentos documentos={documentos} ligadoA={{ especialistaId: especialista.id }} vazio="Nenhum documento deste especialista." />
        <PainelHistorico entradas={historico} />
        <LinhaAutoria entradas={historico} />
      </div>
    </>
  )
}
