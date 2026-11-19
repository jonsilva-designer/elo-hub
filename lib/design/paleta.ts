/**
 * As cores da marca em hexadecimal, para onde o CSS não chega: o PDF da Visão Executiva é desenhado fora do navegador e
 * não lê as variáveis de app/globals.css. Cada uma tem o nome da variável --elo-* de onde vem, e um teste confere que
 * os valores são iguais (cobertura do design system, 19/11/2026).
 */
export const PALETA = {
  'azul-marinho': '#182F4F',
  dourado: '#BD903F',
  'dourado-suave': '#E9DBC0',
  tinta: '#1B2533',
  'texto-secundario': '#5D6878',
  divisoria: '#EEE9DF',
  branco: '#FFFFFF',
} as const
