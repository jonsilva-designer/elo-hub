import { nomeDoCliente } from '@/lib/clientes/filtros'
import { vigenciaDoContrato } from '@/lib/contratos/vigencia'
import { somarDias } from '@/lib/formato'
import { temDemandaLigada } from './demandas'
import { temDocumentoLigado } from './documentos'
import { hojeDaRequisicao } from './hoje'
import { CLIENTES } from './mock/clientes'
import { CONTRATOS, type ContratoFicticio } from './mock/contratos'
import { ESCOPOS } from './mock/escopos'
import { USUARIOS, VINCULOS } from './mock/usuarios'
import { obterDiasDoAlerta } from './parametros'
import { podeVerCliente } from './regras'
import { obterUsuarioAtual } from './sessao'
import type { Contrato, ContratoDetalhado } from './tipos'

// Leitura dos contratos e propostas (F03, F04). O usuário vem da sessão e a regra de vínculo (RN-01) vale pelo
// cliente do contrato. A vigência é calculada a cada leitura, com a data de hoje em Brasília (RN-04, RN-20).

/** O contrato como a plataforma o guarda: o término relativo do exemplo vira data. Uma cópia. */
function resolverContrato(c: ContratoFicticio, hoje: string): Contrato {
  const { terminoEmDias, ...contrato } = c
  return {
    ...contrato,
    servicos: [...c.servicos],
    termino: terminoEmDias === undefined ? c.termino : somarDias(hoje, terminoEmDias),
  }
}

function detalhar(c: ContratoFicticio, hoje: string, diasDoAlerta: number): ContratoDetalhado {
  const contrato = resolverContrato(c, hoje)
  const cliente = CLIENTES.find((x) => x.id === c.clienteId)
  return {
    ...contrato,
    nomeCliente: cliente ? nomeDoCliente(cliente) : '',
    nomeResponsavel: USUARIOS.find((u) => u.id === c.responsavelId)?.nome ?? '',
    vigencia: vigenciaDoContrato(contrato, hoje, diasDoAlerta),
  }
}

/** Os contratos que passam no filtro e que o usuário da sessão pode ver, já detalhados com a vigência de hoje. */
async function lerContratos(filtro: (c: ContratoFicticio) => boolean): Promise<ContratoDetalhado[]> {
  const usuario = await obterUsuarioAtual()
  const [hoje, diasDoAlerta] = await Promise.all([hojeDaRequisicao(), obterDiasDoAlerta()])
  return CONTRATOS.filter((c) => filtro(c) && podeVerCliente(usuario, c.clienteId, VINCULOS)).map((c) =>
    detalhar(c, hoje, diasDoAlerta),
  )
}

/** Os contratos que o usuário pode ver, na ordem do cadastro. */
export async function listarContratos(): Promise<ContratoDetalhado[]> {
  return lerContratos(() => true)
}

/** Os contratos do cliente, na ordem do cadastro. Vazia se o usuário não pode ver o cliente. */
export async function listarContratosDoCliente(clienteId: string): Promise<ContratoDetalhado[]> {
  return lerContratos((c) => c.clienteId === clienteId)
}

/** O contrato, ou null se ele não existe ou é de cliente fora do vínculo. A página chama notFound(). */
export async function obterContrato(id: string): Promise<ContratoDetalhado | null> {
  const [contrato] = await lerContratos((c) => c.id === id)
  return contrato ?? null
}

/**
 * Se o contrato tem algo ligado, que impede excluí-lo (RN-13, DF-33): escopos, demandas e documentos, também os
 * inativos. Fora do vínculo, false, sem revelar nada: as ações conferem o acesso antes.
 */
export async function contratoTemItensLigados(id: string): Promise<boolean> {
  const usuario = await obterUsuarioAtual()
  const contrato = CONTRATOS.find((c) => c.id === id)
  if (!contrato || !podeVerCliente(usuario, contrato.clienteId, VINCULOS)) return false
  return (
    ESCOPOS.some((e) => e.contratoId === id) ||
    (await temDemandaLigada({ contratoId: id })) ||
    (await temDocumentoLigado({ contratoId: id }))
  )
}
