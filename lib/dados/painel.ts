import { filtrarAtividades, lerFiltrosAtividades } from '@/lib/atividades/filtros'
import { filtrarClientes, lerFiltros } from '@/lib/clientes/filtros'
import { filtrarContratos, lerFiltrosContratos } from '@/lib/contratos/filtros'
import { STATUS_DEMANDA_ABERTOS } from '@/lib/demandas/regras'
import { filtrarDemandas, lerFiltrosDemandas } from '@/lib/demandas/filtros'
import { CRITICIDADES, STATUS_ESCOPO, STATUS_ESCOPO_ABERTOS } from '@/lib/escopos/regras'
import { ETAPAS_ATUAIS, filtrarEscopos, lerFiltrosEscopos } from '@/lib/escopos/filtros'
import { listarAtividades } from './atividades'
import { listarClientes } from './clientes'
import { listarContratos } from './contratos'
import { listarDemandas } from './demandas'
import { listarEscopos } from './escopos'
import { obterUsuarioAtual } from './sessao'

// Indicadores do painel do Início (F13; arquitetura 3.3). Cada número é contado pela própria lista que ele abre: o
// endereço do indicador passa pelas mesmas funções de leitura e de filtro da tela da lista, com os dados já recortados
// pelo vínculo (RN-01). Assim, o número e a lista não divergem (CA-13.1, CA-13.3), e a Equipe só conta os seus
// clientes (CA-13.2).

export type Indicador = { rotulo: string; valor: number; href: string; tom?: 'atencao' | 'problema' | 'concluido' }

export type Painel = {
  clientesAtivos: Indicador
  /**
   * Vigentes, Próximos do vencimento e Vencidos são as partes dos contratos em vigor (Ativos e Suspensos); os
   * Suspensos são contados à parte, porque também estão nessas três (DF-25, DF-34, DF-54).
   */
  contratos: { emVigor: Indicador; vigentes: Indicador; proximos: Indicador; vencidos: Indicador; suspensos: Indicador }
  /** A etapa atual conta só os escopos abertos: o fechado já terminou a Jornada (CA-06.4, PRD v1.20). */
  escopos: { total: Indicador; porStatus: Indicador[]; porCriticidade: Indicador[]; porEtapa: Indicador[] }
  /** As abertas e as partes delas pelo prazo (no prazo, próximas, atrasadas), e as concluídas (RN-09, RN-10). */
  atividades: { abertas: Indicador; concluidas: Indicador; noPrazo: Indicador; proximas: Indicador; atrasadas: Indicador }
  demandas: { abertas: Indicador; porStatus: Indicador[]; porCriticidade: Indicador[] }
}

/** O endereço da lista com os parâmetros, com a vírgula legível, como as listas escrevem. */
function endereco(caminho: string, parametros: Record<string, string> = {}): string {
  const texto = new URLSearchParams(parametros).toString().replace(/%2C/g, ',')
  return texto ? `${caminho}?${texto}` : caminho
}

const DA_CRITICA_PARA_A_BAIXA = [...CRITICIDADES].reverse()

export async function indicadoresDoPainel(): Promise<Painel> {
  const usuario = await obterUsuarioAtual()
  const [clientes, contratos, escopos, atividades, demandas] = await Promise.all([
    listarClientes(),
    listarContratos(),
    listarEscopos(),
    listarAtividades(),
    listarDemandas(),
  ])

  /** O indicador com o número que a lista mostra ao abrir o endereço. */
  const indicador = (rotulo: string, href: string, tom?: Indicador['tom']): Indicador => {
    const url = new URL(href, 'http://plataforma')
    const p = url.searchParams
    const contagem: Record<string, () => number> = {
      '/clientes': () => filtrarClientes(clientes, lerFiltros(p, [])).length,
      '/contratos': () => filtrarContratos(contratos, lerFiltrosContratos(p, { clientes: [], contratantes: [], servicos: [] })).length,
      '/escopos': () => filtrarEscopos(escopos, lerFiltrosEscopos(p, { clientes: [], contratos: [], responsaveis: [] })).length,
      '/minhas-atividades': () =>
        filtrarAtividades(atividades, lerFiltrosAtividades(p, { usuarioId: usuario.id, responsaveis: [], escopos: [] })).length,
      '/central': () =>
        filtrarDemandas(demandas, lerFiltrosDemandas(p, { clientes: [], contratos: [], escopos: [], responsaveis: [] })).length,
    }
    return { rotulo, valor: contagem[url.pathname](), href, ...(tom ? { tom } : {}) }
  }

  const atividadesCom = (filtro: Record<string, string>) => endereco('/minhas-atividades', { responsavel: 'todos', ...filtro })
  const abertas = STATUS_DEMANDA_ABERTOS.join(',')

  return {
    // O cadastro da ELO fica fora (DF-40, CA-13.4).
    clientesAtivos: indicador('Clientes ativos', endereco('/clientes', { status: 'Ativo', carteira: 'sim' })),
    contratos: {
      emVigor: indicador('Contratos em vigor', endereco('/contratos', { vigencia: 'Vigente,Próximo do vencimento,Vencido' })),
      vigentes: indicador('Vigentes', endereco('/contratos', { vigencia: 'Vigente' })),
      proximos: indicador('Próximos do vencimento', endereco('/contratos', { vigencia: 'Próximo do vencimento' }), 'atencao'),
      vencidos: indicador('Vencidos', endereco('/contratos', { vigencia: 'Vencido' }), 'problema'),
      suspensos: indicador('Suspensos', endereco('/contratos', { status: 'Suspenso' }), 'atencao'),
    },
    escopos: {
      total: indicador('Escopos', '/escopos'),
      porStatus: STATUS_ESCOPO.map((s) => indicador(s, endereco('/escopos', { status: s }))),
      porCriticidade: DA_CRITICA_PARA_A_BAIXA.map((c) => indicador(c, endereco('/escopos', { criticidade: c }))),
      porEtapa: ETAPAS_ATUAIS.map((et) =>
        indicador(et, endereco('/escopos', { status: STATUS_ESCOPO_ABERTOS.join(','), etapa: et })),
      ),
    },
    atividades: {
      abertas: indicador('Abertas', atividadesCom({ status: 'Não iniciada,Em andamento' })),
      concluidas: indicador('Concluídas', atividadesCom({ status: 'Concluída' }), 'concluido'),
      noPrazo: indicador('No prazo', atividadesCom({ prazo: 'No prazo' })),
      proximas: indicador('Próximas do prazo', atividadesCom({ prazo: 'Próxima do prazo' }), 'atencao'),
      atrasadas: indicador('Atrasadas', atividadesCom({ prazo: 'Atrasada' }), 'problema'),
    },
    demandas: {
      abertas: indicador('Demandas abertas', endereco('/central', { status: abertas })),
      porStatus: STATUS_DEMANDA_ABERTOS.map((s) => indicador(s, endereco('/central', { status: s }))),
      porCriticidade: DA_CRITICA_PARA_A_BAIXA.map((c) => indicador(c, endereco('/central', { status: abertas, criticidade: c }))),
    },
  }
}
