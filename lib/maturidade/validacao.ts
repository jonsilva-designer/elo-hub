import { dataExiste } from '@/lib/formato'
import { lerMedia } from './regras'

// Validação da avaliação de maturidade (parte 2, 5.8), no servidor. As mensagens são provisórias (DT-03).
// A plataforma não confere se a média bate com o nível (RN-25): o avaliador informa os dois.

export const MENSAGENS_AVALIACAO = {
  data: 'Informe a data da avaliação.',
  avaliador: 'Escolha o avaliador.',
  avaliadorSemVinculo: 'O avaliador precisa ter vínculo com o cliente.',
  media: 'A média vai de 1,00 a 5,00.',
  concluida: 'Esta avaliação está concluída e não muda. O Administrador pode reabri-la.',
}

export type DadosAvaliacao = {
  data: string
  avaliadorId: string
  contratoId: string
  niveis: string[]
  medias: string[]
  lacunas: string[]
  maturidadeGeral: string
  prontidao: string
  pontosFortes: string
  lacunasPrioritarias: string
  recomendacao: string
  observacoesInternas: string
}

export type ErrosAvaliacao = { data?: string; avaliadorId?: string; medias?: Record<number, string> }

const texto = (formData: FormData, campo: string) => {
  const valor = formData.get(campo)
  return typeof valor === 'string' ? valor.trim() : ''
}

/**
 * Os campos do formulário, sem espaços nas pontas. As dimensões são lidas pelo índice, de 0 até
 * `quantidadeDeDimensoes - 1`: quem diz quais são as dimensões é o servidor, e não o navegador.
 */
export function lerDadosAvaliacao(formData: FormData, quantidadeDeDimensoes: number): DadosAvaliacao {
  const linhas = Array.from({ length: quantidadeDeDimensoes }, (_, i) => i)
  return {
    data: texto(formData, 'data'),
    avaliadorId: texto(formData, 'avaliadorId'),
    contratoId: texto(formData, 'contratoId'),
    niveis: linhas.map((i) => texto(formData, `nivel-${i}`)),
    medias: linhas.map((i) => texto(formData, `media-${i}`)),
    lacunas: linhas.map((i) => texto(formData, `lacuna-${i}`)),
    maturidadeGeral: texto(formData, 'maturidadeGeral'),
    prontidao: texto(formData, 'prontidao'),
    pontosFortes: texto(formData, 'pontosFortes'),
    lacunasPrioritarias: texto(formData, 'lacunasPrioritarias'),
    recomendacao: texto(formData, 'recomendacao'),
    observacoesInternas: texto(formData, 'observacoesInternas'),
  }
}

/** A data no formato AAAA-MM-DD e que existe no calendário: 31/02 não vira 03/03. */
function dataValida(data: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data)
  return m !== null && dataExiste(Number(m[1]), Number(m[2]), Number(m[3]))
}

/** Os erros por campo; vazio quando está tudo certo. Níveis em branco valem enquanto Em elaboração. */
export function validarAvaliacao(dados: DadosAvaliacao, avaliadoresPermitidos: readonly string[]): ErrosAvaliacao {
  const erros: ErrosAvaliacao = {}
  if (!dataValida(dados.data.trim())) erros.data = MENSAGENS_AVALIACAO.data

  const avaliador = dados.avaliadorId.trim()
  if (!avaliador) erros.avaliadorId = MENSAGENS_AVALIACAO.avaliador
  else if (!avaliadoresPermitidos.includes(avaliador)) erros.avaliadorId = MENSAGENS_AVALIACAO.avaliadorSemVinculo

  const medias: Record<number, string> = {}
  dados.medias.forEach((media, i) => {
    if (lerMedia(media) === 'invalida') medias[i] = MENSAGENS_AVALIACAO.media
  })
  if (Object.keys(medias).length > 0) erros.medias = medias

  return erros
}
