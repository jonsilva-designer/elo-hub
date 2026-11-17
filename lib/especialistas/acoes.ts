'use server'

import { especialistaTemItensLigados, obterEspecialista } from '@/lib/dados/especialistas'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { mensagemDeSucesso, SEM_PERMISSAO, type ResultadoAcao } from '@/lib/resultado-acao'

// Ações do especialista (parte 5, 5.5 e 5.6). Só o Administrador cadastra, edita e exclui (matriz 4.3). Conferem tudo
// no servidor, mesmo quando a tela esconde o botão. No protótipo, salvar só simula: nada é gravado.

const temTexto = (valor: unknown): valor is string => typeof valor === 'string' && valor.trim() !== ''

/**
 * Excluir o especialista (DF-33, RN-13): só o Administrador, só sem vínculo em escopo ou demanda, e com justificativa.
 * Quem não pode, ou um id que não existe, recebe a mesma recusa.
 */
export async function excluirEspecialista(id: string, justificativa: string): Promise<ResultadoAcao> {
  const usuario = await obterUsuarioAtual()
  const especialista = ehAdmin(usuario) && typeof id === 'string' ? await obterEspecialista(id) : null
  if (!especialista) return { ok: false, mensagem: SEM_PERMISSAO }
  if (await especialistaTemItensLigados(especialista.id)) {
    return { ok: false, mensagem: 'Este especialista tem vínculos e não pode ser excluído.' }
  }
  if (!temTexto(justificativa)) return { ok: false, mensagem: 'Escreva a justificativa da exclusão.' }
  return { ok: true, mensagem: mensagemDeSucesso('Especialista excluído.') }
}
