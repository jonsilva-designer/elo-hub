function canal(valor: number): number {
  const c = valor / 255
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function luminancia(hex: string): number {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) throw new Error(`Cor inválida (esperado #RRGGBB): ${hex}`)
  const n = parseInt(m[1], 16)
  const r = canal((n >> 16) & 255)
  const g = canal((n >> 8) & 255)
  const b = canal(n & 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Razão de contraste da WCAG 2.1 entre duas cores `#RRGGBB`. */
export function razaoDeContraste(frente: string, fundo: string): number {
  const a = luminancia(frente)
  const b = luminancia(fundo)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}
