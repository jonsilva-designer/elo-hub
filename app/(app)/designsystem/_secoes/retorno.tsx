'use client'

import { Info } from 'lucide-react'
import { AvisoConfirmacao, ConfirmarAcao } from '@/components/elo/confirmacao'
import { BotaoIcone } from '@/components/elo/botao-icone'
import { Button } from '@/components/ui/button'
import { avisarSalvo } from '@/lib/avisos'
import { MENSAGEM_AVISO } from '../exemplos'
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
