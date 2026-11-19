type Cor = { token: string; nome: string; uso: string; provisoria: boolean }

export const CORES: Cor[] = [
  { token: '--elo-azul-marinho', nome: 'Azul-marinho', uso: 'Lateral, títulos de página, botão principal, números dos indicadores', provisoria: true },
  { token: '--elo-dourado', nome: 'Dourado', uso: 'Filete sob o título, barrinha do item ativo, nomes dos grupos da lateral, detalhes', provisoria: true },
  { token: '--elo-dourado-suave', nome: 'Dourado suave', uso: 'Filete sob o título da página', provisoria: false },
  { token: '--elo-dourado-escuro', nome: 'Dourado escuro', uso: 'Texto dourado sobre fundo claro, quando for preciso', provisoria: false },
  { token: '--elo-papel', nome: 'Papel', uso: 'Fundo da área de conteúdo', provisoria: false },
  { token: '--elo-branco', nome: 'Branco', uso: 'Cartões, painéis, campos', provisoria: false },
  { token: '--elo-tinta', nome: 'Tinta', uso: 'Texto principal', provisoria: false },
  { token: '--elo-texto-secundario', nome: 'Texto secundário', uso: 'Rótulos, descrições, datas', provisoria: false },
  { token: '--elo-borda', nome: 'Borda', uso: 'Bordas de cartões e painéis', provisoria: false },
  { token: '--elo-divisoria', nome: 'Divisória', uso: 'Linhas internas de tabelas e painéis', provisoria: false },
  { token: '--elo-lateral-texto', nome: 'Texto da lateral', uso: 'Itens do menu', provisoria: false },
  { token: '--elo-lateral-texto-fraco', nome: 'Texto fraco da lateral', uso: 'Perfil do usuário', provisoria: false },
  { token: '--elo-borda-campo', nome: 'Borda de campo', uso: 'Contorno de campos e controles de formulário', provisoria: false },
  { token: '--elo-alerta', nome: 'Alerta', uso: 'Erros, ações destrutivas e mensagens de validação', provisoria: false },
]

type ParDeContraste = { frente: string; fundo: string; minimo: number; descricao: string }

const par = (frente: string, fundo: string, minimo: number, descricao: string): ParDeContraste => ({
  frente: `--elo-${frente}`,
  fundo: `--elo-${fundo}`,
  minimo,
  descricao,
})

export const PARES_DE_CONTRASTE: ParDeContraste[] = [
  par('tinta', 'branco', 4.5, 'Texto principal sobre branco'),
  par('texto-secundario', 'branco', 4.5, 'Texto secundário sobre branco'),
  par('texto-secundario', 'papel', 4.5, 'Texto secundário sobre papel'),
  par('azul-marinho', 'papel', 4.5, 'Azul-marinho sobre papel'),
  par('branco', 'azul-marinho', 4.5, 'Branco sobre azul-marinho'),
  par('dourado', 'azul-marinho', 4.5, 'Dourado sobre azul-marinho'),
  par('lateral-texto', 'azul-marinho', 4.5, 'Texto da lateral sobre azul-marinho'),
  par('lateral-texto-fraco', 'azul-marinho', 4.5, 'Texto fraco da lateral sobre azul-marinho'),
  par('dourado-escuro', 'branco', 4.5, 'Dourado escuro sobre branco'),
  par('alerta', 'branco', 4.5, 'Alerta sobre branco'),
  par('crit-critica-texto', 'crit-critica-fundo', 4.5, 'Criticidade crítica'),
  par('crit-alta-texto', 'crit-alta-fundo', 4.5, 'Criticidade alta'),
  par('crit-moderada-texto', 'crit-moderada-fundo', 4.5, 'Criticidade moderada'),
  par('crit-baixa-texto', 'crit-baixa-fundo', 4.5, 'Criticidade baixa'),
  par('status-suspenso-texto', 'branco', 4.5, 'Status suspenso sobre branco'),
  par('borda-campo', 'branco', 3, 'Borda de campo sobre branco'),
  par('borda-campo', 'papel', 3, 'Borda de campo sobre papel'),
]
