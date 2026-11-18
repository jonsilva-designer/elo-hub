import type { Documento } from '../tipos'

// Documentos fictícios (F12). Cada um mostra um caso da seção 4.3 da parte 6. Os vínculos seguem o cliente do
// documento (RN-02), com os ancestrais preenchidos: a evidência da atividade também é do plano, do escopo e do
// contrato. O arquivo não existe: o download devolve um texto de exemplo (parte 6, seção 2).

type Base = Pick<Documento, 'id' | 'nome' | 'categoria' | 'clienteId' | 'data' | 'incluidoEm' | 'incluidoPorId' | 'arquivo'>

const documento = (base: Base, resto: Partial<Documento> = {}): Documento => ({
  especialistaId: null,
  contratoId: null,
  escopoId: null,
  etapa: null,
  planoId: null,
  atividadeId: null,
  demandaNumero: null,
  avaliacaoId: null,
  status: 'Vigente',
  substituidoPorId: null,
  inativo: false,
  observacoes: '',
  ...base,
  ...resto,
})

const pdf = (nome: string, tamanho: number) => ({ nome, tipo: 'application/pdf', tamanho })
const docx = (nome: string, tamanho: number) => ({
  nome,
  tipo: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  tamanho,
})
const xlsx = (nome: string, tamanho: number) => ({
  nome,
  tipo: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  tamanho,
})

const MANUTENCAO = { contratoId: 'ctr-vertice-manutencao' }
const DOCUMENTAL = { ...MANUTENCAO, escopoId: 'esc-vertice-documental' }

export const DOCUMENTOS: Documento[] = [
  documento(
    {
      id: 'doc-vertice-contrato',
      nome: 'Contrato CT-2025-031 assinado',
      categoria: 'Contrato',
      clienteId: 'cli-vertice',
      data: '2025-06-20',
      incluidoEm: '2026-02-03',
      incluidoPorId: 'usr-helena',
      arquivo: pdf('CT-2025-031 assinado.pdf', 2_516_582),
    },
    { ...MANUTENCAO, observacoes: 'Via assinada pelas duas partes, com os anexos técnicos.' },
  ),
  documento(
    {
      id: 'doc-vertice-aditivo-minuta',
      nome: 'Primeiro aditivo de prazo',
      categoria: 'Aditivo Contratual',
      clienteId: 'cli-vertice',
      data: '2026-05-12',
      incluidoEm: '2026-05-13',
      incluidoPorId: 'usr-rafael',
      arquivo: docx('Aditivo 01 - minuta.docx', 184_320),
    },
    { ...MANUTENCAO, status: 'Superado', substituidoPorId: 'doc-vertice-aditivo-assinado' },
  ),
  documento(
    {
      id: 'doc-vertice-aditivo-assinado',
      nome: 'Primeiro aditivo de prazo, versão assinada',
      categoria: 'Aditivo Contratual',
      clienteId: 'cli-vertice',
      data: '2026-06-02',
      incluidoEm: '2026-06-03',
      incluidoPorId: 'usr-rafael',
      arquivo: pdf('Aditivo 01 - assinado.pdf', 901_120),
    },
    MANUTENCAO,
  ),
  documento(
    {
      id: 'doc-vertice-levantamento',
      nome: 'Relatório do levantamento documental',
      categoria: 'Relatório',
      clienteId: 'cli-vertice',
      data: '2026-04-30',
      incluidoEm: '2026-04-30',
      incluidoPorId: 'usr-rafael',
      arquivo: pdf('Levantamento documental.pdf', 1_258_291),
    },
    { ...DOCUMENTAL, etapa: 'Diagnosticar', observacoes: 'Os 42 documentos obrigatórios, com a validade de cada um.' },
  ),
  documento(
    {
      id: 'doc-vertice-controle-validade',
      nome: 'Modelo do controle de validade',
      categoria: 'Documento do Escopo Contratado',
      clienteId: 'cli-vertice',
      data: '2026-10-08',
      incluidoEm: '2026-10-08',
      incluidoPorId: 'usr-rafael',
      arquivo: xlsx('Controle de validade.xlsx', 96_256),
    },
    { ...DOCUMENTAL, etapa: 'Implementar', observacoes: 'Preparado antes da etapa, para a implantação do controle.' },
  ),
  documento(
    {
      id: 'doc-vertice-protocolo-licenca',
      nome: 'Protocolo da renovação da licença de operação',
      categoria: 'Evidência',
      clienteId: 'cli-vertice',
      data: '2026-10-21',
      incluidoEm: '2026-10-21',
      incluidoPorId: 'usr-rafael',
      arquivo: pdf('Protocolo LO 2026.pdf', 412_672),
    },
    { ...DOCUMENTAL, planoId: 'pla-vertice-licencas', atividadeId: 'atv-licencas-protocolo' },
  ),
  documento(
    {
      id: 'doc-vertice-certidoes',
      nome: 'Lista das certidões vencidas, enviada pelo cliente',
      categoria: 'Documento do Cliente',
      clienteId: 'cli-vertice',
      data: '2026-04-02',
      incluidoEm: '2026-04-02',
      incluidoPorId: 'usr-rafael',
      arquivo: { nome: 'Certidões vencidas.eml', tipo: 'message/rfc822', tamanho: 58_368 },
    },
    { demandaNumero: 'ELO-2026-0003' },
  ),
  documento(
    {
      id: 'doc-vertice-parecer',
      nome: 'Parecer sobre a retenção do pagamento',
      categoria: 'Documento do Especialista',
      clienteId: 'cli-vertice',
      data: '2026-04-09',
      incluidoEm: '2026-04-10',
      incluidoPorId: 'usr-rafael',
      arquivo: pdf('Parecer - retenção.pdf', 327_680),
    },
    { especialistaId: 'esp-juridico', demandaNumero: 'ELO-2026-0003' },
  ),
  documento(
    {
      id: 'doc-vertice-instrumento',
      nome: 'Instrumento preenchido do diagnóstico de setembro',
      categoria: 'Relatório',
      clienteId: 'cli-vertice',
      data: '2026-09-15',
      incluidoEm: '2026-09-18',
      incluidoPorId: 'usr-helena',
      arquivo: xlsx('Instrumento de maturidade - set 2026.xlsx', 143_360),
    },
    { avaliacaoId: 'ava-vertice-2' },
  ),
  documento(
    {
      id: 'doc-especialista-curriculo',
      nome: 'Currículo de Beatriz Fontes',
      categoria: 'Documento do Especialista',
      clienteId: null,
      data: '2026-01-15',
      incluidoEm: '2026-01-16',
      incluidoPorId: 'usr-helena',
      arquivo: pdf('Currículo Beatriz Fontes.pdf', 220_160),
    },
    { especialistaId: 'esp-juridico', observacoes: 'Enviado por e-mail pela especialista.' },
  ),
  documento(
    {
      id: 'doc-montareal-cronograma',
      nome: 'Cronograma da montagem eletromecânica',
      categoria: 'Documento do Escopo Contratado',
      clienteId: 'cli-montareal',
      data: '2026-03-05',
      incluidoEm: '2026-03-06',
      incluidoPorId: 'usr-helena',
      arquivo: xlsx('Cronograma de montagem.xlsx', 77_824),
    },
    { contratoId: 'ctr-montareal-montagem', escopoId: 'esc-montareal-montagem' },
  ),
  documento(
    {
      id: 'doc-atlantica-termo-2025',
      nome: 'Termo complementar do ciclo 2025',
      categoria: 'Termo Complementar',
      clienteId: 'cli-atlantica',
      data: '2025-02-14',
      incluidoEm: '2026-02-11',
      incluidoPorId: 'usr-helena',
      arquivo: pdf('Termo complementar 2025.pdf', 655_360),
    },
    { contratoId: 'ctr-atlantica-porto', escopoId: 'esc-atlantica-2025', status: 'Encerrado' },
  ),
  documento(
    {
      id: 'doc-atlantica-ata-duplicada',
      nome: 'Ata da reunião de abertura do ciclo 2026',
      categoria: 'Outros',
      clienteId: 'cli-atlantica',
      data: '2026-02-20',
      incluidoEm: '2026-02-21',
      incluidoPorId: 'usr-rafael',
      arquivo: docx('Ata de abertura.docx', 45_056),
    },
    { contratoId: 'ctr-atlantica-porto', inativo: true, observacoes: 'Enviada em duplicidade.' },
  ),
]
