import { Num } from '@/components/elo/num'
import { Progress } from '@/components/ui/progress'

/** Progresso das atividades de um plano. Sem atividades, não há barra nem divisão por zero. */
export function ProgressoAtividades({ concluidas, total }: { concluidas: number; total: number }) {
  if (!(total > 0)) {
    return <p className="text-secundario text-muted-foreground">Sem atividades</p>
  }
  const feitas = Math.min(Math.max(concluidas, 0), total)
  const percentual = Math.round((feitas / total) * 100)
  return (
    <div className="space-y-2">
      <p className="text-secundario">
        <Num>{feitas}</Num> de <Num>{total}</Num> concluídas
      </p>
      <Progress
        value={percentual}
        aria-label="Atividades concluídas"
      />
    </div>
  )
}
