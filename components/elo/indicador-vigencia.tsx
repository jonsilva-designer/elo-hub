import { EtiquetaStatus } from '@/components/elo/etiquetas'
import { Num } from '@/components/elo/num'
import { textoDosDias } from '@/lib/contratos/vigencia'
import type { TipoVigencia, Vigencia } from '@/lib/dados/tipos'
import { formatarData, VAZIO } from '@/lib/formato'

/** O texto dos dias com o número em <Num> (JetBrains Mono em todos os números, padrão visual). "Vence hoje" não tem. */
function comNumero(texto: string) {
  const partes = /^(\D*)(\d+)(.*)$/.exec(texto)
  if (!partes) return texto
  return (
    <>
      {partes[1]}
      <Num>{partes[2]}</Num>
      {partes[3]}
    </>
  )
}

/**
 * Vigência do contrato (F04): a etiqueta do status da vigência e, quando há término, a data e os dias restantes.
 * Sem vigência (Proposta, Em contratação), o traço. Prazo indeterminado não tem término nem dias (DF-68).
 */
export function IndicadorVigencia({
  vigencia,
  termino,
  tipoVigencia,
}: {
  vigencia: Vigencia | null
  termino: string | null
  tipoVigencia: TipoVigencia
}) {
  if (!vigencia) return <span className="text-muted-foreground">{VAZIO}</span>
  const comPrazo = vigencia.status !== 'Encerrado' && tipoVigencia !== 'Prazo indeterminado' && termino
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <EtiquetaStatus status={vigencia.status} />
      {comPrazo ? (
        <span className="text-xs text-muted-foreground">
          <Num>{formatarData(termino)}</Num>
          {vigencia.diasRestantes !== null ? (
            <>
              <span aria-hidden="true"> · </span>
              <span>{comNumero(textoDosDias(vigencia.diasRestantes))}</span>
            </>
          ) : null}
        </span>
      ) : null}
      {vigencia.status !== 'Encerrado' && tipoVigencia === 'Prazo indeterminado' ? (
        <span className="text-xs text-muted-foreground">Prazo indeterminado</span>
      ) : null}
    </span>
  )
}
