// Verificador dos critérios de aceite: confere o mapa dos épicos no README contra o PRD e mostra o que já tem teste.
//
// Uso:
//   npm run criterios                      mapa e cobertura; falha só se o mapa estiver errado
//   npm run criterios -- --epico E4        falha também se algum item do E4 estiver sem teste (pronto do épico)
//   npm run criterios -- --completo        falha se qualquer item do PRD estiver sem teste (fim da Etapa 3)
//   npm run criterios -- --detalhes        lista, por épico, os itens ainda sem teste
//
// Fontes: docs/prd.md (critérios CA, cenários CN do Apêndice D e fluxos alternativos da seção 7.1, numerados pela
// ordem dentro de cada caso de uso: UC-05.2 é a segunda linha do UC-05), README.md (épicos) e os testes que provam
// itens do PRD: testes/integracao/**/*.test.ts e testes/e2e/**/*.spec.ts. Os testes de unidade não contam, porque
// provam o protótipo, e não o sistema de verdade. Um item conta como testado quando o código dele aparece no título
// de um it, test ou describe. CA-14.2 e CA-19.5 também precisam de uma linha em testes/verificacoes-manuais.md.

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const RAIZ = join(import.meta.dirname, '..')
const ler = (caminho) => readFileSync(join(RAIZ, caminho), 'utf8').replace(/\r\n/g, '\n')
const args = process.argv.slice(2)
const epicoPedido = args.includes('--epico') ? args[args.indexOf('--epico') + 1] : null
const completo = args.includes('--completo')
const detalhes = args.includes('--detalhes') || Boolean(epicoPedido)
const erros = []

// ---------------------------------------------------------------------------------------------------------------
// PRD
// ---------------------------------------------------------------------------------------------------------------
const prd = ler('docs/prd.md')
const trecho = (de, ate) => prd.slice(prd.indexOf(de), prd.indexOf(ate, prd.indexOf(de)))
const normalizar = (texto) => texto.replace(/\s+/g, ' ').trim()

const criterios = new Map([...prd.matchAll(/^- (CA-\d+\.\d+) (.+)$/gm)].map((m) => [m[1], normalizar(m[2])]))
const cenarios = new Set([...trecho('## Apêndice D', '## Apêndice E').matchAll(/^\| (CN-\d+\.\d+) \|/gm)].map((m) => m[1]))
const fluxos = new Set()
const porCaso = {}
for (const m of trecho('### 7.1', '\n## 8.').matchAll(/^\| (UC-\d+) \|/gm)) {
  porCaso[m[1]] = (porCaso[m[1]] ?? 0) + 1
  fluxos.add(`${m[1]}.${porCaso[m[1]]}`)
}

// ---------------------------------------------------------------------------------------------------------------
// README: épicos
// ---------------------------------------------------------------------------------------------------------------
const readme = ler('README.md')
const secaoEpicos = readme.slice(readme.indexOf('## Épicos de desenvolvimento'), readme.indexOf('## Fora dos épicos'))
const partes = secaoEpicos.split(/^### (E\d+) · (.+)$/m)
const epicos = []
for (let i = 1; i < partes.length; i += 3) {
  const corpo = partes[i + 2]
  epicos.push({
    codigo: partes[i],
    nome: partes[i + 1].trim(),
    CA: [...corpo.matchAll(/^- \*\*(CA-\d+\.\d+)\*\* (.+)$/gm)].map((m) => ({ codigo: m[1], texto: normalizar(m[2]) })),
    CN: [...corpo.matchAll(/^\| \*\*(CN-\d+\.\d+)\*\* \|/gm)].map((m) => ({ codigo: m[1] })),
    UC: [...corpo.matchAll(/^\| \*\*(UC-\d+\.\d+)\*\* \|/gm)].map((m) => ({ codigo: m[1] })),
    completa: [...(corpo.match(/^\*\*Completa também:\*\*.*$/m)?.[0] ?? '').matchAll(/CA-\d+\.\d+/g)].map((m) => m[0]),
    manuais: [...(corpo.match(/^\*\*Verificação manual:\*\*.*$/m)?.[0] ?? '').matchAll(/CA-\d+\.\d+/g)].map((m) => m[0]),
  })
}
if (epicos.length === 0) erros.push('README.md sem épicos: esperava títulos "### E1 · Nome" na seção "Épicos de desenvolvimento".')

const dono = new Map()
for (const tipo of ['CA', 'CN', 'UC']) {
  const doPrd = { CA: new Set(criterios.keys()), CN: cenarios, UC: fluxos }[tipo]
  for (const epico of epicos) {
    for (const item of epico[tipo]) {
      if (!doPrd.has(item.codigo)) erros.push(`${epico.codigo}: ${item.codigo} não existe no PRD.`)
      else if (dono.has(item.codigo)) erros.push(`${item.codigo} está em ${dono.get(item.codigo)} e em ${epico.codigo}: cada item tem um épico só.`)
      else dono.set(item.codigo, epico.codigo)
      if (tipo === 'CA' && criterios.has(item.codigo) && criterios.get(item.codigo) !== item.texto) {
        erros.push(`${epico.codigo}: o texto do ${item.codigo} no README está diferente do PRD. Copie o do PRD.`)
      }
    }
  }
  for (const codigo of doPrd) if (!dono.has(codigo)) erros.push(`${codigo} do PRD não está em nenhum épico.`)
}
for (const epico of epicos) {
  for (const codigo of epico.completa) {
    if (!criterios.has(codigo)) erros.push(`${epico.codigo}: "Completa também" cita ${codigo}, que não existe no PRD.`)
    else if (dono.get(codigo) === epico.codigo) erros.push(`${epico.codigo}: ${codigo} é do próprio épico e não precisa estar em "Completa também".`)
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Testes
// ---------------------------------------------------------------------------------------------------------------
function arquivos(pasta, final) {
  const absoluta = join(RAIZ, pasta)
  if (!existsSync(absoluta)) return []
  return readdirSync(absoluta, { recursive: true })
    .map(String)
    .filter((nome) => nome.endsWith(final))
    .map((nome) => join(absoluta, nome))
}

const testados = new Map() // código -> primeiro arquivo onde aparece
const TITULO = /\b(?:it|test|describe)(?:\.\w+)*\(\s*(['"`])((?:\\.|(?!\1).)*)\1/g
for (const arquivo of [...arquivos('testes/integracao', '.test.ts'), ...arquivos('testes/e2e', '.spec.ts')]) {
  const conteudo = readFileSync(arquivo, 'utf8')
  for (const m of conteudo.matchAll(TITULO)) {
    for (const c of m[2].matchAll(/\b(?:CA|CN|UC)-\d+\.\d+\b/g)) if (!testados.has(c[0])) testados.set(c[0], relative(RAIZ, arquivo))
  }
}
const manuaisFeitos = existsSync(join(RAIZ, 'testes/verificacoes-manuais.md'))
  ? new Set([...ler('testes/verificacoes-manuais.md').matchAll(/^- \*\*(CA-\d+\.\d+)\*\*/gm)].map((m) => m[1]))
  : new Set()
const manuais = new Set(epicos.flatMap((e) => e.manuais))
const provado = (codigo) => testados.has(codigo) && (!manuais.has(codigo) || manuaisFeitos.has(codigo))

// ---------------------------------------------------------------------------------------------------------------
// Relatório
// ---------------------------------------------------------------------------------------------------------------
const conta = (itens) => `${itens.filter((i) => provado(i.codigo)).length}/${itens.length}`
console.log('Critérios de aceite por épico (itens com teste de integração ou de ponta a ponta / itens do épico)\n')
console.log('Épico'.padEnd(52) + 'CA'.padStart(8) + 'CN'.padStart(8) + 'Fluxos'.padStart(9))
for (const e of epicos) {
  console.log(`${e.codigo} · ${e.nome}`.slice(0, 51).padEnd(52) + conta(e.CA).padStart(8) + conta(e.CN).padStart(8) + conta(e.UC).padStart(9))
}
const todos = epicos.flatMap((e) => [...e.CA, ...e.CN, ...e.UC])
const total = (tipo) => conta(epicos.flatMap((e) => e[tipo]))
console.log('-'.repeat(77))
console.log('Total'.padEnd(52) + total('CA').padStart(8) + total('CN').padStart(8) + total('UC').padStart(9))
console.log(`\nPRD: ${criterios.size} critérios, ${cenarios.size} cenários e ${fluxos.size} fluxos alternativos.`)

const alvo = epicoPedido ? epicos.filter((e) => e.codigo === epicoPedido) : epicos
if (epicoPedido && alvo.length === 0) erros.push(`Épico ${epicoPedido} não existe no README.`)
const faltam = alvo.flatMap((e) => [...e.CA, ...e.CN, ...e.UC].filter((i) => !provado(i.codigo)).map((i) => ({ ...i, epico: e.codigo })))
if (detalhes && faltam.length > 0) {
  console.log(`\nSem teste${epicoPedido ? ` no ${epicoPedido}` : ''}:`)
  for (const e of alvo) {
    const doEpico = faltam.filter((f) => f.epico === e.codigo).map((f) => f.codigo + (manuais.has(f.codigo) && testados.has(f.codigo) ? ' (falta a verificação manual)' : ''))
    if (doEpico.length > 0) console.log(`  ${e.codigo}: ${doEpico.join(', ')}`)
  }
}

if (erros.length > 0) {
  console.error(`\nO mapa dos épicos tem ${erros.length} problema(s):`)
  for (const erro of erros) console.error(`  - ${erro}`)
  process.exit(1)
}
if ((epicoPedido || completo) && faltam.length > 0) {
  console.error(`\n${faltam.length} item(ns) sem teste${epicoPedido ? ` no ${epicoPedido}` : ''}.`)
  process.exit(1)
}
console.log(`\nMapa conferido: ${todos.length} itens, cada um num épico só.`)
