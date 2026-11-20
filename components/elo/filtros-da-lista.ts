'use client'

import { useState } from 'react'

/**
 * Os filtros de uma lista, começando pelos do endereço, que a página lê no servidor (CA-16.2). O Next mantém a lista
 * montada quando só a busca do endereço muda (o link do menu para a mesma lista, por exemplo): quando os filtros do
 * endereço mudam de valor, a lista volta a eles (revisão do código, 20/11/2026). A comparação é pelo texto dos filtros,
 * e não pelo objeto: uma nova renderização do servidor com os mesmos filtros não desfaz o que a pessoa escolheu.
 */
export function useFiltrosDaLista<F>(iniciais: F, escrever: (filtros: F) => string): [F, (filtros: F) => void] {
  const [filtros, setFiltros] = useState(iniciais)
  const [doEndereco, setDoEndereco] = useState(() => escrever(iniciais))
  const agora = escrever(iniciais)
  if (agora !== doEndereco) {
    setDoEndereco(agora)
    setFiltros(iniciais)
  }
  return [filtros, setFiltros]
}
