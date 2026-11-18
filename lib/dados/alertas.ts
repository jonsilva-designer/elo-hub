import { ordenarAlertas, type Alerta } from '@/lib/alertas/regras'
import { escopoFechado } from '@/lib/escopos/regras'
import { listarAtividades } from './atividades'
import { listarContratos } from './contratos'
import { listarDemandas } from './demandas'
import { listarEscopos } from './escopos'
import { hojeDaRequisicao } from './hoje'
import { obterInicioDaOperacao } from './parametros'
import { ehAdmin } from './regras'
import { obterUsuarioAtual } from './sessao'
import type { DemandaDetalhada } from './tipos'

// Leitura dos alertas (F15; arquitetura 3.3, visão `alerta`). Partem das leituras das listas, que já aplicam a regra de
// vínculo (RN-01, CA-15.3) e calculam a vigência, o atraso e a proximidade do prazo com a data de hoje em Brasília
// (RN-04, RN-09, RN-10, RN-20): o prazo de hoje não está atrasado nem vencido (CA-15.4).

/** A demanda aberta e ainda não resolvida: nem Resolvida nem Encerrada. */
const naoResolvida = (d: DemandaDetalhada) => d.status !== 'Resolvida' && d.status !== 'Encerrada'

/** Quem responde pela demanda: o atendente ou, sem ele, a triagem (DF-51). */
const responsavelDaDemanda = (d: DemandaDetalhada) => d.responsavelAtendimentoId ?? d.responsavelTriagemId

/**
 * Os alertas ativos do usuário, dos mais críticos para os menos (DF-15). Até o início oficial da operação, nenhum
 * (DF-46, CA-15.7): `ativos` diz se ele já foi registrado e chegou. O do especialista inativo vai para o responsável do
 * escopo ou da demanda e para o Administrador (DF-51, CA-15.6).
 */
export async function listarAlertas(): Promise<{ ativos: boolean; alertas: Alerta[] }> {
  const [usuario, hoje, inicio] = await Promise.all([obterUsuarioAtual(), hojeDaRequisicao(), obterInicioDaOperacao()])
  if (!inicio || inicio > hoje) return { ativos: false, alertas: [] }

  const [contratos, escopos, atividades, demandas] = await Promise.all([
    listarContratos(),
    listarEscopos(),
    listarAtividades(),
    listarDemandas(),
  ])
  const alertas: Alerta[] = []
  const incluir = (a: Omit<Alerta, 'chave'>, id: string) => alertas.push({ ...a, chave: `${a.tipo}:${id}` })

  for (const c of contratos) {
    const registro = `${c.codigo} · ${c.contratante}`
    const base = { registro, cliente: c.nomeCliente, criticidade: null, data: c.termino, href: `/contratos/${c.id}` }
    if (c.vigencia?.status === 'Próximo do vencimento') incluir({ ...base, tipo: 'Contrato próximo do vencimento', tom: 'atencao' }, c.id)
    if (c.vigencia?.status === 'Vencido') incluir({ ...base, tipo: 'Contrato vencido', tom: 'problema' }, c.id)
  }

  for (const a of atividades) {
    if (!a.situacao) continue
    const escopo = escopos.find((e) => e.id === a.escopoId)
    incluir(
      {
        tipo: a.situacao === 'Atrasada' ? 'Atividade atrasada' : 'Atividade próxima do prazo',
        registro: a.nome,
        cliente: a.nomeCliente,
        criticidade: escopo?.criticidade ?? null,
        data: a.prazo,
        href: `/atividades/${a.id}/editar`,
        tom: a.situacao === 'Atrasada' ? 'problema' : 'atencao',
      },
      a.id,
    )
  }

  for (const e of escopos) {
    if (escopoFechado(e.status)) continue
    const base = { cliente: e.nomeCliente, criticidade: e.criticidade, data: null, href: `/escopos/${e.id}` }
    if (e.criticidade === 'Crítica') incluir({ ...base, tipo: 'Escopo crítico', registro: e.nome, tom: 'atencao' }, e.id)
    if (ehAdmin(usuario) || e.responsavelId === usuario.id) {
      for (const especialista of e.especialistas.filter((x) => x.status === 'Inativo')) {
        incluir(
          { ...base, tipo: 'Especialista inativo', registro: `${especialista.nome} em ${e.nome}`, tom: 'problema' },
          `${e.id}:${especialista.id}`,
        )
      }
    }
  }

  for (const d of demandas) {
    if (!naoResolvida(d)) continue
    const registro = `${d.numero} · ${d.assunto}`
    const base = { cliente: d.nomeCliente, criticidade: d.criticidade, href: `/central/${d.numero}` }
    if (d.criticidade === 'Crítica') incluir({ ...base, tipo: 'Demanda crítica', registro, data: d.prazo, tom: 'atencao' }, d.numero)
    if (d.vencida) incluir({ ...base, tipo: 'Demanda vencida', registro, data: d.prazo, tom: 'problema' }, d.numero)
    if (ehAdmin(usuario) || responsavelDaDemanda(d) === usuario.id) {
      for (const especialista of d.especialistasLigados.filter((x) => x.status === 'Inativo')) {
        incluir(
          { ...base, tipo: 'Especialista inativo', registro: `${especialista.nome} em ${registro}`, data: null, tom: 'problema' },
          `${d.numero}:${especialista.id}`,
        )
      }
    }
  }

  return { ativos: true, alertas: ordenarAlertas(alertas) }
}
