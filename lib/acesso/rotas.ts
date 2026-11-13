// Para onde a pessoa vai depois de entrar (parte 1, 5.2). Só vale um caminho interno: assim, um link
// de fora não usa o login para mandar a pessoa a outro site.

/** Espaço, caractere de controle ou barra invertida: o navegador lê `/\` como `//` e apaga tabulações. */
function temCaractereProibido(texto: string): boolean {
  return [...texto].some((c) => {
    const codigo = c.charCodeAt(0)
    return codigo < 0x20 || codigo === 0x7f || c === '\\' || /\s/.test(c)
  })
}

/**
 * O destino, se for um caminho interno: começa com uma barra só, não tem espaço, caractere de controle
 * nem barra invertida, e não aponta para o próprio login. Qualquer outro valor vira `/inicio`.
 */
export function destinoSeguro(destino: unknown): string {
  if (typeof destino !== 'string') return '/inicio'
  if (!destino.startsWith('/') || destino.startsWith('//') || temCaractereProibido(destino)) return '/inicio'
  const caminho = destino.split(/[?#]/)[0].replace(/\/+$/, '')
  if (caminho === '/login') return '/inicio'
  return destino
}
