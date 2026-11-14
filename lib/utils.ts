import { createCn } from 'cn/config'

/** Os tokens de tamanho de texto de app/globals.css (padrão visual 4.2), sem o prefixo `--text-`. */
export const TAMANHOS_DE_TEXTO = ['titulo-pagina', 'titulo-painel', 'secundario', 'rotulo', 'grupo', 'indicador'] as const

/**
 * Junta classes e resolve conflitos do Tailwind. Conhece os tokens de tamanho: sem isso, lê
 * `text-titulo-painel` como cor e o apaga ao lado de `text-primary`.
 */
export const cn = createCn({
  extend: { classGroups: { 'font-size': [{ text: [...TAMANHOS_DE_TEXTO] }] } },
})
