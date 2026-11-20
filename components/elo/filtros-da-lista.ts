'use client'

import { useState } from 'react'

/**
 * Os filtros de uma lista, começando pelos do endereço, que a página lê no servidor (CA-16.2). O Next mantém a lista
 * montada quando só a busca do endereço muda (o link do menu para a mesma lista, por exemplo). Cada navegação traz uma
 * página nova do servidor, com um objeto novo de filtros: quando ele chega, a lista volta aos filtros do endereço, mesmo
 * que tenham o mesmo valor dos da primeira vez (revisão do código, 20/11/2026). A escolha da pessoa não traz página
 * nova (a lista só troca o endereço), e por isso não é desfeita.
 */
export function useFiltrosDaLista<F>(iniciais: F): [F, (filtros: F) => void] {
  const [filtros, setFiltros] = useState(iniciais)
  const [daPagina, setDaPagina] = useState(iniciais)
  if (iniciais !== daPagina) {
    setDaPagina(iniciais)
    setFiltros(iniciais)
  }
  return [filtros, setFiltros]
}
