import { Num } from '@/components/elo/num'
import { Progresso } from '@/components/elo/progresso'
import type { ResumoAtividades as Resumo } from '@/lib/dados/tipos'

/** Contagem de problema em vermelho e negrito (padrão visual 4.6, texto de alerta). */
const ALERTA = 'font-semibold text-destructive'

function Atrasadas({ n }: { n: number }) {
  if (n <= 0) return null
  return (
    <>
      <span aria-hidden="true"> · </span>
      <span className={ALERTA}>
        <Num>{n}</Num> {n === 1 ? 'atrasada' : 'atrasadas'}
      </span>
    </>
  )
}

/**
 * O resumo das atividades de um plano (CA-07.2; parte 4, 5.11): o total, as concluídas e as atrasadas. Completo, na
 * página do plano, com a barra do progresso; compacto, numa linha, nas tabelas de planos do escopo e da avaliação.
 */
export function ResumoAtividades({ resumo, compacto = false }: { resumo: Resumo; compacto?: boolean }) {
  const { total, concluidas, atrasadas } = resumo
  if (compacto || total === 0) {
    return (
      <span className="text-secundario">
        <Progresso
          feitas={concluidas}
          total={total}
          rotulo="concluídas"
          vazio="Nenhuma atividade"
          rotuloAcessivel="Atividades concluídas"
          barra={false}
        />
        <Atrasadas n={atrasadas} />
      </span>
    )
  }
  return (
    <div className="space-y-2">
      <p className="text-secundario">
        <Num>{total}</Num> {total === 1 ? 'atividade' : 'atividades'}
        <Atrasadas n={atrasadas} />
      </p>
      <Progresso
        feitas={concluidas}
        total={total}
        rotulo="concluídas"
        vazio="Nenhuma atividade"
        rotuloAcessivel="Atividades concluídas"
      />
    </div>
  )
}
