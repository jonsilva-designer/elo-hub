'use client'

import { useEffect } from 'react'

const SO_MODIFICADOR = new Set(['Control', 'Shift', 'Alt', 'Meta', 'AltGraph', 'CapsLock'])

/**
 * Marca no <html> o último jeito de interagir: `data-modalidade="ponteiro"` depois de um clique ou toque, e
 * `"teclado"` depois de uma tecla. O globals.css usa a marca para mostrar o contorno de foco só na navegação por
 * teclado (padrão 4.8), mesmo quando o Chrome o mostraria no clique. Não desenha nada.
 */
export function ModalidadeDeFoco() {
  useEffect(() => {
    const raiz = document.documentElement
    const ponteiro = () => {
      raiz.dataset.modalidade = 'ponteiro'
    }
    const teclado = (evento: KeyboardEvent) => {
      if (!SO_MODIFICADOR.has(evento.key)) raiz.dataset.modalidade = 'teclado'
    }
    document.addEventListener('pointerdown', ponteiro, true)
    document.addEventListener('keydown', teclado, true)
    return () => {
      document.removeEventListener('pointerdown', ponteiro, true)
      document.removeEventListener('keydown', teclado, true)
    }
  }, [])
  return null
}
