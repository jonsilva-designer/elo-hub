import type { CampoTexto } from '../tipos'

// Os textos da Visão Executiva (DF-73, DF-82): "Principais resultados", "Observações executivas" e "Próximos passos",
// um de cada por cliente, sempre a versão atual. As versões anteriores ficariam no histórico (DF-16) e não aparecem.

type TextoFicticio = {
  clienteId: string
  campo: CampoTexto
  texto: string
  /** ISO com fuso. */
  atualizadoEm: string
  atualizadoPorId: string
}

export const TEXTOS_EXECUTIVOS: TextoFicticio[] = [
  {
    clienteId: 'cli-vertice',
    campo: 'principaisResultados',
    texto:
      'O levantamento documental foi concluído: 42 documentos obrigatórios mapeados, com a validade de cada um. O primeiro aditivo de prazo do contrato de manutenção foi assinado em junho.',
    atualizadoEm: '2026-10-30T16:20:00-03:00',
    atualizadoPorId: 'usr-rafael',
  },
  {
    clienteId: 'cli-vertice',
    campo: 'observacoesExecutivas',
    texto:
      'A maturidade subiu de Básica para Em estruturação entre março e setembro. O ponto de atenção é a mobilização da equipe embarcada, com o contrato perto do fim da vigência.',
    atualizadoEm: '2026-11-04T10:05:00-03:00',
    atualizadoPorId: 'usr-helena',
  },
  {
    clienteId: 'cli-vertice',
    campo: 'proximosPassos',
    texto: 'Renovar a licença de operação, implantar o controle de validade e decidir a renovação do contrato de mobilização.',
    atualizadoEm: '2026-11-04T10:12:00-03:00',
    atualizadoPorId: 'usr-helena',
  },
  {
    clienteId: 'cli-atlantica',
    campo: 'principaisResultados',
    texto: 'O ciclo 2025 do contrato portuário foi fechado com o relatório de resultados entregue no prazo.',
    atualizadoEm: '2026-01-20T09:30:00-03:00',
    atualizadoPorId: 'usr-rafael',
  },
]
