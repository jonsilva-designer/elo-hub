import { Num } from '@/components/elo/num'
import { Progress } from '@/components/ui/progress'

/**
 * Progresso genérico (parte 3, 5.13): "<n> de <total> <rótulo>", das atividades de um plano ou das etapas da Jornada.
 * Com barra, o texto fica em cima dela; sem barra, só o texto, em linha. Total zero mostra o vazio, sem divisão por
 * zero.
 */
export function Progresso({
  feitas,
  total,
  rotulo,
  vazio,
  rotuloAcessivel,
  barra = true,
}: {
  feitas: number
  total: number
  rotulo: string
  vazio: string
  rotuloAcessivel: string
  barra?: boolean
}) {
  if (!(total > 0)) {
    return barra ? (
      <p className="text-secundario text-muted-foreground">{vazio}</p>
    ) : (
      <span className="text-secundario text-muted-foreground">{vazio}</span>
    )
  }
  const contadas = Math.min(Math.max(feitas, 0), total)
  const texto = (
    <>
      <Num>{contadas}</Num> de <Num>{total}</Num> {rotulo}
    </>
  )
  if (!barra) return <span className="text-secundario">{texto}</span>
  return (
    <div className="space-y-2">
      <p className="text-secundario">{texto}</p>
      <Progress value={Math.round((contadas / total) * 100)} aria-label={rotuloAcessivel} />
    </div>
  )
}
