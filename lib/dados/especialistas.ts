import { nomeDoCliente } from '@/lib/clientes/filtros'
import { escopoFechado } from '@/lib/escopos/regras'
import { mesmoEmail } from '@/lib/especialistas/regras'
import { demandasDoEspecialista, temDemandaLigada } from './demandas'
import { temDocumentoLigado } from './documentos'
import { CLIENTES } from './mock/clientes'
import { COMENTARIOS, DEMANDAS } from './mock/demandas'
import { ESCOPOS } from './mock/escopos'
import { ESPECIALISTAS } from './mock/especialistas'
import { VINCULOS } from './mock/usuarios'
import { podeVerCliente } from './regras'
import { obterUsuarioAtual } from './sessao'
import type { Especialista, EspecialistaDetalhado, OrigemEspecialista, StatusEspecialista } from './tipos'

// Leitura dos especialistas (F11). Todos os usuários logados leem o cadastro (DF-02, arquitetura 4.5); os escopos e
// as demandas ligados a cada um seguem o vínculo com o cliente (CA-11.4).

/** A candidatura com o e-mail de um cadastro anterior (DF-50). Na mesma data, vale a ordem da lista. */
function emailRepetido(e: Especialista): boolean {
  const indice = ESPECIALISTAS.indexOf(e)
  return ESPECIALISTAS.some(
    (outro, i) =>
      outro !== e &&
      mesmoEmail(outro.email, e.email) &&
      (outro.cadastradoEm < e.cadastradoEm || (outro.cadastradoEm === e.cadastradoEm && i < indice)),
  )
}

const detalhar = (e: Especialista): EspecialistaDetalhado => ({ ...e, emailRepetido: emailRepetido(e) })

/** Todos os especialistas, na ordem do cadastro. A sessão é exigida, mas não recorta: todos leem (DF-02). */
export async function listarEspecialistas(): Promise<EspecialistaDetalhado[]> {
  await obterUsuarioAtual()
  return ESPECIALISTAS.map(detalhar)
}

/** O especialista, ou null se não existe. */
export async function obterEspecialista(id: string): Promise<EspecialistaDetalhado | null> {
  await obterUsuarioAtual()
  const especialista = ESPECIALISTAS.find((e) => e.id === id)
  return especialista ? detalhar(especialista) : null
}

/** Os especialistas que podem receber vínculo novo: só os Ativos (RN-14, CA-11.2). */
export async function listarEspecialistasAtivos(): Promise<EspecialistaDetalhado[]> {
  return (await listarEspecialistas()).filter((e) => e.status === 'Ativo')
}

/**
 * Os escopos e as demandas ligados ao especialista, só dos clientes que o usuário vê (CA-11.4). O vínculo antigo com
 * o especialista inativado continua aparecendo (DF-51).
 */
export async function ligacoesDoEspecialista(
  id: string,
): Promise<{ tipo: 'Escopo' | 'Demanda'; id: string; nome: string; cliente: string; status: string; href: string }[]> {
  const usuario = await obterUsuarioAtual()
  const escopos = ESCOPOS.filter((e) => e.especialistaIds.includes(id) && podeVerCliente(usuario, e.clienteId, VINCULOS)).map(
    (e) => {
      const cliente = CLIENTES.find((c) => c.id === e.clienteId)
      return {
        tipo: 'Escopo' as const,
        id: e.id,
        nome: e.nome,
        cliente: cliente ? nomeDoCliente(cliente) : '',
        status: e.status,
        href: `/escopos/${e.id}`,
      }
    },
  )
  const demandas = (await demandasDoEspecialista(id)).map((d) => ({
    tipo: 'Demanda' as const,
    id: d.numero,
    nome: `${d.numero} · ${d.assunto}`,
    cliente: d.nomeCliente,
    status: d.status,
    href: `/central/${d.numero}`,
  }))
  return [...escopos, ...demandas]
}

/** As outras candidaturas e cadastros com o mesmo e-mail, pela data (DF-50, CA-11.6). */
export async function candidaturasComOMesmoEmail(
  id: string,
): Promise<{ id: string; nome: string; cadastradoEm: string; status: StatusEspecialista; origem: OrigemEspecialista }[]> {
  const especialista = await obterEspecialista(id)
  if (!especialista) return []
  return ESPECIALISTAS.filter((e) => e.id !== id && mesmoEmail(e.email, especialista.email))
    .sort((a, b) => a.cadastradoEm.localeCompare(b.cadastradoEm))
    .map((e) => ({ id: e.id, nome: e.nome, cadastradoEm: e.cadastradoEm, status: e.status, origem: e.origem }))
}

/**
 * O especialista tem vínculos e não pode ser excluído (RN-13, DF-33): algum escopo, demanda ou documento, de qualquer cliente. Conta
 * também o que o usuário não vê, porque a exclusão apagaria o vínculo de outros clientes; não revela quais são.
 */
export async function especialistaTemItensLigados(id: string): Promise<boolean> {
  await obterUsuarioAtual()
  return (
    ESCOPOS.some((e) => e.especialistaIds.includes(id)) ||
    (await temDemandaLigada({ especialistaId: id })) ||
    // O contato registrado na demanda pode ser com quem não está ligado a ela (DF-30).
    COMENTARIOS.some((c) => c.especialistaId === id) ||
    (await temDocumentoLigado({ especialistaId: id }))
  )
}

/**
 * O especialista está ligado a algum escopo aberto ou demanda não resolvida, de qualquer cliente: ao inativá-lo, o vínculo
 * fica para troca (DF-51). A demanda conta como no alerta "Especialista inativo" (CA-15.6).
 */
export async function especialistaTemVinculoAberto(id: string): Promise<boolean> {
  await obterUsuarioAtual()
  return (
    ESCOPOS.some((e) => e.especialistaIds.includes(id) && !escopoFechado(e.status)) ||
    DEMANDAS.some((d) => d.status !== 'Resolvida' && d.status !== 'Encerrada' && d.especialistas.some((x) => x.id === id))
  )
}
