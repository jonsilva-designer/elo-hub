'use client'

import { useState } from 'react'
import { Campo } from '@/components/elo/campo'
import { CampoArquivo } from '@/components/elo/campo-arquivo'
import { CampoData } from '@/components/elo/campo-data'
import { CampoValor } from '@/components/elo/campo-valor'
import { SelecaoMultipla } from '@/components/elo/selecao-multipla'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Exemplo, Subsecao } from './secao'

const RESPONSAVEIS = [
  { valor: 'ana', rotulo: 'Ana Ribeiro' },
  { valor: 'bruno', rotulo: 'Bruno Tavares' },
  { valor: 'carla', rotulo: 'Carla Mendes' },
]

const SEGMENTOS = ['Agronegócio', 'Transporte e logística', 'Comércio', 'Serviços']

/** Coluna de largura realista para um campo, para ele não esticar pelo painel. */
function Coluna({ children }: { children: React.ReactNode }) {
  return <div className="w-full max-w-sm">{children}</div>
}

function SelecaoSimples({
  id,
  disabled,
  invalido,
  descritoPor,
}: {
  id: string
  disabled?: boolean
  invalido?: true
  descritoPor?: string
}) {
  const [segmento, setSegmento] = useState<string>()
  return (
    <Select value={segmento} onValueChange={setSegmento} disabled={disabled}>
      <SelectTrigger id={id} className="w-full" aria-invalid={invalido} aria-describedby={descritoPor}>
        <SelectValue placeholder="Selecione" />
      </SelectTrigger>
      <SelectContent>
        {SEGMENTOS.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function Formulario() {
  const [responsaveis, setResponsaveis] = useState<string[]>(['bruno'])
  const [vazios, setVazios] = useState<string[]>([])
  const [inicio, setInicio] = useState<string | null>('2026-11-09')
  const [prazo, setPrazo] = useState<string | null>(null)
  const [valor, setValor] = useState<number | null>(48500)
  const [valorVazio, setValorVazio] = useState<number | null>(null)
  const [confirmado, setConfirmado] = useState(true)
  const [porte, setPorte] = useState('medio')
  const [, setArquivo] = useState<File | null>(null)

  return (
    <Subsecao titulo="Formulário">
      <Exemplo rotulo="Campo de texto">
        <Coluna>
          <Campo rotulo="Nome do cliente">
            {(p) => <Input {...p} defaultValue="Grupo Horizonte Agro" />}
          </Campo>
        </Coluna>
      </Exemplo>
      <Exemplo rotulo="Campo de texto, com ajuda">
        <Coluna>
          <Campo rotulo="Nome do cliente" ajuda="Como aparece nos relatórios">
            {(p) => <Input {...p} placeholder="Ex.: Transportes Serra Azul" />}
          </Campo>
        </Coluna>
      </Exemplo>
      <Exemplo rotulo="Campo de texto, com erro">
        <Coluna>
          <Campo rotulo="Nome do cliente" erro="Informe o nome do cliente">
            {(p) => <Input {...p} />}
          </Campo>
        </Coluna>
      </Exemplo>
      <Exemplo rotulo="Campo de texto, desabilitado">
        <Coluna>
          <Campo rotulo="Nome do cliente">
            {(p) => <Input {...p} defaultValue="Transportes Serra Azul" disabled />}
          </Campo>
        </Coluna>
      </Exemplo>
      <Exemplo rotulo="Campo de texto, obrigatório">
        <Coluna>
          <Campo rotulo="Nome do cliente" obrigatorio ajuda="Campo obrigatório">
            {(p) => <Input {...p} required />}
          </Campo>
        </Coluna>
      </Exemplo>

      <Exemplo rotulo="Área de texto">
        <Coluna>
          <Campo rotulo="Observações" ajuda="Visível só para a equipe">
            {(p) => <Textarea {...p} defaultValue="Cliente prefere contato pela manhã." />}
          </Campo>
        </Coluna>
      </Exemplo>
      <Exemplo rotulo="Área de texto, com erro">
        <Coluna>
          <Campo rotulo="Observações" erro="Escreva ao menos uma linha">
            {(p) => <Textarea {...p} />}
          </Campo>
        </Coluna>
      </Exemplo>

      <Exemplo rotulo="Seleção">
        <Coluna>
          <Campo rotulo="Segmento">
            {(p) => <SelecaoSimples id={p.id} descritoPor={p['aria-describedby']} />}
          </Campo>
        </Coluna>
      </Exemplo>
      <Exemplo rotulo="Seleção, com erro">
        <Coluna>
          <Campo rotulo="Segmento" erro="Escolha um segmento">
            {(p) => <SelecaoSimples id={p.id} invalido={p['aria-invalid']} descritoPor={p['aria-describedby']} />}
          </Campo>
        </Coluna>
      </Exemplo>
      <Exemplo rotulo="Seleção, desabilitada">
        <Coluna>
          <Campo rotulo="Segmento">{(p) => <SelecaoSimples id={p.id} disabled />}</Campo>
        </Coluna>
      </Exemplo>

      <Exemplo rotulo="Seleção múltipla com busca">
        <Coluna>
          <Campo rotulo="Responsáveis" ajuda="Digite para buscar">
            {(p) => (
              <SelecaoMultipla
                {...p}
                opcoes={RESPONSAVEIS}
                valores={responsaveis}
                onChange={setResponsaveis}
              />
            )}
          </Campo>
        </Coluna>
      </Exemplo>
      <Exemplo rotulo="Seleção múltipla, com erro">
        <Coluna>
          <Campo rotulo="Responsáveis" erro="Escolha ao menos um responsável">
            {(p) => <SelecaoMultipla {...p} opcoes={RESPONSAVEIS} valores={vazios} onChange={setVazios} />}
          </Campo>
        </Coluna>
      </Exemplo>

      <Exemplo rotulo="Data">
        <Coluna>
          <Campo rotulo="Início do contrato" ajuda="Digite ou abra o calendário">
            {(p) => <CampoData {...p} valor={inicio} onChange={setInicio} />}
          </Campo>
        </Coluna>
      </Exemplo>
      <Exemplo rotulo="Data, com erro">
        <Coluna>
          <Campo rotulo="Prazo de entrega" erro="Informe uma data válida">
            {(p) => <CampoData {...p} valor={prazo} onChange={setPrazo} />}
          </Campo>
        </Coluna>
      </Exemplo>
      <Exemplo rotulo="Data, desabilitada">
        <Coluna>
          <Campo rotulo="Início do contrato">
            {(p) => <CampoData {...p} valor="2026-11-09" onChange={() => {}} disabled />}
          </Campo>
        </Coluna>
      </Exemplo>

      <Exemplo rotulo="Valor em reais">
        <Coluna>
          <Campo rotulo="Valor do contrato">
            {(p) => <CampoValor {...p} valor={valor} onChange={setValor} />}
          </Campo>
        </Coluna>
      </Exemplo>
      <Exemplo rotulo="Valor, com erro">
        <Coluna>
          <Campo rotulo="Valor do contrato" erro="Informe o valor">
            {(p) => <CampoValor {...p} valor={valorVazio} onChange={setValorVazio} />}
          </Campo>
        </Coluna>
      </Exemplo>
      <Exemplo rotulo="Valor, desabilitado">
        <Coluna>
          <Campo rotulo="Valor do contrato">
            {(p) => <CampoValor {...p} valor={12000} onChange={() => {}} disabled />}
          </Campo>
        </Coluna>
      </Exemplo>

      <Exemplo rotulo="Caixa de seleção">
        <Coluna>
          <Campo rotulo="Confirmação">
            {(p) => (
              <div className="flex items-center gap-2">
                <Checkbox {...p} checked={confirmado} onCheckedChange={(c) => setConfirmado(c === true)} />
                <Label htmlFor={p.id} className="font-normal">
                  Revisei os dados do cliente
                </Label>
              </div>
            )}
          </Campo>
        </Coluna>
      </Exemplo>
      <Exemplo rotulo="Caixa de seleção, desabilitada">
        <Coluna>
          <Campo rotulo="Confirmação">
            {(p) => (
              <div className="flex items-center gap-2">
                <Checkbox {...p} disabled />
                <Label htmlFor={p.id} className="font-normal">
                  Revisei os dados do cliente
                </Label>
              </div>
            )}
          </Campo>
        </Coluna>
      </Exemplo>

      <Exemplo rotulo="Opção única">
        <Coluna>
          <Campo rotulo="Porte da empresa">
            {(p) => (
              <RadioGroup
                id={p.id}
                aria-labelledby={`${p.id}-rotulo`}
                value={porte}
                onValueChange={setPorte}
              >
                {[
                  ['pequeno', 'Pequeno'],
                  ['medio', 'Médio'],
                  ['grande', 'Grande'],
                ].map(([v, r]) => (
                  <div key={v} className="flex items-center gap-2">
                    <RadioGroupItem id={`${p.id}-${v}`} value={v} />
                    <Label htmlFor={`${p.id}-${v}`} className="font-normal">
                      {r}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </Campo>
        </Coluna>
      </Exemplo>
      <Exemplo rotulo="Opção única, desabilitada">
        <Coluna>
          <Campo rotulo="Porte da empresa">
            {(p) => (
              <RadioGroup id={p.id} aria-labelledby={`${p.id}-rotulo`} defaultValue="medio" disabled>
                {[
                  ['pequeno', 'Pequeno'],
                  ['medio', 'Médio'],
                ].map(([v, r]) => (
                  <div key={v} className="flex items-center gap-2">
                    <RadioGroupItem id={`${p.id}-${v}`} value={v} />
                    <Label htmlFor={`${p.id}-${v}`} className="font-normal">
                      {r}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </Campo>
        </Coluna>
      </Exemplo>

      <Exemplo rotulo="Envio de arquivo">
        <Coluna>
          <Campo rotulo="Contrato assinado" ajuda="Somente PDF">
            {(p) => <CampoArquivo {...p} aceitar=".pdf" onChange={setArquivo} />}
          </Campo>
        </Coluna>
      </Exemplo>
      <Exemplo rotulo="Envio de arquivo, com erro">
        <Coluna>
          <Campo rotulo="Contrato assinado" erro="Anexe o contrato">
            {(p) => <CampoArquivo {...p} aceitar=".pdf" onChange={setArquivo} />}
          </Campo>
        </Coluna>
      </Exemplo>
      <Exemplo rotulo="Envio de arquivo, desabilitado">
        <Coluna>
          <Campo rotulo="Contrato assinado">
            {(p) => <CampoArquivo {...p} onChange={setArquivo} disabled />}
          </Campo>
        </Coluna>
      </Exemplo>

      <Exemplo rotulo="Rótulo com ajuda e erro" nota="A ajuda e o erro ficam ligados ao campo para leitores de tela.">
        <Coluna>
          <Campo
            rotulo="Responsável pelo contrato"
            obrigatorio
            ajuda="Quem assina pela Transportes Serra Azul"
            erro="Informe o responsável"
          >
            {(p) => <Input {...p} />}
          </Campo>
        </Coluna>
      </Exemplo>
    </Subsecao>
  )
}
