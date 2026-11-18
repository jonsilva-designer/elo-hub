import { normalizarBusca } from '@/lib/texto'

// As listas oficiais (DF-01, DF-38, DF-70; arquitetura 4.3, `lista_item`). O Administrador inclui, renomeia, inativa,
// reativa e exclui o item nunca usado. As categorias de documento que entram em regras têm código fixo e não mudam.

export type ChaveLista =
  | 'servicos'
  | 'contratantes'
  | 'categorias'
  | 'especialidades'
  | 'segmentos'
  | 'dimensoes'
  | 'categoriasDeDocumento'

export const LISTAS: { chave: ChaveLista; rotulo: string }[] = [
  { chave: 'servicos', rotulo: 'Serviços' },
  { chave: 'contratantes', rotulo: 'Contratantes' },
  { chave: 'categorias', rotulo: 'Categorias da Central' },
  { chave: 'especialidades', rotulo: 'Especialidades' },
  { chave: 'segmentos', rotulo: 'Segmentos' },
  { chave: 'dimensoes', rotulo: 'Dimensões de maturidade' },
  { chave: 'categoriasDeDocumento', rotulo: 'Categorias de documento' },
]

/** Os itens que a plataforma usa em regras (arquitetura 4.3): não são renomeados, inativados nem excluídos. */
export const ITENS_FIXOS: Partial<Record<ChaveLista, string[]>> = {
  categoriasDeDocumento: ['Contrato', 'Proposta Comercial', 'Documento do Especialista'],
}

export const MENSAGENS_LISTA = {
  nome: 'Informe o nome.',
  repetido: 'Já existe um item com este nome na lista.',
  usado: 'Este item é usado em registros e não pode ser excluído. Inative-o.',
  fixo: 'Este item é usado nas regras da plataforma e não muda.',
  renomeado: 'Item renomeado. O novo nome vale para todos os registros que usam o item.',
  inativado: 'Item inativado. Ele sai das novas escolhas e continua nos registros.',
}

export function ehLista(chave: string): chave is ChaveLista {
  return LISTAS.some((l) => l.chave === chave)
}

/** O mesmo nome na lista: sem diferenciar maiúsculas, acentos e espaços nas pontas (CA-18.6, DF-69). */
export function mesmoNome(a: string, b: string): boolean {
  return normalizarBusca(a.trim()) === normalizarBusca(b.trim())
}
