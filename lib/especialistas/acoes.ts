'use server'

import { especialistaTemItensLigados, especialistaTemVinculoAberto, obterEspecialista } from '@/lib/dados/especialistas'
import { listarEspecialidades } from '@/lib/dados/listas'
import { ehAdmin } from '@/lib/dados/regras'
import { obterUsuarioAtual } from '@/lib/dados/sessao'
import { mensagemDeSucesso, SEM_PERMISSAO, type ResultadoAcao } from '@/lib/resultado-acao'
import type { EstadoSalvarEspecialista } from './estados'
import { lerDadosEspecialista, validarEspecialista } from './validacao'

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

const texto = (valor: FormDataEntryValue | null) => (typeof valor === 'string' ? valor.trim() : '')

/**
 * Cadastro e edição do especialista (parte 5, 5.5). Com `id`, é edição. A origem não vem do formulário: o cadastro
 * interno é "Cadastro interno" e a edição mantém a que havia. Inativar com vínculo aberto passa, e a mensagem avisa
 * que os vínculos continuam, sinalizados para troca (DF-51).
 */
export async function salvarEspecialista(
  _estado: EstadoSalvarEspecialista,
  formData: FormData,
): Promise<EstadoSalvarEspecialista> {
  const usuario = await obterUsuarioAtual()
  const dados = lerDadosEspecialista(formData)
  const recusa = (erroGeral: string): EstadoSalvarEspecialista => ({ erros: {}, valores: dados, erroGeral })
  if (!ehAdmin(usuario)) return recusa(SEM_PERMISSAO)

  const id = texto(formData.get('id'))
  const atual = id ? await obterEspecialista(id) : null
  if (id && !atual) return recusa(SEM_PERMISSAO)

  const erros = validarEspecialista(dados, { atual, especialidades: await listarEspecialidades() })
  if (Object.keys(erros).length > 0) return { erros, valores: dados }

  const inativouComVinculo =
    atual !== null && atual.status !== 'Inativo' && dados.status === 'Inativo' && (await especialistaTemVinculoAberto(atual.id))
  const frase = inativouComVinculo
    ? 'Especialista salvo. Os vínculos em aberto continuam e aparecem para troca.'
    : 'Especialista salvo.'
  return {
    erros: {},
    valores: dados,
    sucesso: { mensagem: mensagemDeSucesso(frase), destino: atual ? `/especialistas/${atual.id}` : '/especialistas' },
  }
}
