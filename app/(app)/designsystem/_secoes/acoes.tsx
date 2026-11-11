'use client'

import { Download, Pencil, Plus } from 'lucide-react'
import { BotaoBloqueado } from '@/components/elo/botao-bloqueado'
import { BotaoIcone } from '@/components/elo/botao-icone'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Exemplo, Subsecao } from './secao'

export function Acoes() {
  return (
    <Subsecao titulo="Ações">
      <Exemplo rotulo="Variantes">
        <Button>Principal</Button>
        <Button variant="outline">Secundário</Button>
        <Button variant="ghost">Discreto</Button>
        <Button variant="destructive">Excluir</Button>
      </Exemplo>
      <Exemplo rotulo="Com ícone">
        <Button>
          <Plus aria-hidden="true" size={16} strokeWidth={1.6} />
          Novo cliente
        </Button>
      </Exemplo>
      <Exemplo rotulo="Carregando">
        <Button carregando>Salvando</Button>
      </Exemplo>
      <Exemplo rotulo="Desabilitado">
        <Button disabled>Salvar</Button>
      </Exemplo>
      <Exemplo rotulo="Bloqueado com motivo">
        <BotaoBloqueado variant="outline" motivo="Há atividades abertas">
          Encerrar plano
        </BotaoBloqueado>
      </Exemplo>
      <Exemplo rotulo="Só ícone">
        <BotaoIcone rotulo="Exportar" icone={Download} />
        <BotaoIcone rotulo="Editar" icone={Pencil} />
      </Exemplo>
      <Exemplo rotulo="Menu de ações">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Ações</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>Editar</DropdownMenuItem>
            <DropdownMenuItem>Duplicar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Exemplo>
    </Subsecao>
  )
}
