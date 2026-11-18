import { ehLista, ITENS_FIXOS, type ChaveLista } from '@/lib/listas/regras'
import { AVALIACOES } from './mock/avaliacoes'
import { CLIENTES } from './mock/clientes'
import { CONTRATOS } from './mock/contratos'
import { DEMANDAS } from './mock/demandas'
import { DOCUMENTOS } from './mock/documentos'
import { ESPECIALISTAS } from './mock/especialistas'
import {
  CATEGORIAS,
  CATEGORIAS_DOCUMENTO,
  CONTRATANTES,
  DIMENSOES,
  ESPECIALIDADES,
  ITENS_INATIVOS,
  SEGMENTOS,
  SERVICOS,
} from './mock/listas'
import { ehAdmin } from './regras'
import { obterUsuarioAtual } from './sessao'

// A leitura das listas oficiais para a configuração (parte 8, 4.2): os itens ativos e os inativos, com quantos
// registros usam cada um, de todos os clientes (DF-38: o item usado não é excluído). Só o Administrador (CA-01.2).

export type ItemDaLista = { nome: string; uso: number; ativo: boolean; fixo: boolean }

const ATIVOS: Record<ChaveLista, string[]> = {
  servicos: SERVICOS,
  contratantes: CONTRATANTES,
  categorias: CATEGORIAS,
  especialidades: ESPECIALIDADES,
  segmentos: SEGMENTOS,
  dimensoes: DIMENSOES,
  categoriasDeDocumento: CATEGORIAS_DOCUMENTO,
}

/** Quantos registros usam o item: contratos, demandas, especialistas, clientes, avaliações ou documentos. */
function usoDoItem(lista: ChaveLista, nome: string): number {
  const contagem: Record<ChaveLista, () => number> = {
    servicos: () => CONTRATOS.filter((c) => c.servicos.includes(nome)).length,
    contratantes: () => CONTRATOS.filter((c) => c.contratante === nome).length,
    categorias: () => DEMANDAS.filter((d) => d.categoria === nome).length,
    especialidades: () => ESPECIALISTAS.filter((e) => e.especialidade === nome).length,
    segmentos: () => CLIENTES.filter((c) => c.segmento === nome).length,
    dimensoes: () => AVALIACOES.filter((a) => a.dimensoes.some((d) => d.dimensao === nome)).length,
    categoriasDeDocumento: () => DOCUMENTOS.filter((d) => d.categoria === nome).length,
  }
  return contagem[lista]()
}

/** Os itens da lista, os ativos na ordem oficial e depois os inativos. Vazia para a Equipe ou lista desconhecida. */
export async function listarItensDaLista(lista: string): Promise<ItemDaLista[]> {
  if (!ehAdmin(await obterUsuarioAtual()) || !ehLista(lista)) return []
  const fixos = ITENS_FIXOS[lista] ?? []
  const item = (nome: string, ativo: boolean): ItemDaLista => ({ nome, uso: usoDoItem(lista, nome), ativo, fixo: fixos.includes(nome) })
  return [
    ...ATIVOS[lista].map((nome) => item(nome, true)),
    ...ITENS_INATIVOS.filter((i) => i.lista === lista).map((i) => item(i.nome, false)),
  ]
}
