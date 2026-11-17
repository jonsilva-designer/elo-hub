'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { EtiquetaStatus, IndicadorPrioridade } from '@/components/elo/etiquetas'
import { Num } from '@/components/elo/num'
import { TabelaDados, type Coluna } from '@/components/elo/tabela-dados'
import { atividadeFechada, compararAtividades } from '@/lib/atividades/regras'
import type { AtividadeDetalhada, Perfil } from '@/lib/dados/tipos'
import { formatarData } from '@/lib/formato'
import { PRIORIDADES } from '@/lib/escopos/regras'

/** Quem pode abrir a atividade (parte 4, 5.1): o Administrador sempre; a Equipe, só a aberta (RN-17). */
export const podeAbrirAtividade = (atividade: AtividadeDetalhada, perfil: Perfil) =>
  perfil === 'Administrador' || !atividadeFechada(atividade.status)

/** A ordem inicial (CA-08.4): as abertas pelo prazo, as fechadas no fim; depois pelo nome. */
export const ordenarAtividades = (atividades: readonly AtividadeDetalhada[]) =>
  [...atividades].sort((a, b) => compararAtividades(a, b) || a.nome.localeCompare(b.nome, 'pt-BR'))

function colunas(comCliente: boolean, comPlano: boolean): Coluna<AtividadeDetalhada>[] {
  return [
    {
      id: 'atividade',
      titulo: 'Atividade',
      largura: 'w-1/3',
      ordenarPor: (a) => a.nome,
      celula: (a) => (
        <span className="flex min-w-0 flex-col items-start gap-0.5">
          <span data-slot="nome-atividade" className="font-medium text-foreground">
            {a.nome}
          </span>
          {comPlano ? <span className="text-xs text-muted-foreground">{a.nomePlano}</span> : null}
          {a.executor ? <span className="text-xs text-muted-foreground">Executor: {a.executor}</span> : null}
        </span>
      ),
    },
    ...(comCliente
      ? [{ id: 'cliente', titulo: 'Cliente', ordenarPor: (a: AtividadeDetalhada) => a.nomeCliente, celula: (a: AtividadeDetalhada) => a.nomeCliente }]
      : []),
    { id: 'responsavel', titulo: 'Responsável', ordenarPor: (a) => a.nomeResponsavel, celula: (a) => a.nomeResponsavel },
    {
      id: 'prazo',
      titulo: 'Prazo',
      ordenarPor: (a) => a.prazo,
      celula: (a) => (
        <span className="flex flex-col gap-0.5">
          <Num>{formatarData(a.prazo)}</Num>
          {a.status === 'Concluída' && a.conclusao ? (
            <span className="text-xs text-muted-foreground">
              Concluída em <Num>{formatarData(a.conclusao)}</Num>
            </span>
          ) : null}
        </span>
      ),
    },
    {
      id: 'prioridade',
      titulo: 'Prioridade',
      ordenarPor: (a) => PRIORIDADES.indexOf(a.prioridade),
      celula: (a) => <IndicadorPrioridade prioridade={a.prioridade} />,
    },
    {
      id: 'status',
      titulo: 'Status',
      largura: 'w-1/5',
      ordenarPor: (a) => a.status,
      celula: (a) => (
        <span className="flex flex-wrap items-center gap-1.5">
          <EtiquetaStatus status={a.status} />
          {a.situacao ? <EtiquetaStatus status={a.situacao} /> : null}
        </span>
      ),
    },
  ]
}

/**
 * As atividades de um plano ou de Minhas atividades (parte 4, 5.5 e 5.8). A atrasada e a próxima do prazo ganham a
 * etiqueta e a barra na linha (CA-08.3, padrão 4.6). A linha abre a edição da atividade para quem pode mudá-la.
 */
export function TabelaAtividades({
  atividades,
  perfil,
  origem,
  vazio,
}: {
  atividades: AtividadeDetalhada[]
  perfil: Perfil
  /** Em Minhas atividades, a tabela mostra o cliente e o plano, e a edição volta para lá. */
  origem?: 'minhas-atividades'
  vazio: ReactNode
}) {
  const router = useRouter()
  const deMinhas = origem === 'minhas-atividades'
  return (
    <TabelaDados
      colunas={colunas(deMinhas, deMinhas)}
      linhas={ordenarAtividades(atividades)}
      chave={(a) => a.id}
      aoClicarLinha={(a) =>
        router.push(`/atividades/${a.id}/editar${deMinhas ? '?origem=minhas-atividades' : ''}`)
      }
      linhaClicavel={(a) => podeAbrirAtividade(a, perfil)}
      destaque={(a) => (a.situacao === 'Atrasada' ? 'problema' : a.situacao === 'Próxima do prazo' ? 'atencao' : null)}
      vazio={vazio}
    />
  )
}
