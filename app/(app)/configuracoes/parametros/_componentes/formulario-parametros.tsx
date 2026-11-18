'use client'

import { useActionState, useEffect, useState } from 'react'
import { Campo } from '@/components/elo/campo'
import { CampoData } from '@/components/elo/campo-data'
import { Painel } from '@/components/elo/painel'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { avisarSalvo } from '@/lib/avisos'
import type { Parametros } from '@/lib/dados/parametros'
import { salvarParametros } from '@/lib/parametros/acoes'
import { ESTADO_INICIAL_PARAMETROS } from '@/lib/parametros/estados'
import type { CampoParametro } from '@/lib/parametros/validacao'

const REFERENCIAS = [
  { campo: 'referenciaCritica', criticidade: 'Crítica' },
  { campo: 'referenciaAlta', criticidade: 'Alta' },
  { campo: 'referenciaModerada', criticidade: 'Moderada' },
  { campo: 'referenciaBaixa', criticidade: 'Baixa' },
] as const

/**
 * Os parâmetros do Administrador (parte 8, 4.3; DF-81, Apêndice C): os prazos dos alertas, os remetentes por finalidade
 * (DF-21), a referência de prazo por criticidade (DF-22) e o início oficial da operação (DF-46). Quem confere é o
 * servidor; com `noValidate`, valem as mensagens da plataforma.
 */
export function FormularioParametros({ parametros }: { parametros: Parametros }) {
  const [estado, enviar, enviando] = useActionState(salvarParametros, ESTADO_INICIAL_PARAMETROS)
  const [inicio, setInicio] = useState<string | null>(parametros.inicioOperacao)

  useEffect(() => {
    if (estado.sucesso) avisarSalvo(estado.sucesso)
  }, [estado])

  const iniciais: Record<CampoParametro, string> = {
    diasProximoDoPrazo: String(parametros.diasProximoDoPrazo),
    diasDoAlerta: String(parametros.diasDoAlerta),
    remetenteDemanda: parametros.remetenteDemanda,
    remetenteSite: parametros.remetenteSite,
    referenciaBaixa: String(parametros.referencias.Baixa ?? ''),
    referenciaModerada: String(parametros.referencias.Moderada ?? ''),
    referenciaAlta: String(parametros.referencias.Alta ?? ''),
    referenciaCritica: String(parametros.referencias['Crítica'] ?? ''),
    inicioOperacao: parametros.inicioOperacao ?? '',
  }
  // Depois de um erro, o React limpa o formulário: o valor padrão devolve o que foi digitado.
  const inicial = (campo: CampoParametro) => estado.valores?.[campo] ?? iniciais[campo]
  const erros = estado.erros

  return (
    <form action={enviar} noValidate className="space-y-5">
      {estado.erroGeral ? (
        <Alert variant="destructive">
          <AlertDescription>{estado.erroGeral}</AlertDescription>
        </Alert>
      ) : null}
      <Painel titulo="Prazos dos alertas">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Dias de “próxima do prazo”" obrigatorio erro={erros.diasProximoDoPrazo} ajuda="A atividade fica próxima do prazo nesses dias antes dele (RN-10)">
            {(p) => <Input {...p} name="diasProximoDoPrazo" inputMode="numeric" defaultValue={inicial('diasProximoDoPrazo')} />}
          </Campo>
          <Campo rotulo="Dias do alerta de vencimento" obrigatorio erro={erros.diasDoAlerta} ajuda="O contrato fica próximo do vencimento nesses dias antes do término (RN-05)">
            {(p) => <Input {...p} name="diasDoAlerta" inputMode="numeric" defaultValue={inicial('diasDoAlerta')} />}
          </Campo>
        </div>
      </Painel>
      <Painel titulo="Remetentes">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Notificação de demanda" obrigatorio erro={erros.remetenteDemanda}>
            {(p) => <Input {...p} name="remetenteDemanda" type="email" defaultValue={inicial('remetenteDemanda')} />}
          </Campo>
          <Campo rotulo="Avisos dos formulários do site" obrigatorio erro={erros.remetenteSite}>
            {(p) => <Input {...p} name="remetenteSite" type="email" defaultValue={inicial('remetenteSite')} />}
          </Campo>
        </div>
        <p className="mt-3 text-secundario text-muted-foreground">
          Os e-mails de acesso (convite e senha) saem sempre do remetente padrão, atendimento@elogovernance.com.br.
        </p>
      </Painel>
      <Painel titulo="Referência de prazo por criticidade">
        <p className="mb-3 text-secundario text-muted-foreground">
          Em dias, só como orientação na triagem: a plataforma não preenche o prazo da demanda. Vazio, não aparece.
        </p>
        <div className="grid gap-4 sm:grid-cols-4">
          {REFERENCIAS.map((r) => (
            <Campo key={r.campo} rotulo={r.criticidade} erro={erros[r.campo]}>
              {(p) => <Input {...p} name={r.campo} inputMode="numeric" defaultValue={inicial(r.campo)} />}
            </Campo>
          ))}
        </div>
      </Painel>
      <Painel titulo="Início oficial da operação">
        <div className="max-w-xs">
          <Campo
            rotulo="Data do início"
            erro={erros.inicioOperacao}
            ajuda="Até essa data, as notificações de demanda não saem e os alertas ficam ocultos (DF-46)"
          >
            {(p) => (
              <>
                <CampoData {...p} valor={inicio} onChange={setInicio} />
                <input type="hidden" name="inicioOperacao" value={inicio ?? ''} />
              </>
            )}
          </Campo>
        </div>
      </Painel>
      <Button type="submit" carregando={enviando}>
        Salvar parâmetros
      </Button>
    </form>
  )
}
