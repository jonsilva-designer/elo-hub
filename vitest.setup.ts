import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// O import estático da imagem gera o blurDataURL na build do Next, e não no Vitest. Sem ele,
// o next/image com placeholder="blur" acusa erro. Vale para todo teste que mostre uma tela de acesso.
vi.mock('@/components/elo/imagens/elos-login.webp', () => ({
  default: { src: '/elos-login.webp', width: 1800, height: 2000, blurDataURL: 'data:image/webp;base64,AA' },
}))

// Sem globals do Vitest, a limpeza automática do Testing Library não roda.
afterEach(() => cleanup())

// Lacunas do jsdom exigidas pelo Radix (dicas, janelas e menus).
class ResizeObserverFalso {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverFalso as unknown as typeof ResizeObserver
// Os testes de ambiente node (lint, proxy) não têm DOM.
if (typeof Element !== 'undefined') {
  Element.prototype.hasPointerCapture ??= () => false
  Element.prototype.setPointerCapture ??= () => {}
  Element.prototype.releasePointerCapture ??= () => {}
  Element.prototype.scrollIntoView ??= () => {}
}
