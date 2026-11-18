import { Fragment } from 'react'
import { Num } from '@/components/elo/num'

/** Os códigos de contrato e de demanda (CT-2025-031, ELO-2026-0003) e as datas (15/09/2026) dentro de um texto. */
const NUMERO = /([A-Z]{2,3}-\d{4}-\d{3,4}|\d{2}\/\d{2}\/\d{4})/

/**
 * O texto pronto de um vínculo ("ELO-2026-0003 · Certidões…", "Avaliação de 15/09/2026") com os códigos e as datas em
 * <Num>: JetBrains Mono em todos os números (padrão visual).
 */
export function TextoComNumeros({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(NUMERO).map((parte, i) =>
        i % 2 === 1 ? <Num key={i}>{parte}</Num> : <Fragment key={i}>{parte}</Fragment>,
      )}
    </>
  )
}
