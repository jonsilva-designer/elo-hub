'use client'

import { EstadoVazio, ErroCarregamento, AcessoNegado } from '@/components/elo/estados'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Exemplo, Quadro } from './secao'

/** Estados de interface. Fica em arquivo de cliente porque o erro recebe uma função. */
export function ExibicaoEstados() {
  return (
    <>
      <Exemplo rotulo="Estado vazio">
        <div className="w-full">
          <EstadoVazio
            titulo="Nenhum contrato cadastrado"
            descricao="Cadastre o primeiro contrato para acompanhá-lo aqui."
            acao={<Button>Cadastrar contrato</Button>}
          />
        </div>
      </Exemplo>
      <Exemplo rotulo="Erro de carregamento">
        <div className="w-full">
          {/* Sem efeito visível: a página não busca dados. */}
          <ErroCarregamento onTentarDeNovo={() => {}} />
        </div>
      </Exemplo>
      <Exemplo rotulo="Carregando">
        <Quadro className="w-full space-y-3" role="status" aria-busy="true">
          <span className="sr-only">Carregando</span>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </Quadro>
      </Exemplo>
      <Exemplo rotulo="Sem permissão">
        <div className="w-full">
          <AcessoNegado />
        </div>
      </Exemplo>
    </>
  )
}
