import { ATIVIDADES } from './mock/atividades'
import { AVALIACOES } from './mock/avaliacoes'
import { CONTRATOS } from './mock/contratos'
import { ESCOPOS } from './mock/escopos'
import { DEMANDAS } from './mock/demandas'
import { DOCUMENTOS } from './mock/documentos'
import { ESPECIALISTAS } from './mock/especialistas'
import { HISTORICO } from './mock/historico'
import { PLANOS } from './mock/planos'
import { USUARIOS, VINCULOS } from './mock/usuarios'
import { podeVerDocumento } from '@/lib/documentos/regras'
import { podeVerCliente } from './regras'
import { obterUsuarioAtual } from './sessao'
import type { EntradaHistorico, TipoRegistro } from './tipos'

/** O cliente de quem depende a permissão: o próprio, ou o da avaliação, do contrato ou do escopo. */
function clienteDoRegistro(tipo: TipoRegistro, id: string): string | undefined {
  if (tipo === 'cliente') return id
  if (tipo === 'contrato') return CONTRATOS.find((c) => c.id === id)?.clienteId
  if (tipo === 'escopo') return ESCOPOS.find((e) => e.id === id)?.clienteId
  if (tipo === 'plano') return PLANOS.find((p) => p.id === id)?.clienteId
  if (tipo === 'atividade') return ATIVIDADES.find((a) => a.id === id)?.clienteId
  if (tipo === 'demanda') return DEMANDAS.find((d) => d.numero === id)?.clienteId
  return AVALIACOES.find((a) => a.id === id)?.clienteId
}

/** Quem fez a alteração. O que chega pelo formulário do site não tem usuário (parte 5, 5.2). */
const autor = (usuarioId: string) =>
  usuarioId === 'site' ? 'Formulário do site' : (USUARIOS.find((u) => u.id === usuarioId)?.nome ?? '')

/**
 * As entradas do registro. O plano junta as das atividades dele, com o nome da atividade na frente da descrição, como
 * as etapas aparecem no histórico do escopo (parte 4, 5.2): a atividade não tem página própria.
 */
function entradasDoRegistro(tipo: TipoRegistro, id: string): { h: (typeof HISTORICO)[number]; prefixo: string }[] {
  const proprias = HISTORICO.filter((h) => h.tipo === tipo && h.registroId === id).map((h) => ({ h, prefixo: '' }))
  if (tipo !== 'plano') return proprias
  const atividades = ATIVIDADES.filter((a) => a.planoId === id)
  const dasAtividades = HISTORICO.flatMap((h) => {
    const atividade = h.tipo === 'atividade' ? atividades.find((a) => a.id === h.registroId) : undefined
    return atividade ? [{ h, prefixo: `${atividade.nome} · ` }] : []
  })
  return [...proprias, ...dasAtividades]
}

/**
 * O histórico do registro (F17), da alteração mais recente para a mais antiga, com o nome do usuário.
 * Vazio se o usuário não pode ver o registro. Só leitura: no protótipo, o histórico não cresce.
 */
export async function listarHistorico(tipo: TipoRegistro, id: string): Promise<EntradaHistorico[]> {
  const usuario = await obterUsuarioAtual()
  // O especialista não tem cliente: todos os usuários logados o leem, e o histórico dele também (DF-02, F17).
  if (tipo === 'especialista') {
    if (!ESPECIALISTAS.some((e) => e.id === id)) return []
  } else if (tipo === 'documento') {
    // O documento segue o acesso dele: o cliente, ou todos no Documento do Especialista sem cliente (DF-65).
    const documento = DOCUMENTOS.find((d) => d.id === id)
    if (!documento || !podeVerDocumento(documento, usuario, VINCULOS)) return []
  } else {
    const clienteId = clienteDoRegistro(tipo, id)
    if (!clienteId || !podeVerCliente(usuario, clienteId, VINCULOS)) return []
  }
  return entradasDoRegistro(tipo, id)
    .sort((a, b) => Date.parse(b.h.dataHora) - Date.parse(a.h.dataHora))
    .map(({ h, prefixo }) => ({
      id: h.id,
      dataHora: h.dataHora,
      usuario: autor(h.usuarioId),
      descricao: `${prefixo}${h.descricao}`,
      ...(h.valorAnterior === undefined ? {} : { valorAnterior: h.valorAnterior }),
      ...(h.valorNovo === undefined ? {} : { valorNovo: h.valorNovo }),
      ...(h.justificativa === undefined ? {} : { justificativa: h.justificativa }),
    }))
}
