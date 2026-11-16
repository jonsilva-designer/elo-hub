import { AVALIACOES } from './mock/avaliacoes'
import { CONTRATOS } from './mock/contratos'
import { ESCOPOS } from './mock/escopos'
import { HISTORICO } from './mock/historico'
import { USUARIOS, VINCULOS } from './mock/usuarios'
import { podeVerCliente } from './regras'
import { obterUsuarioAtual } from './sessao'
import type { EntradaHistorico, TipoRegistro } from './tipos'

/** O cliente de quem depende a permissão: o próprio, ou o da avaliação, do contrato ou do escopo. */
function clienteDoRegistro(tipo: TipoRegistro, id: string): string | undefined {
  if (tipo === 'cliente') return id
  if (tipo === 'contrato') return CONTRATOS.find((c) => c.id === id)?.clienteId
  if (tipo === 'escopo') return ESCOPOS.find((e) => e.id === id)?.clienteId
  return AVALIACOES.find((a) => a.id === id)?.clienteId
}

/**
 * O histórico do registro (F17), da alteração mais recente para a mais antiga, com o nome do usuário.
 * Vazio se o usuário não pode ver o registro. Só leitura: no protótipo, o histórico não cresce.
 */
export async function listarHistorico(tipo: TipoRegistro, id: string): Promise<EntradaHistorico[]> {
  const usuario = await obterUsuarioAtual()
  const clienteId = clienteDoRegistro(tipo, id)
  if (!clienteId || !podeVerCliente(usuario, clienteId, VINCULOS)) return []
  return HISTORICO.filter((h) => h.tipo === tipo && h.registroId === id)
    .sort((a, b) => Date.parse(b.dataHora) - Date.parse(a.dataHora))
    .map((h) => ({
      id: h.id,
      dataHora: h.dataHora,
      usuario: USUARIOS.find((u) => u.id === h.usuarioId)?.nome ?? '',
      descricao: h.descricao,
      ...(h.valorAnterior === undefined ? {} : { valorAnterior: h.valorAnterior }),
      ...(h.valorNovo === undefined ? {} : { valorNovo: h.valorNovo }),
      ...(h.justificativa === undefined ? {} : { justificativa: h.justificativa }),
    }))
}
