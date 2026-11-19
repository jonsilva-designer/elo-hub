'use client'

import { MoreHorizontal, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { BotaoIcone } from '@/components/elo/botao-icone'
import { Campo } from '@/components/elo/campo'
import { ConfirmarAcao } from '@/components/elo/confirmacao'
import { EstadoVazio } from '@/components/elo/estados'
import { EtiquetaStatus } from '@/components/elo/etiquetas'
import { Num } from '@/components/elo/num'
import { Painel } from '@/components/elo/painel'
import { TabelaDados, type Coluna } from '@/components/elo/tabela-dados'
import { TextoComDetalhe } from '@/components/elo/textos'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { avisarSalvo } from '@/lib/avisos'
import type { ItemDaLista } from '@/lib/dados/listas-configuracao'
import { excluirItem, inativarItem, incluirItem, reativarItem, renomearItem } from '@/lib/listas/acoes'
import { LISTAS, type ChaveLista } from '@/lib/listas/regras'
import type { ResultadoAcao } from '@/lib/resultado-acao'

type Situacao = 'ativos' | 'inativos' | 'todos'
type Janela = { tipo: 'incluir' } | { tipo: 'renomear' | 'inativar' | 'reativar' | 'excluir'; item: ItemDaLista } | null

/**
 * As listas oficiais (parte 8, 4.2; DF-01, DF-38): a lista escolhida, com o uso e o status de cada item. Incluir e
 * renomear pedem o nome; inativar, reativar e excluir pedem confirmação. Os inativos só aparecem com o filtro (CA-18.5);
 * o item usado e os fixos das regras não têm Excluir.
 */
export function TelaListas({ lista, itens }: { lista: ChaveLista; itens: ItemDaLista[] }) {
  const router = useRouter()
  const [situacao, setSituacao] = useState<Situacao>('ativos')
  const [janela, setJanela] = useState<Janela>(null)
  const [nome, setNome] = useState('')
  const [recusa, setRecusa] = useState<string | null>(null)
  const [pendente, iniciar] = useTransition()

  const linhas = itens.filter((i) => situacao === 'todos' || (situacao === 'ativos' ? i.ativo : !i.ativo))
  const rotulo = LISTAS.find((l) => l.chave === lista)?.rotulo ?? ''

  function abrir(nova: Exclude<Janela, null>) {
    setRecusa(null)
    setNome(nova.tipo === 'renomear' ? nova.item.nome : '')
    setJanela(nova)
  }

  function executar(acao: () => Promise<ResultadoAcao>) {
    setRecusa(null)
    iniciar(async () => {
      const resultado = await acao()
      if (resultado.ok) {
        avisarSalvo(resultado.mensagem)
        setJanela(null)
      } else {
        setRecusa(resultado.mensagem)
      }
    })
  }

  const colunas: Coluna<ItemDaLista>[] = [
    { id: 'nome', titulo: 'Nome', largura: 'w-1/2', ordenarPor: (i) => i.nome, celula: (i) => <TextoComDetalhe texto={i.nome} destaque={false} /> },
    {
      id: 'uso',
      titulo: 'Uso',
      ordenarPor: (i) => i.uso,
      celula: (i) => (
        <>
          <Num>{i.uso}</Num> {i.uso === 1 ? 'registro' : 'registros'}
        </>
      ),
    },
    { id: 'status', titulo: 'Status', ordenarPor: (i) => String(i.ativo), celula: (i) => <EtiquetaStatus status={i.ativo ? 'Ativo' : 'Inativo'} /> },
    {
      id: 'acoes',
      titulo: 'Ações',
      celula: (i) =>
        i.fixo ? (
          <span className="text-xs text-muted-foreground">Usado nas regras</span>
        ) : (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <BotaoIcone rotulo={`Ações de ${i.nome}`} icone={MoreHorizontal} variant="ghost" size="icon-sm" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => abrir({ tipo: 'renomear', item: i })}>Renomear</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => abrir({ tipo: i.ativo ? 'inativar' : 'reativar', item: i })}>
                {i.ativo ? 'Inativar' : 'Reativar'}
              </DropdownMenuItem>
              {i.uso === 0 ? (
                <DropdownMenuItem variant="destructive" onSelect={() => abrir({ tipo: 'excluir', item: i })}>
                  Excluir
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
    },
  ]

  const campoNome = (
    <div className="space-y-3">
      <Campo rotulo="Nome" obrigatorio>
        {(p) => <Input {...p} value={nome} onChange={(e) => setNome(e.target.value)} />}
      </Campo>
      {recusa ? (
        <Alert variant="destructive">
          <AlertDescription>{recusa}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
  const soRecusa = recusa ? (
    <Alert variant="destructive">
      <AlertDescription>{recusa}</AlertDescription>
    </Alert>
  ) : undefined
  const fechar = (aberto: boolean) => {
    if (!aberto && !pendente) setJanela(null)
  }
  const item = janela && janela.tipo !== 'incluir' ? janela.item : null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={lista} onValueChange={(v) => router.push(`/configuracoes/listas?lista=${v}`)}>
          <SelectTrigger aria-label="Lista" className="w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LISTAS.map((l) => (
              <SelectItem key={l.chave} value={l.chave}>
                {l.rotulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={situacao} onValueChange={(v) => setSituacao(v as Situacao)}>
          <SelectTrigger aria-label="Status" className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ativos">Ativos</SelectItem>
            <SelectItem value="inativos">Inativos</SelectItem>
            <SelectItem value="todos">Todos</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Painel
        titulo={rotulo}
        acao={
          <Button type="button" onClick={() => abrir({ tipo: 'incluir' })}>
            <Plus aria-hidden="true" />
            Incluir item
          </Button>
        }
        semRespiro
      >
        <TabelaDados colunas={colunas} linhas={linhas} chave={(i) => i.nome} vazio={<EstadoVazio titulo="Nenhum item com esse filtro." />} />
      </Painel>

      <ConfirmarAcao
        titulo={`Incluir item em ${rotulo}`}
        rotuloConfirmar="Incluir"
        onConfirmar={() => executar(() => incluirItem(lista, nome))}
        conteudo={campoNome}
        aberto={janela?.tipo === 'incluir'}
        aoMudarAberto={fechar}
        carregando={pendente}
      />
      <ConfirmarAcao
        titulo="Renomear item"
        descricao="O novo nome vale para todos os registros que usam o item."
        rotuloConfirmar="Renomear"
        onConfirmar={() => item && executar(() => renomearItem(lista, item.nome, nome))}
        conteudo={campoNome}
        aberto={janela?.tipo === 'renomear'}
        aoMudarAberto={fechar}
        carregando={pendente}
      />
      <ConfirmarAcao
        titulo="Inativar item?"
        descricao="O item sai das novas escolhas e continua nos registros que o usam."
        rotuloConfirmar="Inativar"
        onConfirmar={() => item && executar(() => inativarItem(lista, item.nome))}
        conteudo={soRecusa}
        aberto={janela?.tipo === 'inativar'}
        aoMudarAberto={fechar}
        carregando={pendente}
      />
      <ConfirmarAcao
        titulo="Reativar item?"
        descricao="O item volta às escolhas dos formulários."
        rotuloConfirmar="Reativar"
        onConfirmar={() => item && executar(() => reativarItem(lista, item.nome))}
        conteudo={soRecusa}
        aberto={janela?.tipo === 'reativar'}
        aoMudarAberto={fechar}
        carregando={pendente}
      />
      <ConfirmarAcao
        titulo="Excluir item?"
        descricao="A exclusão é definitiva. Só o item nunca usado sai da lista."
        rotuloConfirmar="Excluir"
        perigo
        onConfirmar={() => item && executar(() => excluirItem(lista, item.nome))}
        conteudo={soRecusa}
        aberto={janela?.tipo === 'excluir'}
        aoMudarAberto={fechar}
        carregando={pendente}
      />
    </div>
  )
}
