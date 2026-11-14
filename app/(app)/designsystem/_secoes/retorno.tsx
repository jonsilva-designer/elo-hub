'use client'

import { Info } from 'lucide-react'
import { AvisoConfirmacao, ConfirmarAcao, ListaImpedimentos } from '@/components/elo/confirmacao'
import { Campo } from '@/components/elo/campo'
import { Textarea } from '@/components/ui/textarea'
import { BotaoIcone } from '@/components/elo/botao-icone'
import { Button } from '@/components/ui/button'
import { avisarSalvo } from '@/lib/avisos'
import { IMPEDIMENTO_EXEMPLO, MENSAGEM_AVISO } from '../exemplos'
import { Exemplo, Subsecao } from './secao'

export function Retorno() {
  return (
    <Subsecao titulo="Retorno">
      <Exemplo rotulo="Janela de confirmação">
        <ConfirmarAcao
          titulo="Concluir atividade?"
          descricao="A atividade sai da lista de abertas."
          rotuloConfirmar="Concluir"
          onConfirmar={() => avisarSalvo()}
        >
          <Button variant="outline">Concluir atividade</Button>
        </ConfirmarAcao>
        <ConfirmarAcao
          titulo="Excluir documento?"
          descricao="Esta ação não pode ser desfeita."
          rotuloConfirmar="Excluir"
          perigo
          onConfirmar={() => avisarSalvo('Documento excluído')}
        >
          <Button variant="destructive">Excluir documento</Button>
        </ConfirmarAcao>
      </Exemplo>
      <Exemplo rotulo="Janela de confirmação com justificativa">
        <ConfirmarAcao
          titulo="Excluir cliente?"
          descricao="A exclusão é definitiva. Escreva o motivo."
          rotuloConfirmar="Excluir"
          perigo
          onConfirmar={() => avisarSalvo('Cliente excluído')}
          conteudo={
            <Campo rotulo="Justificativa" obrigatorio>
              {(p) => <Textarea {...p} />}
            </Campo>
          }
        >
          <Button variant="outline">Excluir cliente</Button>
        </ConfirmarAcao>
      </Exemplo>
      <Exemplo rotulo="Janela de confirmação bloqueada">
        <ConfirmarAcao
          titulo="Não é possível inativar"
          descricao="Não é possível inativar este cliente enquanto houver itens abertos ligados a ele."
          rotuloConfirmar="Inativar"
          bloqueado
          onConfirmar={() => {}}
          conteudo={<ListaImpedimentos itens={[IMPEDIMENTO_EXEMPLO]} />}
        >
          <Button variant="outline">Inativar cliente</Button>
        </ConfirmarAcao>
      </Exemplo>
      <Exemplo rotulo="Aviso de confirmação na tela">
        <div className="w-full max-w-xl">
          <AvisoConfirmacao
            mensagem={MENSAGEM_AVISO}
            onConfirmar={() => avisarSalvo()}
            onRevisar={() => {}}
          />
        </div>
      </Exemplo>
      <Exemplo rotulo="Aviso de salvo">
        <Button variant="outline" onClick={() => avisarSalvo()}>
          Mostrar aviso de salvo
        </Button>
      </Exemplo>
      <Exemplo rotulo="Dica ao passar o mouse">
        <BotaoIcone rotulo="Mais informações" icone={Info} />
      </Exemplo>
    </Subsecao>
  )
}
