'use server'

import { obterCliente } from '@/lib/dados/clientes'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { mensagemDeSucesso, SEM_PERMISSAO, type ResultadoAcao } from '@/lib/resultado-acao'
import { TEXTOS } from './regras'

/**
 * Salva um dos três textos da Visão Executiva do cliente (CA-14.7, DF-73, DF-82): o Administrador e a Equipe vinculada.
 * O texto pode ficar vazio. A versão anterior iria para o histórico, com o autor e a data (DF-16), e não aparece na
 * tela nem no PDF. No protótipo, nada é gravado.
 */
export async function salvarTextoExecutivo(clienteId: string, campo: string, texto: string): Promise<ResultadoAcao> {
  await obterUsuarioAtual()
  const cliente = typeof clienteId === 'string' ? await obterCliente(clienteId) : null
  const valido = TEXTOS.some((t) => t.campo === campo) && typeof texto === 'string'
  if (!cliente || cliente.ehCadastroElo || !valido) return { ok: false, mensagem: SEM_PERMISSAO }
  return { ok: true, mensagem: mensagemDeSucesso('Texto salvo.') }
}
