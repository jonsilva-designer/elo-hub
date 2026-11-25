# Plataforma ELO

Sistema interno da ELO HUB Governança Inteligente para organizar a governança dos contratos dos clientes: clientes, contratos e propostas, escopos com criticidade, Jornada ELO, planos de ação e atividades, Central ELO de demandas, especialistas, documentos e a Visão Executiva do Cliente.

A ELO faz a gestão administrativa e a governança dos contratos de pequenas e médias empresas que prestam serviço a grandes contratantes. A plataforma é a base digital dessa operação e segue um ciclo encadeado:

> Cliente → Contrato → Escopo Contratado → Criticidade → Jornada ELO → Plano de Ação → Atividades → Documentos e Evidências → Central ELO → Resultados

Desenvolvida pela Result Consultoria e Inovação, no contrato Sebraetec SB.2038.26. O código é da ELO (contrato, cláusula 10ª).

## Sumário

1. [Onde o projeto está](#onde-o-projeto-está)
2. [Documentos: a fonte da verdade](#documentos-a-fonte-da-verdade)
3. [A plataforma em uma página](#a-plataforma-em-uma-página)
4. [Stack e infraestrutura](#stack-e-infraestrutura)
5. [Como rodar](#como-rodar)
6. [Estrutura do código](#estrutura-do-código)
7. [Convenções](#convenções)
8. [Armadilhas conhecidas deste Next.js](#armadilhas-conhecidas-deste-nextjs)
9. [Do protótipo à plataforma](#do-protótipo-à-plataforma)
10. [Testes e verificação dos critérios de aceite](#testes-e-verificação-dos-critérios-de-aceite)
11. [Épicos de desenvolvimento](#épicos-de-desenvolvimento)
12. [Fora dos épicos](#fora-dos-épicos)
13. [Ambientes, contas e variáveis](#ambientes-contas-e-variáveis)

---

## Onde o projeto está

| Etapa do contrato | Período | Situação |
|---|---|---|
| 1. Documentação, descoberta e alinhamento | 03/11 a 13/11/2026 | Concluída. PRD e arquitetura pré-aprovados pela Cleo em 16/11/2026 |
| 2. Prototipação e design | 16/11 a 04/12/2026 | Concluída. Protótipo aprovado pela Cleo em 24/11/2026 |
| 3. Desenvolvimento da aplicação | 23/11 a 23/12/2026 | Em andamento: os épicos deste documento |
| 4. Testes de qualidade e entrega final | 04/01 a 15/01/2027 | A começar: os critérios de aceite validados um a um |

O código deste repositório é o **protótipo aprovado**: todas as telas do MVP, nos perfis Administrador e Equipe, com regras de tela, validações e permissões, mas com **dados fictícios** e **login simulado**. Nada é gravado: salvar só simula. O desenvolvimento troca os dados fictícios pelo Supabase, épico por épico, **sem refazer as telas**. O protótipo publicado fica em https://elo-hub-rho.vercel.app.

Pessoas: Cleonice Azevedo Jardim (Cleo) aprova pela ELO. Jonathan Silva responde pela Result. Osvaldo cuida do site institucional e do DNS do domínio da ELO.

---

## Documentos: a fonte da verdade

| Documento | O que tem |
|---|---|
| [`docs/prd.md`](docs/prd.md) (v1.21) | **O que** construir: 20 funcionalidades (F01 a F20), 25 regras de negócio (RN), 83 definições (DF), 136 critérios de aceite (CA), 88 cenários das regras (Apêndice D, CN), 117 fluxos alternativos (seção 7.1), matriz de permissões (4.3), ciclo de vida das entidades (6.1), mapa de telas (10), listas oficiais e parâmetros iniciais (Apêndice C) e textos dos formulários do site (Apêndice E) |
| [`docs/arquitetura.md`](docs/arquitetura.md) (v1.14) | **Como** construir: stack, camadas, módulos e rotas, visões de cálculo, banco de dados (tabelas, gatilhos, políticas de acesso), APIs, autenticação, segurança, ambientes, custos e as decisões DA-01 a DA-07 |
| [`docs/criterios-de-aceite-do-contrato.md`](docs/criterios-de-aceite-do-contrato.md) | O que o contrato pede em cada etapa, critério por critério, com a situação de cada um |
| Página `/designsystem` (com o `npm run dev`) | Padrão visual e biblioteca de componentes aprovados: cores, tipografia, componentes e estados de interface. Os tokens ficam em `app/globals.css` |

**Regra de ouro:** este código segue o PRD e a arquitetura, nunca o contrário. Se uma regra precisar mudar, a mudança nasce no PRD, numa versão nova aprovada pela Result, e só depois entra no código. O desenvolvedor não decide regra de negócio sozinho: na dúvida, pergunta ao Jonathan.

Os PDFs do PRD e da arquitetura, os que vão para a Cleo, saem destes arquivos: `python docs/ferramentas/pdf/gerar.py` (Windows, com o Edge e o PyMuPDF). Mudou o `.md`, gere o PDF de novo.

---

## A plataforma em uma página

**Quem usa.** Só a equipe interna da ELO, em dois perfis:

| Perfil | Pode |
|---|---|
| Administrador ELO | Tudo: cadastros, usuários e vínculos, listas oficiais, parâmetros, criticidade, inativação, exclusão definitiva, exportação |
| Equipe ELO | Só os clientes a que está vinculada: atualiza a Jornada, cria planos, atividades, demandas, documentos e avaliações Em elaboração, edita os textos da Visão Executiva. Não exporta nem exclui |

Clientes e especialistas não têm login no MVP. Visitantes do site usam dois formulários públicos: pedido de diagnóstico e candidatura de especialista. A matriz completa está no PRD, seção 4.3.

**Módulos e rotas** (arquitetura, 3.2; PRD, seção 10):

| Módulo | Funcionalidades | Rotas |
|---|---|---|
| Acesso | F01 | `/login`, `/recuperar-senha`, `/definir-senha` |
| Início | F13, F15 | `/inicio` |
| Clientes | F02, F16 | `/clientes`, `/clientes/novo`, `/clientes/[id]`, `/clientes/[id]/editar` |
| Maturidade | F20 | `/avaliacoes/nova?cliente=[id]`, `/avaliacoes/[id]`, `/avaliacoes/[id]/editar` |
| Contratos | F03, F04 | `/contratos`, `/contratos/novo`, `/contratos/[id]`, `/contratos/[id]/editar` |
| Escopos e Jornada | F05, F06 | `/escopos`, `/escopos/novo?contrato=[id]`, `/escopos/[id]`, `/escopos/[id]/editar` |
| Planos e atividades | F07, F08 | `/planos/[id]`, `/planos/novo?escopo=[id]`, `/atividades/nova?plano=[id]`, `/atividades/[id]/editar`, `/minhas-atividades` |
| Central ELO | F09, F10 | `/central`, `/central/nova`, `/central/[numero]`, `/central/[numero]/editar` |
| Especialistas | F11 | `/especialistas`, `/especialistas/novo`, `/especialistas/[id]`, `/especialistas/[id]/editar` |
| Documentos | F12 | `/documentos`, `/documentos/novo`, `/documentos/[id]`, `/documentos/[id]/editar` |
| Visão Executiva | F14 | `/clientes/[id]/visao-executiva`, `/api/visao-executiva/[cliente]/pdf` |
| Configurações | F01, DF-01, DF-81 | `/configuracoes/usuarios`, `/configuracoes/listas`, `/configuracoes/parametros` |
| Site | F19 | `/site/diagnostico`, `/site/especialista` |
| Exportação | F16 | `/api/exportar/[lista]` (só o Administrador) |

**Princípios da arquitetura** (seção 1), que valem para todo épico:

1. **A regra mora no banco.** Segregação por vínculo, transições de status e bloqueios ficam no Postgres, em políticas de acesso por linha (RLS) e gatilhos. A tela ajuda; o banco garante.
2. **Calcular, não guardar.** Vigência, atraso, "próxima do prazo", etapa atual e alertas são calculados na consulta, no horário de Brasília, pela função `hoje()`. Não há rotina noturna.
3. **Parâmetros, não código.** Listas oficiais e prazos dos alertas são configuração que o Administrador altera na tela.
4. **Custo baixo e tudo em nome da ELO.**

---

## Stack e infraestrutura

| Camada | Escolha |
|---|---|
| Interface e servidor | Next.js 16 (App Router, `cacheComponents`), React 19, TypeScript |
| Estilo | Tailwind CSS 4, componentes shadcn/ui adaptados ao padrão visual |
| Banco, autenticação e arquivos | Supabase: Postgres com RLS, gatilhos e visões; Auth com e-mail e senha; Storage com bucket privado. Região São Paulo |
| E-mail | Resend: API para a notificação da Central e SMTP para os e-mails de autenticação, no domínio elogovernance.com.br |
| PDF | `@react-pdf/renderer`, gerado no servidor |
| Formulários públicos | Cloudflare Turnstile, campo armadilha e limite por IP |
| Hospedagem | Vercel |
| Backup | Backup diário do Supabase Pro (7 dias) e cópia própria diária, por 30 dias, num armazenamento independente, pelo GitHub Actions (DA-07) |
| Testes | Vitest (unidade e integração com o banco) e Playwright (ponta a ponta) |

---

## Como rodar

Requer Node.js 20 ou mais recente. Do épico E1 em diante, também o Docker e a CLI do Supabase.

```bash
npm install
npm run dev          # http://localhost:3000
```

Hoje, a tela de entrada tem os botões "Entrar como Administrador" e "Entrar como Equipe" (login simulado). O E1 troca isso pelo login de verdade.

| Comando | Faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm test` | Testes de unidade (Vitest) |
| `npm run lint` | ESLint |
| `NEXT_DIST_DIR=.next/verificacao npx next build` | Build de conferência, sem derrubar o `npm run dev` (ver as armadilhas) |
| `npx tsc --noEmit -p .` | Tipos, depois da build de conferência |
| `npm run criterios` | Mapa dos critérios de aceite, cenários e fluxos por épico, e quais já têm teste ([detalhes](#o-verificador-npm-run-criterios)) |

Depois do E1 entram `supabase start`, `npm run test:integracao` e `npm run test:e2e` (ver [Testes](#testes-e-verificação-dos-critérios-de-aceite)).

---

## Estrutura do código

```
app/(acesso)/          login, recuperar e definir senha
app/(app)/             telas internas, com a lateral e o cabeçalho
app/site/              formulários públicos do site
app/api/               PDF da Visão Executiva, exportação, download de documento
app/designsystem/      padrão visual e biblioteca de componentes
components/ui/         base shadcn/ui
components/elo/        componentes da plataforma (painéis, tabelas, filtros, histórico, Jornada, números...)
lib/dados/             ÚNICA porta de acesso aos dados pelas telas: listar, obter, calcular
lib/dados/mock/        dados fictícios do protótipo: saem módulo a módulo, até sumirem
lib/<módulo>/acoes.ts  ações do servidor (salvar, mudar status, inativar...), uma por operação
lib/<módulo>/          validação, regras de tela e estados dos formulários de cada módulo
proxy.ts               manda ao login quem não entrou (o "middleware" do Next 16)
docs/                  PRD, arquitetura, critérios do contrato e a ferramenta dos PDFs
scripts/criterios.mjs  verificador dos critérios de aceite
```

Entram no E1: `supabase/` (migrações, seed, configuração da CLI) e `testes/` (integração e ponta a ponta).

---

## Convenções

- **Português** em tudo: nomes de arquivos, funções, variáveis, tabelas e colunas (sem acento no banco, arquitetura 4.1), textos de tela e mensagens de commit.
- **Estilo do código:** aspas simples, sem ponto e vírgula, linhas longas. **Não rode o Prettier**: o projeto não tem configuração dele, e ele reescreve todos os arquivos. Confira com `npx eslint <arquivos>`.
- **Design system:** telas só com componentes de `components/elo` e `components/ui` e tokens de `app/globals.css`. Nada de cor, tamanho ou espaçamento solto. Números, datas, códigos e valores sempre em `<Num>` (JetBrains Mono). Títulos em Playfair Display, textos em Montserrat.
- **Permissão no servidor:** toda ação confere perfil e vínculo no servidor, mesmo quando a tela esconde o botão, e responde a mesma recusa para "não existe" e "sem acesso", sem revelar o que existe.
- **As telas nunca passam o usuário:** ele vem da sessão (`obterUsuarioAtual()`).
- **Testes citam o código do critério** que provam no título, como `it('CA-02.1 · não salva dois clientes com o mesmo CNPJ')`.
- **Commits** pequenos, um assunto por commit, em português.

---

## Armadilhas conhecidas deste Next.js

Este é o Next.js 16, com mudanças em relação ao que a maioria conhece. Leia `node_modules/next/dist/docs/` antes de usar uma API pela primeira vez (ver `AGENTS.md`).

1. **Relógio e `cacheComponents`.** Qualquer `new Date()` no caminho de renderização de uma página precisa vir depois de `await connection()`. Use `hojeDaRequisicao()` (`lib/dados/hoje.ts`). Ler a sessão antes não basta. O erro só aparece no servidor de desenvolvimento ("Blocking Route ... `new Date()`"). Rotas de `app/api` podem usar `new Date()` direto. Com o banco, os cálculos de data vêm da função `hoje()` do Postgres.
2. **Build e servidor de desenvolvimento juntos.** `next build` na pasta padrão com o `next dev` ligado quebra o servidor ("Jest worker encountered 2 child process exceptions"). Rode a build de conferência com `NEXT_DIST_DIR=.next/verificacao`.
3. **Tipos das rotas.** O `tsc` depende dos tipos que a build gera em `.next/verificacao/types`. Ordem de conferência: testes, lint, build de conferência, `tsc`.
4. **`app/globals.css`.** Depois de mudar esse arquivo, o `next dev` continua servindo o CSS antigo. Pare o servidor, apague `.next/dev` e suba de novo.
5. **Formulários.** O `Select` do Radix voltava ao valor inicial depois de cada ação do servidor; o `SelecaoDoFormulario` já trata isso. Os formulários do site enviam pelo `onSubmit`, para o React não limpar os campos.
6. **Envio de arquivos na Vercel.** As funções da Vercel recusam requisições acima de 4,5 MB, e a plataforma aceita arquivos de até 10 MB (DF-72). O upload de documentos vai direto ao Storage (épico E11).

---

## Do protótipo à plataforma

O protótipo já separa as telas dos dados. O desenvolvimento troca o que está atrás dessa separação, sem mexer na tela:

1. **Leitura:** as funções de `lib/dados/<módulo>.ts` passam a consultar o Supabase com a sessão do usuário, mantendo os nomes, os parâmetros e os tipos de retorno (`lib/dados/tipos.ts`). Os cálculos (vigência, atraso, etapa atual, alertas, maturidade) vêm das visões do banco (arquitetura, 3.3), e não mais de funções em TypeScript.
2. **Gravação:** as ações de `lib/<módulo>/acoes.ts` passam a gravar de verdade. As validações de formulário continuam na ação, para a mensagem clara; o banco garante a regra de novo (RLS, restrições e gatilhos). Erros do banco viram mensagens de tela.
3. **Mock:** quando o módulo passa a ler e gravar no banco, o arquivo dele em `lib/dados/mock/` sai, junto com os testes de unidade que só provavam o mock. No fim do E15, `lib/dados/mock/` não existe mais.
4. **Sessão:** a sessão simulada por cookie (`lib/dados/sessao.ts`, `lib/acesso/`) vira o Supabase Auth no E1, mantendo `obterUsuarioAtual()`.

O que o protótipo **não** tem e o desenvolvimento cria: banco e migrações, gravação, histórico automático, e-mails, upload e download de arquivos, log técnico, proteção real dos formulários públicos, backup e produção. A lista dos 21 critérios que o protótipo só simulava está em cada épico, dentro dos critérios dele.

---

## Testes e verificação dos critérios de aceite

O objetivo da Etapa 3 é chegar ao fim com **todos os 136 critérios de aceite, os 88 cenários e os 117 fluxos alternativos provados por teste contra o sistema de verdade**. A Etapa 4 valida um a um com a Cleo, na homologação (proposta, Etapa 4; arquitetura, seção 2, "Testes").

### Os três níveis

| Nível | Onde | Contra o quê | Para quê |
|---|---|---|---|
| Unidade | `**/*.test.ts(x)` ao lado do código | Funções e componentes, sem banco | Validações, formatações, regras de tela. Os testes atuais do protótipo estão aqui |
| Integração | `testes/integracao/**/*.test.ts` | O Postgres local do Supabase (`supabase start`), com as migrações e o seed | Regras do banco: RLS, gatilhos, restrições, funções e visões. É onde ficam os cenários CN |
| Ponta a ponta | `testes/e2e/**/*.spec.ts` | A aplicação rodando (`next dev` ou build) ligada ao Supabase local, num navegador (Playwright) | O critério como o usuário vê: telas, permissões, mensagens, e-mails, PDF, exportação |

**Só os testes de integração e de ponta a ponta contam como prova de um critério.** Os de unidade provam o protótipo; um critério só está atendido quando o sistema de verdade o cumpre.

### Regras

- Cada teste que prova um item tem o código no título: `CA-02.1 · ...`, `CN-06.1 · ...`, `UC-05.1 · ...`. Um teste pode provar mais de um item.
- **Personagens fixos**, os mesmos do Apêndice D do PRD, criados pelo `supabase/seed.sql`: o Administrador; **Ana**, da Equipe, vinculada só ao cliente **A**; **Bruno**, da Equipe, vinculado ao cliente **B**; o cliente **C**, Inativo; e o cadastro da ELO como cliente (DF-40).
- **Data fixa:** os cenários de prazo usam datas do PRD (por exemplo, 10/03/2027). A função `hoje()` do banco aceita uma data fixa só no banco local de testes, por uma configuração que o seed liga e que não existe na homologação nem na produção.
- **Integração como cada usuário:** cada teste roda numa transação desfeita no fim, com o papel `authenticated` e o usuário do personagem (`request.jwt.claims`), para que as políticas de acesso valham como na aplicação.
- **E-mail nos testes:** o envio passa por um módulo único (`lib/email`), com um modo de captura nos testes, para conferir destinatário, remetente, assunto e link sem enviar nada. Os e-mails do Auth local caem no Mailpit do Supabase local.
- **Regras transversais por registro de entidades:** histórico (CA-17), inativação, exclusão e fechamento (CA-18) e segregação (CA-01.1) valem para todas as entidades. O E1 cria as suítes desses critérios, que rodam sobre um registro de entidades (`testes/integracao/entidades.ts`); cada épico de entidade acrescenta a sua ao registro, e as suítes passam a valer para ela. O E15 confere que todas estão lá.
- **Verificação manual:** só dois critérios não se provam inteiros por código: CA-14.2 (legibilidade em projeção) e CA-19.5 (página do site aprovada pela Cleo). Eles têm teste no que dá para automatizar e uma linha com data e evidência em `testes/verificacoes-manuais.md`.

### O verificador: `npm run criterios`

`scripts/criterios.mjs` lê o PRD, este README e os testes, e confere:

1. Cada um dos 136 critérios do PRD está em **um e só um** épico, com o **texto igual ao do PRD**. Se o PRD mudar, o verificador aponta o critério cujo texto ficou diferente.
2. Cada um dos 88 cenários e dos 117 fluxos alternativos está em um e só um épico.
3. Quais itens já têm teste de integração ou de ponta a ponta, por épico.

Sem argumentos, falha só se o mapa estiver errado e mostra o que falta testar. Com `--epico E4`, falha se algum item do E4 estiver sem teste: é a checagem de "pronto" do épico. Com `--completo`, falha se qualquer item do PRD estiver sem teste: é a checagem do fim da Etapa 3.

### Integração contínua

O E1 cria o fluxo do GitHub Actions, que roda em todo envio e em todo pedido de junção: lint, testes de unidade, build de conferência, tipos, testes de integração (com `supabase start` no próprio runner), testes de ponta a ponta e `npm run criterios`. Junção no `main` só com tudo verde.

---

## Épicos de desenvolvimento

Os 16 épicos cobrem o MVP inteiro. Cada critério de aceite tem **um épico dono**, onde o teste dele é escrito. Quando um critério fala de várias telas (por exemplo, "aparece na lista, no dashboard e na Visão Executiva"), o dono constrói o centro da regra, e os épicos das outras telas aparecem em **Completa também**: lá, o mesmo teste ganha a parte daquela tela. O critério só está atendido quando o dono e todos os que o completam estão prontos.

| Épico | Critérios de aceite | Cenários | Fluxos | Depende de | Critérios do contrato |
|---|---|---|---|---|---|
| [E1 · Fundação técnica e sessão real](#e1--fundação-técnica-e-sessão-real) | 2 | 0 | 3 | — | 3.12, 3.15, 3.17, 3.18 |
| [E2 · Clientes e vínculos](#e2--clientes-e-vínculos) | 4 | 2 | 2 | E1 | 3.2, 3.14 |
| [E3 · Usuários e perfis](#e3--usuários-e-perfis) | 3 | 0 | 2 | E2 | 3.13 |
| [E4 · Contratos e vigência](#e4--contratos-e-vigência) | 16 | 11 | 7 | E2 | 3.3 |
| [E5 · Listas oficiais e parâmetros](#e5--listas-oficiais-e-parâmetros) | 2 | 1 | 2 | E4 | — |
| [E6 · Especialistas](#e6--especialistas) | 2 | 0 | 0 | E1 | 3.8 |
| [E7 · Escopos, criticidade e Jornada ELO](#e7--escopos-criticidade-e-jornada-elo) | 22 | 13 | 15 | E4, E6 | 3.4, 3.5 |
| [E8 · Planos de ação e atividades](#e8--planos-de-ação-e-atividades) | 10 | 11 | 9 | E7 | 3.6 |
| [E9 · Avaliação de maturidade](#e9--avaliação-de-maturidade) | 7 | 9 | 9 | E4, E8 | — |
| [E10 · Central ELO e notificação por e-mail](#e10--central-elo-e-notificação-por-e-mail) | 19 | 15 | 26 | E7 | 3.7 |
| [E11 · Documentos e evidências](#e11--documentos-e-evidências) | 7 | 4 | 6 | E4, E7, E8, E9, E10 | 3.9 |
| [E12 · Início: dashboard e alertas](#e12--início-dashboard-e-alertas) | 13 | 5 | 10 | E4, E6, E7, E8, E10 | 3.10, 3.3 |
| [E13 · Visão Executiva e PDF](#e13--visão-executiva-e-pdf) | 8 | 1 | 6 | E4, E7, E8, E9, E10 | 3.11 |
| [E14 · Formulários e página do site](#e14--formulários-e-página-do-site) | 7 | 0 | 9 | E2, E6, E10 | — |
| [E15 · Regras transversais](#e15--regras-transversais) | 14 | 16 | 10 | E1 a E14 | 3.14, 3.17 |
| [E16 · Produção, backup e operação](#e16--produção-backup-e-operação) | 0 | 0 | 1 | E15 para a entrada em produção | 3.16, 3.18, 4.6 |
| **Total** | **136** | **88** | **117** | | |

### Pronto, para qualquer épico

Um épico só está pronto quando:

1. **Banco:** as migrações do épico estão em `supabase/migrations`, aplicadas do zero sem erro; toda tabela nova tem RLS ligada e as políticas da arquitetura (4.5), os campos e o gatilho de criação e alteração (4.1), o gatilho de histórico com valor anterior e novo nas alterações relevantes da DF-16 e, se tiver status, o gatilho de transição carregado da seção 6.1 do PRD (arquitetura, 4.4). Os tipos do banco gerados estão atualizados.
2. **Telas ligadas:** as telas do módulo leem e gravam no Supabase pelas funções de `lib/dados` e pelas ações de `lib/<módulo>/acoes.ts`, sem mudar o que a tela mostra; o mock do módulo saiu.
3. **Critérios provados:** cada critério, cenário e fluxo do épico tem teste de integração ou de ponta a ponta com o código no título, e passa. Os itens de **Completa também** ganharam a parte desta tela. `npm run criterios -- --epico <En>` passa.
4. **Entidades no registro:** cada entidade nova está no registro de entidades, e as suítes transversais passam para ela.
5. **Tudo verde:** lint, unidade, build de conferência, tipos, integração e ponta a ponta, na integração contínua.
6. **Na homologação:** publicado na homologação e apresentado à Cleo. A aprovação dela é registrada no grupo oficial (critérios 3.1 e 3.20 do contrato).

A ordem abaixo segue as dependências. Épicos sem dependência entre si podem andar em paralelo (por exemplo, E5 e E6).

---

### E1 · Fundação técnica e sessão real

**Objetivo:** montar o chão de todos os outros épicos: banco versionado, login de verdade, a base das regras transversais, os testes contra o sistema real e a publicação na homologação.

**Depende de:** nada.
**Contrato:** 3.12 (autenticação), 3.15 (HTTPS), 3.17 (rastreabilidade, a base), 3.18 (aplicação no ar, na homologação).
**Requisitos não funcionais:** RNF-01, RNF-03, RNF-07 (a base), RNF-11.
**Base:** arquitetura, seções 2, 3.1, 4.1, 4.3 (`usuario`, `configuracao`, `lista_item`, `registro_alteracao`, `log_tecnico`), 4.4, 6, 7 e 8; PRD, RN-20, DF-04, DF-16, DF-46, DF-70, DF-72, DF-81.

**Construir:**

- **Supabase no repositório:** CLI configurada (`supabase/config.toml`), migrações em `supabase/migrations`, `supabase/seed.sql` com os personagens dos testes. Projeto de homologação no plano gratuito, numa organização separada da produção, região São Paulo (DA-06).
- **Contas da homologação:** Supabase, Resend e Vercel, criadas pelo desenvolvedor em nome da ELO, e a lista de registros de DNS para o Osvaldo ([Contas](#contas)).
- **Convenções do banco (4.1):** colunas `criado_em`, `criado_por`, `alterado_em` e `alterado_por` preenchidas por um gatilho genérico; tipos enumerados com os valores do PRD; função genérica do gatilho de herança do cliente (RN-02), ligada às tabelas filhas nos épicos delas.
- **Tabelas de base:** `usuario` (mesmo id do Auth), `configuracao` com todas as chaves da 4.3 e os valores iniciais (5 e 30 dias, remetentes, referências de prazo vazias, início da operação vazio, e-mail da Central, formatos e 10 MB, 4 horas de sessão), `lista_item` com os valores do Apêndice C do PRD e o índice único sem diferenciar maiúsculas e acentos, `registro_alteracao`, `log_tecnico` e `transicao_permitida`, carregada das tabelas da seção 6.1 do PRD.
- **Gatilhos genéricos:** o de histórico (grava em `registro_alteracao` o campo, o valor anterior, o novo, o usuário e a hora, só para os campos da DF-16 de cada tabela) e o de transição de status (4.4: recusa o que não está em `transicao_permitida` para o perfil, confere as exigências do destino, recebe a justificativa da ação numa variável da transação, preenche ou apaga as datas automáticas). Cada épico liga esses gatilhos às tabelas dele.
- **Função `hoje()`:** a data de hoje no fuso America/Sao_Paulo (RN-20), com a data fixa só no banco local de testes.
- **Sessão real:** Supabase Auth com e-mail e senha, autocadastro desligado, política de senha de 8 caracteres. Troca o login simulado (`lib/acesso`, `lib/dados/sessao.ts`) mantendo `obterUsuarioAtual()`; o `proxy.ts` renova a sessão e manda ao login quem não entrou, levando o endereço pedido. Usuário inativo é recusado no login com mensagem (CA-01.3). Recuperação de senha por e-mail (CA-01.5) e definição de senha pelo convite. Expiração depois de 4 horas sem uso, controlada pela aplicação (DA-05), com aviso antes de expirar.
- **E-mails do Auth:** SMTP do Resend no domínio da ELO, com o remetente padrão (DF-21). Depende dos registros de DNS que o Osvaldo cria (arquitetura, seção 8); até lá, os testes usam o Mailpit local.
- **Módulo de e-mail:** `lib/email`, com o envio pelo Resend e o modo de captura dos testes. O E10 usa.
- **Segurança:** cabeçalhos HSTS e política de conteúdo (arquitetura, 7); chaves só em variáveis do servidor.
- **Testes:** configuração do Vitest de integração (separada da de unidade, que deixa `testes/` de fora), Playwright, ajudantes `comoUsuario(personagem, ...)` e data fixa, registro de entidades e as suítes transversais (CA-01.1, CA-17, CA-18), vazias até o E2.
- **Verificador e integração contínua:** `npm run criterios` já existe; o E1 acrescenta `test:integracao`, `test:e2e` e o fluxo do GitHub Actions.
- **Homologação no ar:** a Vercel publica cada ramo numa pré-visualização ligada à homologação, e o `main` no endereço da homologação. Os dados de demonstração da homologação vêm dos dados fictícios do protótipo, convertidos num seed próprio, para a Cleo aprovar cada entrega com dados que ela já conhece.

#### Critérios de aceite (2)

- **CA-01.3** Um usuário inativo recebe uma mensagem de acesso negado ao tentar entrar.
- **CA-01.5** A recuperação de senha envia um link de redefinição para o e-mail cadastrado.

**O que o protótipo não fazia e este épico faz de verdade:**

- CA-01.5: o e-mail com o link.

#### Fluxos alternativos (3)

Da seção 7.1 do PRD. O número depois do caso de uso é a ordem da linha na tabela dele.

| Fluxo | Situação | O que acontece | Regra |
|---|---|---|---|
| **UC-01.1** | Usuário inativo tenta entrar | Acesso negado, com mensagem | CA-01.3 |
| **UC-01.2** | Esqueceu a senha | Recebe por e-mail o link de redefinição | CA-01.5 |
| **UC-01.3** | 4 horas sem uso | A tela avisa antes de expirar, como diretriz. A sessão termina e pede novo login | DF-04 (EC-87) |

**Pontos de atenção:** as armadilhas do Next 16 acima, principalmente a do relógio. O cookie e o `proxy.ts` do protótipo já guardam o endereço pedido para voltar a ele depois do login; isso continua valendo.

---

### E2 · Clientes e vínculos

**Objetivo:** o primeiro cadastro de verdade e a regra de segregação que todo o resto usa.

**Depende de:** E1.
**Contrato:** 3.2 (cadastro de clientes), 3.14 (segregação lógica, a base).
**Requisitos não funcionais:** RNF-02 (a base).
**Base:** PRD, F02, RN-01, RN-06, DF-05, DF-06, DF-23, DF-40; arquitetura, 4.3 (`cliente`, `vinculo`) e 4.5.

**Construir:**

- Tabelas `cliente` e `vinculo`. CNPJ único e com dígitos verificadores válidos no próprio banco (RN-06).
- Funções `eh_admin()` e `tem_vinculo(cliente_id)` e as políticas de `cliente` e `vinculo` (4.5): o Administrador lê tudo; a Equipe, só os clientes vinculados; só o Administrador grava.
- O cadastro da ELO como cliente, com o id na `configuracao` (DF-40). Ele não conta no total de clientes ativos.
- Telas de clientes ligadas ao banco: lista com busca e filtros (nome, status, segmento), cadastro, edição, página do cliente em abas. Inativar e reativar entram aqui; o bloqueio por itens abertos ganha os itens à medida que os épicos deles chegam (E15 confere).
- Cliente e vínculo no registro de entidades: as suítes de segregação e histórico passam a rodar.

#### Critérios de aceite (4)

- **CA-02.1** Não é possível salvar dois clientes com o mesmo CNPJ.
- **CA-02.2** Um CNPJ com formato ou dígito verificador inválido é recusado com mensagem clara.
- **CA-02.3** A lista de clientes filtra por nome, status e segmento [MVP §25].
- **CA-02.4** Um cliente inativo continua consultável com todo o histórico.

#### Cenários das regras (2)

| Cenário | Dado | Quando | Então |
|---|---|---|---|
| **CN-06.1** | Cliente cadastrado com um CNPJ | Outro cliente é salvo com o mesmo CNPJ | Recusa |
| **CN-06.2** | Um CNPJ com o dígito verificador errado | O cliente é salvo | Recusa, com mensagem |

#### Fluxos alternativos (2)

Da seção 7.1 do PRD. O número depois do caso de uso é a ordem da linha na tabela dele.

| Fluxo | Situação | O que acontece | Regra |
|---|---|---|---|
| **UC-05.1** | CNPJ inválido | Recusa, com mensagem | CA-02.2 (EC-07) |
| **UC-05.2** | CNPJ já cadastrado | Bloqueia | CA-02.1 (EC-08) |

---

### E3 · Usuários e perfis

**Objetivo:** o Administrador gerencia a equipe na plataforma: convite, edição, perfis, vínculos e inativação.

**Depende de:** E2.
**Contrato:** 3.13 (controle por perfis).
**Requisitos não funcionais:** RNF-01.
**Base:** PRD, F01, DF-04, DF-37; arquitetura, 4.3 (`usuario`, `vinculo`), 4.5 e 6.

**Construir:**

- Tela `/configuracoes/usuarios` ligada ao banco: lista, cadastro por convite (o Supabase envia o e-mail para definir a senha), edição do perfil e dos vínculos, inativação e reativação.
- Usuário inativado: bloqueado no Auth e com as sessões encerradas (arquitetura, 6).
- Regra do último Administrador ativo no banco (DF-37): não inativa nem rebaixa para Equipe.
- Menu e telas de Configurações fora do alcance da Equipe, no servidor e não só no menu.
- A troca de responsável dos itens abertos (CA-01.7, CA-01.9) fica no E15, quando todos os tipos de item já existem.

#### Critérios de aceite (3)

- **CA-01.2** Um usuário Equipe não vê o menu nem acessa as telas de usuários, de listas oficiais e de parâmetros.
- **CA-01.4** Só o Administrador cria, edita, inativa e vincula usuários.
- **CA-01.8** Não é possível inativar o último Administrador ativo nem mudar o perfil dele para Equipe.

#### Fluxos alternativos (2)

Da seção 7.1 do PRD. O número depois do caso de uso é a ordem da linha na tabela dele.

| Fluxo | Situação | O que acontece | Regra |
|---|---|---|---|
| **UC-01.5** | Equipe tenta abrir usuários, listas ou parâmetros | O menu não aparece e a tela nega o acesso | CA-01.2 |
| **UC-02.1** | Inativar ou rebaixar o último Administrador ativo | Impedido | DF-37 (EC-01) |

---

### E4 · Contratos e vigência

**Objetivo:** contratos e propostas do cliente com o grande contratante, com a vigência calculada a cada consulta.

**Depende de:** E2.
**Contrato:** 3.3 (contratos e propostas com vigência e alerta de vencimento).
**Base:** PRD, F03, F04, RN-03, RN-04, RN-05, RN-19, RN-20, DF-25, DF-47, DF-54, DF-66 a DF-69; arquitetura, 3.3 (`contrato_vigencia`), 4.3 (`contrato`, `contrato_servico`).

**Construir:**

- Tabelas `contrato` e `contrato_servico`, com as restrições da 4.3: código único por cliente, contratante obrigatório, término maior ou igual ao início, datas exigidas a partir de Ativo conforme o tipo de vigência, pelo menos um serviço.
- Visão `contrato_vigencia`: dias restantes e status da vigência com os dias do alerta da `configuracao`; Suspenso conta como Ativo; prazo indeterminado é Vigente, sem dias e sem alerta.
- **Regra do responsável com vínculo (RN-19):** função `responsaveis_possiveis(cliente_id)` (Administradores e Equipe vinculada) usada pela lista de escolha da tela, e gatilho que recusa responsável fora dela. Este é o primeiro campo de responsável; os épicos seguintes ligam o mesmo gatilho aos campos deles.
- Gatilho de transição de status do contrato (6.1) e aviso da RN-21 na tela.
- Telas de contratos ligadas ao banco: lista com busca, filtros (cliente, contratante, serviço, status, status da vigência), destaques de vencimento e de Suspenso; cadastro, edição e página do contrato; encerrar, cancelar, reabrir e excluir.

#### Critérios de aceite (16)

- **CA-01.6** Nos campos de responsável, a lista mostra só os Administradores e os usuários Equipe vinculados ao cliente do registro.
- **CA-03.1** Não é possível salvar um contrato sem cliente, código, contratante, objeto, serviço, tipo de vigência, responsável e status.
- **CA-03.2** Não é possível colocar um contrato em Ativo sem data de início da vigência, nem sem data de término, exceto quando o tipo de vigência é Prazo indeterminado.
- **CA-03.3** A data de término não pode ser anterior à de início.
- **CA-03.5** A lista filtra por cliente, contratante, status e status da vigência [MVP §25].
- **CA-03.6** Não é possível salvar dois contratos com o mesmo código no mesmo cliente. Clientes diferentes podem ter contratos com o mesmo código.
- **CA-03.7** Um contrato aceita um ou mais serviços da lista oficial, e a lista de contratos filtra por serviço.
- **CA-04.1** Um contrato Ativo com término dentro do prazo do alerta (30 dias, ou o valor do parâmetro, DF-81) aparece como "Próximo do vencimento" e entra nos alertas.
- **CA-04.2** Um contrato Ativo com término anterior a hoje aparece como "Vencido".
- **CA-04.3** Um contrato Encerrado ou Cancelado aparece com vigência "Encerrado" e sai dos alertas.
- **CA-04.4** Os dias restantes são calculados a cada consulta, sem ação do usuário.
- **CA-04.5** Um contrato Ativo que passa da data de término continua Ativo, com vigência "Vencido", e entra no indicador de contratos vencidos do dashboard.
- **CA-04.6** Um contrato Suspenso tem status da vigência e alertas calculados como os de um contrato Ativo (RN-04, DF-54).
- **CA-04.7** Um contrato Ativo de Prazo indeterminado aparece como "Vigente", sem dias restantes, e nunca entra nos alertas de vencimento.
- **CA-04.8** Um contrato com vigência "Vencido" entra nos alertas, e os contratos Próximos do vencimento e Vencidos aparecem destacados no dashboard e na lista de contratos (DF-25, DF-34).
- **CA-04.9** Um contrato Suspenso tem identificação visual diferente da de um contrato Ativo no dashboard e nas listas (DF-54).

#### Cenários das regras (11)

| Cenário | Dado | Quando | Então |
|---|---|---|---|
| **CN-03.1** | Contrato com vigência por prazo determinado, sem data de término | Ele vai para Ativo | Recusa, com mensagem |
| **CN-03.2** | Contrato por prazo indeterminado, com início em 01/02/2027 e sem término | Ele vai para Ativo | Aceita |
| **CN-03.3** | Contrato com início em 01/03/2027 | O término informado é 28/02/2027 | Recusa, com mensagem |
| **CN-04.1** | Contrato Ativo com término em 09/03/2027 | A vigência é consultada | Vigência Vencido, e o status do contrato continua Ativo |
| **CN-04.2** | Contratos Ativos com término em 09/04/2027 e em 10/04/2027 | A vigência é consultada | O primeiro, a 30 dias, está Próximo do vencimento; o segundo, a 31, está Vigente |
| **CN-04.3** | Contrato Ativo com término em 10/03/2027, hoje | A vigência é consultada | Próximo do vencimento, e não Vencido; vira Vencido em 11/03 |
| **CN-04.4** | Contrato Suspenso com término em 20/03/2027 | A vigência é consultada | Próximo do vencimento, com alerta |
| **CN-04.5** | Contrato Ativo por prazo indeterminado | A vigência é consultada | Vigente, sem dias restantes |
| **CN-04.6** | Um contrato em Proposta e um Encerrado | A vigência é consultada | O primeiro não tem status de vigência; o segundo está Encerrado |
| **CN-06.3** | Cliente com dois contratos | Os contratos são consultados | Cada contrato tem o seu código, e o CNPJ é o do cliente |
| **CN-24.2** | Um contrato Ativo | O Administrador procura a opção de inativar | Ela não existe; o contrato fecha por Encerrado ou Cancelado |

#### Fluxos alternativos (7)

Da seção 7.1 do PRD. O número depois do caso de uso é a ordem da linha na tabela dele.

| Fluxo | Situação | O que acontece | Regra |
|---|---|---|---|
| **UC-06.1** | Contrato vai para Ativo sem datas | Bloqueia; o término só fica vazio em Prazo indeterminado | CA-03.2, DF-68 (EC-12) |
| **UC-06.2** | Término antes do início | Recusa | CA-03.3 (EC-13) |
| **UC-06.3** | Prazo indeterminado ou renovação automática | Indeterminado: sem término e sem alerta. Renovação automática: o término é atualizado a cada renovação | DF-68 (EC-14) |
| **UC-06.4** | Mesmo código em dois clientes, como num consórcio | Permitido; o código é único por cliente | DF-47 (EC-15, EC-130) |
| **UC-06.5** | Mais de um serviço no contrato | Permitido, sem limite | DF-67 (EC-16) |
| **UC-06.7** | Responsável sem vínculo com o cliente | Não aparece na lista de escolha | DF-35 (EC-18) |
| **UC-06.9** | Vários contratos com o mesmo contratante | Um registro por contrato | [MVP §5] (EC-128) |

**Completado por:** E12, na parte do dashboard e dos alertas dos critérios de vencimento (CA-04.1, CA-04.5, CA-04.8 e CA-04.9).

---

### E5 · Listas oficiais e parâmetros

**Objetivo:** o Administrador mantém as listas oficiais e os parâmetros de operação na tela, sem mudar o sistema.

**Depende de:** E4 (as listas já precisam estar em uso para provar o bloqueio de exclusão).
**Base:** PRD, DF-01, DF-21, DF-22, DF-38, DF-46, DF-69, DF-81, Apêndice C; arquitetura, 4.3 (`lista_item`, `configuracao`).

**Construir:**

- Tela `/configuracoes/listas` ligada ao banco: incluir, renomear, ordenar, inativar e reativar itens de cada lista. Item em uso não é excluído (chave estrangeira restrita), só inativado; sai das novas escolhas e continua nos registros que o usam.
- Tela `/configuracoes/parametros` ligada ao banco: dias de "próxima do prazo" e do alerta de vencimento (inteiros de 1 a 90), remetente por finalidade (só endereços de elogovernance.com.br), referência de prazo por criticidade e o registro do início oficial da operação (DF-46).
- Telas só do Administrador, também no servidor.

#### Critérios de aceite (2)

- **CA-18.5** Um item de lista oficial já usado em registros não pode ser excluído. Ao ser inativado, sai das novas escolhas e continua aparecendo nos registros que o usam. O Administrador consulta os itens inativos e os reativa, sem perder vínculos nem histórico (RN-13, DF-38).
- **CA-18.6** Não é possível salvar dois itens com o mesmo nome na mesma lista oficial, sem diferenciar maiúsculas e acentos (DF-69).

#### Cenários das regras (1)

| Cenário | Dado | Quando | Então |
|---|---|---|---|
| **CN-13.4** | Serviço da lista oficial usado em contratos | O Administrador o inativa | O serviço some das novas escolhas e continua nos contratos que o usam |

#### Fluxos alternativos (2)

Da seção 7.1 do PRD. O número depois do caso de uso é a ordem da linha na tabela dele.

| Fluxo | Situação | O que acontece | Regra |
|---|---|---|---|
| **UC-03.1** | Excluir item de lista já usado | Não exclui; inativa. Some das novas escolhas e fica nos registros | DF-38 (EC-03) |
| **UC-03.2** | Renomear item de lista | O novo nome vale para todos os registros que usam o item | DF-01 (EC-03) |

**Completa também:** CA-01.2 (as telas de listas e de parâmetros fora do alcance da Equipe).

---

### E6 · Especialistas

**Objetivo:** o cadastro dos especialistas e das candidaturas, que a Central e os escopos vão usar.

**Depende de:** E1.
**Contrato:** 3.8 (cadastro de especialistas).
**Base:** PRD, F11, RN-14, DF-02, DF-27, DF-50, DF-65; arquitetura, 4.3 (`especialista`).

**Construir:**

- Tabela `especialista`, com origem, status, sinal de e-mail já cadastrado e consentimento (data, hora e versão do texto). Leitura por todos os usuários logados; gravação só do Administrador (DF-02).
- Telas de especialistas ligadas ao banco: lista com filtros de status e especialidade e o filtro de candidaturas, cadastro, edição, página do especialista com as outras candidaturas do mesmo e-mail, avaliação da candidatura (de Em análise para Ativo ou Inativo), inativação e reativação, só pelo Administrador.
- Os escopos e demandas do especialista aparecem na página dele a partir dos épicos E7 e E10.

#### Critérios de aceite (2)

- **CA-11.3** A lista filtra por status e especialidade.
- **CA-11.6** Na página de um especialista aparecem as outras candidaturas com o mesmo e-mail, com a data e o status (DF-50).

---

### E7 · Escopos, criticidade e Jornada ELO

**Objetivo:** o desdobramento do contrato em escopos, com a criticidade justificada e a Jornada ELO em 5 etapas.

**Depende de:** E4, E6.
**Contrato:** 3.4 (escopo com status, prioridade e criticidade), 3.5 (Jornada ELO aplicada ao escopo).
**Base:** PRD, F05, F06, RN-07, RN-08, RN-14, RN-21, RN-23, DF-08, DF-09, DF-24, DF-28, DF-45, DF-48, DF-49, DF-51, DF-57; arquitetura, 3.3 (`escopo_etapa_atual`), 4.3 (`escopo`, `escopo_especialista`, `etapa_jornada`), 5 (`mover_escopo`).

**Construir:**

- Tabelas `escopo`, `etapa_jornada` e `escopo_especialista`, com as regras da 4.3: justificativa da criticidade obrigatória, as 5 etapas criadas pelo banco em Não iniciada, Concluída com data, as bordas da DF-49 (ao menos uma etapa aplicável; etapa iniciada, concluída ou com documento não vira Não aplicável; só o Administrador reabre), só especialista Ativo no vínculo, escopo do ciclo anterior do mesmo cliente.
- Escrita do escopo e da criticidade só do Administrador; a Equipe vinculada atualiza o andamento das etapas, sem marcar Não aplicável (4.5).
- Visão `escopo_etapa_atual`: etapa atual pela RN-08 e progresso (Concluídas sobre aplicáveis).
- Função `mover_escopo` (DF-45): muda o escopo para outro contrato do mesmo cliente, com tudo o que está ligado, e registra.
- Gatilho do responsável com vínculo no escopo e na etapa. Gatilhos de transição do escopo e da etapa.
- Telas ligadas ao banco: lista de escopos com filtros (cliente, contrato, responsável, status, criticidade, prioridade, etapa atual), cadastro com o aviso da RN-21, página do escopo com a criticidade, a Jornada em cartões, especialistas e o histórico; reclassificar, concluir, cancelar, reabrir, mover e excluir.

#### Critérios de aceite (22)

- **CA-05.1** Não é possível salvar ou alterar a criticidade sem justificativa.
- **CA-05.2** Ao alterar a criticidade, o sistema atualiza a justificativa, o responsável e a data da última alteração [MVP §8].
- **CA-05.4** Um contrato pode ter escopos com criticidades diferentes.
- **CA-05.5** A lista de escopos filtra por cliente, contrato, responsável, status, criticidade e prioridade [MVP §25].
- **CA-05.6** O Administrador move um escopo para outro contrato do mesmo cliente, e tudo o que está ligado ao escopo passa a apontar para o novo contrato. A mudança fica registrada (DF-16).
- **CA-05.7** É possível criar escopos e planos de ação num contrato em Proposta ou Em contratação.
- **CA-05.8** Uma data prevista de conclusão do escopo depois do término da vigência do contrato mostra um aviso, e o usuário confirma para salvar (RN-21).
- **CA-05.9** Um escopo ou plano de ação de contrato em Proposta ou Em contratação aparece identificado como planejamento nas listas, na página do escopo e na Visão Executiva (DF-48).
- **CA-05.10** O escopo pode apontar para o escopo do ciclo anterior, do mesmo cliente, e cada um mostra o link para o outro (DF-57).
- **CA-06.1** Todo escopo novo nasce com as 5 etapas em "Não iniciada".
- **CA-06.2** É possível iniciar a Jornada em qualquer etapa e marcar etapas como "Não aplicável".
- **CA-06.3** Uma etapa Concluída exige data de conclusão.
- **CA-06.4** A etapa atual do escopo aparece na lista de escopos, no dashboard e na Visão Executiva.
- **CA-06.5** O usuário Equipe atualiza status, datas, observações e documentos das etapas nos clientes vinculados, mas não marca etapas como "Não aplicável" nem altera o escopo ou a criticidade.
- **CA-06.6** A etapa atual é calculada pela regra da RN-08 e muda sozinha quando o status de uma etapa muda; não é editável.
- **CA-06.7** Não é possível marcar como Não aplicável a última etapa aplicável do escopo.
- **CA-06.8** Uma etapa Em andamento, Concluída ou com documento vinculado não pode ser marcada como Não aplicável.
- **CA-06.9** Só o Administrador reabre uma etapa Concluída.
- **CA-06.10** O progresso da Jornada aparece junto da etapa atual, como etapas Concluídas sobre etapas aplicáveis, e muda sozinho quando o status de uma etapa muda; Não aplicável não conta (RN-08, DF-28).
- **CA-11.2** Só especialistas Ativos aparecem para vínculo em escopos e demandas.
- **CA-11.4** No especialista dá para ver os escopos e demandas a que ele está ou esteve vinculado. O usuário Equipe só vê os dos clientes vinculados a ele (RN-01, DF-02).
- **CA-11.5** Ao inativar um especialista com vínculos em escopos ou demandas abertos, os vínculos continuam e aparecem sinalizados nesses escopos e demandas.

**O que o protótipo não fazia e este épico faz de verdade:**

- CA-05.2: a atualização gravada.
- CA-05.6: os registros ligados apontando para o novo contrato, e o histórico.
- CA-06.1: a criação das etapas.

#### Cenários das regras (13)

| Cenário | Dado | Quando | Então |
|---|---|---|---|
| **CN-02.3** | O escopo E, com planos e uma demanda, no contrato C1 do cliente A | O Administrador move E para o contrato C2, também de A | Planos, atividades e demanda continuam ligados a E, agora em C2, e a mudança fica no registro de alterações |
| **CN-02.4** | O escopo E, no contrato C1 do cliente A | O Administrador tenta mover E para um contrato do cliente B | Os contratos de B não aparecem para escolha |
| **CN-07.1** | Um escopo | O Administrador define a criticidade Alta sem justificativa | Não salva |
| **CN-07.2** | Escopo com criticidade Alta | O Administrador muda para Crítica, com justificativa | Salva, e fica registrado quem mudou, quando, e os níveis anterior e novo |
| **CN-07.3** | Ana, num escopo do cliente A | Ela abre o escopo | Ela vê a criticidade, mas não consegue mudá-la |
| **CN-08.1** | Um escopo recém-criado | O escopo é aberto | As 5 etapas estão em Não iniciada, e a etapa atual é "Não iniciada" |
| **CN-08.2** | Diagnosticar Concluída, Estruturar Em andamento e Implementar Concluída | A etapa atual é calculada | A etapa atual é Estruturar |
| **CN-08.3** | Diagnosticar e Estruturar como Não aplicável | Implementar vai para Em andamento | Aceita, e a etapa atual é Implementar |
| **CN-08.4** | Quatro etapas Não aplicável | A última etapa aplicável é marcada como Não aplicável | Recusa |
| **CN-08.5** | Etapa com um documento ligado | Ela é marcada como Não aplicável | Recusa |
| **CN-08.6** | Uma etapa Concluída | Ana tenta reabrir; depois o Administrador reabre | Ana não consegue; o Administrador consegue |
| **CN-14.1** | Um especialista Em análise e um Inativo | Um escopo ou uma demanda vai receber um especialista | Nenhum dos dois aparece para vínculo |
| **CN-21.2** | Um contrato com término em 30/06/2027 e um por prazo indeterminado | Um escopo de cada um é salvo com conclusão prevista em 31/07/2027 | Os dois salvam; só o primeiro mostra o aviso e pede confirmação |

#### Fluxos alternativos (15)

Da seção 7.1 do PRD. O número depois do caso de uso é a ordem da linha na tabela dele.

| Fluxo | Situação | O que acontece | Regra |
|---|---|---|---|
| **UC-07.1** | Criticidade sem justificativa | Não salva | CA-05.1 (EC-19) |
| **UC-07.2** | Escopo no contrato errado, já com planos e demandas | O Administrador move o escopo para outro contrato do mesmo cliente, com tudo ligado a ele | DF-45 (EC-20) |
| **UC-07.3** | Contrato ainda em Proposta ou Em contratação | Aceita escopos e planos | DF-48 (EC-21) |
| **UC-07.4** | Conclusão prevista depois do fim da vigência | Aviso na tela, que o usuário confirma para salvar | RN-21 (EC-22) |
| **UC-07.5** | Reclassificação da criticidade | Fica registrado quem mudou, quando, e os níveis anterior e novo | CA-05.2, DF-16 (EC-23) |
| **UC-08.1** | Marcar todas as etapas como Não aplicável | Impedido; ao menos uma continua aplicável | DF-49 (EC-24, EC-95) |
| **UC-08.2** | Não aplicável em etapa já iniciada, concluída ou com documento | Impedido | DF-49 (EC-25) |
| **UC-08.3** | Começar direto em Implementar | Permitido | RN-08 (EC-26) |
| **UC-08.4** | Novo ciclo depois de Evoluir | É um novo escopo, que pode apontar para o do ciclo anterior | DF-57 (EC-27) |
| **UC-08.5** | Equipe tenta marcar Não aplicável ou reabrir etapa Concluída | Só o Administrador | CA-06.5, DF-49 (EC-56, EC-58) |
| **UC-08.6** | Etapa marcada Concluída sem data | Exige a data | CA-06.3 (EC-55) |
| **UC-08.7** | Etapa 4 concluída com a 2 em andamento | A etapa atual é a 2 | RN-08 (EC-57) |
| **UC-08.8** | Todas as etapas aplicáveis concluídas | A etapa atual é a última concluída, e o escopo pode ser concluído | RN-08, DF-08 (EC-96) |
| **UC-14.1** | Especialista Em análise ou Inativo | Não aparece para vínculo | CA-11.2 (EC-33) |
| **UC-14.2** | Especialista inativado com vínculo aberto | O vínculo fica, sinalizado para troca | DF-51 (EC-37) |

**Completa também:** CA-01.6 (responsável do escopo e da etapa).

---

### E8 · Planos de ação e atividades

**Objetivo:** planos e atividades com o atraso e a "próxima do prazo" calculados, e a lista "Minhas atividades".

**Depende de:** E7.
**Contrato:** 3.6 (planos de ação e atividades com identificação automática de atraso).
**Base:** PRD, F07, F08, RN-09, RN-10, RN-20, RN-21, DF-10, DF-43, DF-71; arquitetura, 3.3 (`atividade_situacao`), 4.3 (`plano`, `atividade`).

**Construir:**

- Tabelas `plano` e `atividade`, com cliente herdado (RN-02), prazo e prioridade obrigatórios, executor em texto, data de conclusão gravada pelo banco ao concluir e apagada ao reabrir.
- Visão `atividade_situacao`: Atrasada e "próxima do prazo", com o N da `configuracao` e a contagem pelo dia em Brasília (RN-20).
- Gatilhos do responsável com vínculo e de transição do plano e da atividade.
- Telas ligadas ao banco: página do plano com o total de atividades, as concluídas e as atrasadas; cadastro e edição do plano e da atividade com o aviso da RN-21; "Minhas atividades" com as atrasadas e as próximas do prazo no topo, filtros e exportação (a exportação é conferida no E15). Junte as leituras independentes da página do plano e da edição da atividade num `Promise.all` (pendência da revisão de código).
- Uma atividade não tem página própria: as alterações dela aparecem no histórico do plano, com o nome da atividade.

#### Critérios de aceite (10)

- **CA-07.1** Um escopo pode ter vários planos de ação.
- **CA-07.2** O plano mostra o total de atividades, as concluídas e as atrasadas.
- **CA-08.1** Uma atividade com prazo vencido e status diferente de Concluída ou Cancelada aparece como Atrasada, sem ação manual.
- **CA-08.2** Ao ser concluída, a atividade deixa de ser Atrasada.
- **CA-08.3** Uma atividade dentro da janela de "próxima do prazo" aparece destacada e entra nos alertas.
- **CA-08.4** O usuário Equipe vê uma lista "minhas atividades" com atrasadas e próximas do prazo no topo.
- **CA-08.5** A lista filtra por responsável, status, prazo e escopo [MVP §25].
- **CA-08.6** Ao marcar a atividade como Concluída, o sistema registra a data de conclusão, que aparece junto do prazo.
- **CA-08.7** Um prazo de atividade depois do prazo do plano ou do término da vigência do contrato mostra um aviso, e o usuário confirma para salvar (RN-21).
- **CA-08.8** O executor, quando informado, aparece na atividade, na lista de atividades e na Visão Executiva. Os alertas continuam indo para o responsável.

**O que o protótipo não fazia e este épico faz de verdade:**

- CA-08.6: a data gravada ao concluir.

#### Cenários das regras (11)

| Cenário | Dado | Quando | Então |
|---|---|---|---|
| **CN-02.1** | O escopo E, do contrato C, do cliente A | Um plano é criado em E | O plano fica com o cliente A, sem opção de escolher outro |
| **CN-09.1** | Atividade Em andamento com prazo em 09/03/2027 | O indicador é calculado | Atrasada |
| **CN-09.2** | Atividade Em andamento com prazo em 10/03/2027 | O indicador é calculado em 10/03 e em 11/03 | Em 10/03 não está atrasada; em 11/03 está |
| **CN-09.3** | Atividades com prazo em 09/03/2027, uma Concluída e uma Cancelada | O indicador é calculado | Nenhuma está atrasada |
| **CN-09.4** | Atividade nova com prazo em 05/03/2027 | Ela é salva | Nasce Atrasada |
| **CN-10.1** | Atividades abertas com prazo em 10/03, 15/03 e 16/03/2027 | O indicador é calculado | As duas primeiras estão próximas do prazo; a de 16/03 não |
| **CN-10.2** | Atividade aberta com prazo em 16/03/2027 | O Administrador muda "próxima do prazo" para 7 dias | Ela passa a estar próxima do prazo |
| **CN-19.1** | Bruno, da Equipe, sem vínculo com o cliente A | Alguém escolhe o responsável de uma atividade de A | Bruno não aparece; os Administradores e Ana aparecem |
| **CN-20.1** | Atividade com prazo em 10/03/2027 | O indicador é calculado às 22h de 10/03, no horário de Brasília, quando já é 11/03 em UTC | Não está atrasada; o atraso começa à 0h de 11/03, no horário de Brasília |
| **CN-21.1** | Plano com prazo em 31/03/2027 | Uma atividade dele é salva com prazo em 15/04/2027 | Mostra o aviso; confirmado, salva |
| **CN-22.2** | Atividade Concluída com data de conclusão gravada | O Administrador a reabre para Em andamento, com justificativa | Aceita, e a data de conclusão é apagada |

#### Fluxos alternativos (9)

Da seção 7.1 do PRD. O número depois do caso de uso é a ordem da linha na tabela dele.

| Fluxo | Situação | O que acontece | Regra |
|---|---|---|---|
| **UC-09.1** | Responsável sem vínculo com o cliente | Não aparece na lista | DF-35 (EC-28) |
| **UC-09.2** | Quem executa é de fora da ELO, como o próprio cliente | O responsável é da ELO, e o executor é informado por nome | DF-71 (EC-29) |
| **UC-09.3** | Prazo da atividade depois do prazo do plano ou da vigência | Aviso na tela, que o usuário confirma para salvar | RN-21 (EC-30) |
| **UC-09.4** | Prazo já no passado | A atividade nasce Atrasada | RN-09 (EC-31) |
| **UC-09.5** | Concluir plano com atividades abertas | Bloqueia e lista | RN-18 (EC-32) |
| **UC-10.1** | Atividade concluída com atraso | A data de conclusão é gravada sozinha | DF-43 (EC-74, EC-103) |
| **UC-10.2** | Cancelar atividade | Status final para a Equipe; só o Administrador reabre | RN-17 (EC-75) |
| **UC-10.3** | Prazo que vence hoje | Ainda está no prazo; vira atraso à 0h do dia seguinte, no horário de Brasília | RN-20 (EC-40, EC-82, EC-104) |
| **UC-10.4** | Atividade de contrato Suspenso | Os alertas continuam | DF-54 (EC-105) |

**Completa também:** CA-01.6 (responsável do plano e da atividade), CA-05.9 (plano de contrato em Proposta ou Em contratação identificado como planejamento).

---

### E9 · Avaliação de maturidade

**Objetivo:** guardar o resultado do diagnóstico de maturidade de cada cliente, com a comparação entre a avaliação inicial e a atual. É um item além do escopo contratado, incluído pela Result (PRD, Apêndice F).

**Depende de:** E4, E8.
**Base:** PRD, F20, RN-25, DF-78 a DF-80; arquitetura, 3.3 (`cliente_maturidade`), 4.3 (`avaliacao_maturidade`, `avaliacao_dimensao`).

**Construir:**

- Tabelas `avaliacao_maturidade` e `avaliacao_dimensao`: o banco cria uma linha por dimensão ativa ao criar a avaliação; média opcional de 1,00 a 5,00; nada é calculado (RN-25). Contrato de referência do mesmo cliente; avaliador com vínculo.
- Transições: a Equipe cria e edita Em elaboração; só o Administrador conclui e reabre; Concluída não é editada. Para concluir: nível em todas as dimensões, maturidade geral e prontidão.
- Visão `cliente_maturidade`: avaliação inicial e atual entre as Concluídas, pela data e, na mesma data, pela ordem de criação; dimensão que falta numa das duas aparece como Não avaliada; filtro opcional por contrato de referência.
- Plano de ação ligado à avaliação (coluna em `plano`).
- Telas ligadas ao banco: cadastro e edição, página da avaliação com concluir e reabrir, aba de maturidade na página do cliente.

#### Critérios de aceite (7)

- **CA-20.1** Não é possível salvar uma avaliação sem cliente, data, avaliador e status.
- **CA-20.2** Não é possível concluir uma avaliação sem o nível de todas as dimensões dela ("Não avaliada" vale), a maturidade geral e a prontidão.
- **CA-20.3** O contrato de referência só aceita contratos do mesmo cliente.
- **CA-20.4** A página do cliente lista as avaliações e mostra, por dimensão, o nível da avaliação inicial e o da atual.
- **CA-20.5** O usuário Equipe cria e edita avaliações Em elaboração dos clientes vinculados. Só o Administrador conclui e reabre.
- **CA-20.7** Um plano de ação ligado a uma avaliação aparece na página dela, com o total de atividades, as concluídas e as atrasadas.
- **CA-20.8** A média da dimensão, quando informada, só aceita valores de 1,00 a 5,00.

#### Cenários das regras (9)

| Cenário | Dado | Quando | Então |
|---|---|---|---|
| **CN-02.2** | Uma avaliação de maturidade do cliente A | O usuário escolhe o contrato de referência | Só aparecem contratos de A |
| **CN-17.2** | Uma avaliação de maturidade Concluída | Ana tenta editar um nível | Não consegue |
| **CN-19.2** | Uma avaliação de maturidade do cliente A | Alguém escolhe o avaliador | Só aparecem Administradores e usuários vinculados a A |
| **CN-25.1** | Cliente com avaliações Concluídas em 10/01/2027 e 10/07/2027 | A página do cliente é aberta | A inicial é a de janeiro, e a atual, a de julho |
| **CN-25.2** | Cliente com uma só avaliação Concluída | A página do cliente é aberta | Ela aparece como inicial e como atual |
| **CN-25.3** | Duas avaliações Concluídas com a mesma data | A página do cliente é aberta | A inicial é a criada primeiro |
| **CN-25.4** | Uma avaliação Concluída e uma Em elaboração mais recente | A página do cliente é aberta | A Em elaboração não conta: a Concluída é a inicial e a atual |
| **CN-25.6** | Uma dimensão com média 2,10 | O avaliador informa o nível Avançada | O sistema aceita, sem converter nem conferir |
| **CN-25.7** | Dimensão que existe na avaliação inicial e não existe na atual | A comparação é mostrada | Ela aparece como Não avaliada na atual |

#### Fluxos alternativos (9)

Da seção 7.1 do PRD. O número depois do caso de uso é a ordem da linha na tabela dele.

| Fluxo | Situação | O que acontece | Regra |
|---|---|---|---|
| **UC-22.1** | Concluir sem o nível de todas as dimensões, a maturidade geral ou a prontidão | Não conclui | CA-20.2 |
| **UC-22.2** | Equipe tenta concluir ou reabrir | Só o Administrador | CA-20.5, DF-79 |
| **UC-22.3** | Mudar uma avaliação Concluída | Não muda; continua recebendo planos e documentos ligados | RN-23 |
| **UC-22.4** | Cliente sem contrato assinado | A avaliação fica sem contrato de referência; o plano de desenvolvimento entra num contrato em Proposta | DF-48, DF-80 |
| **UC-22.5** | Contrato de referência de outro cliente | Não aparece na lista | CA-20.3 |
| **UC-22.6** | Duas avaliações concluídas na mesma data | Vale a ordem de criação para saber qual é a inicial e qual é a atual | RN-25 |
| **UC-22.7** | Média copiada não bate com o nível informado | O sistema aceita; não converte nem confere | RN-25 |
| **UC-22.8** | Média fora de 1,00 a 5,00 | Recusa | CA-20.8 |
| **UC-22.9** | Dimensão criada ou inativada depois | A avaliação existente mantém as dimensões dela; na comparação, a que falta aparece como Não avaliada | F20, DF-38 |

**Completa também:** CA-01.6 (avaliador com vínculo).

---

### E10 · Central ELO e notificação por e-mail

**Objetivo:** o ciclo completo das demandas: registro, triagem, atendimento, contato com especialistas, solução e retorno ao cliente, com o e-mail de nova demanda.

**Depende de:** E7.
**Contrato:** 3.7 (Central ELO com registro, triagem, direcionamento, acompanhamento e notificação automática por e-mail).
**Requisitos não funcionais:** RNF-15.
**Base:** PRD, F09, F10, RN-11, RN-12, RN-14, DF-11, DF-12, DF-21, DF-22, DF-29, DF-30, DF-32, DF-39 a DF-42, DF-46, DF-61; arquitetura, 3.4, 4.3 (`demanda`, `demanda_especialista`, `comentario`), 4.5 e 5.

**Construir:**

- Tabelas `demanda`, `demanda_especialista` e `comentario`, com as regras da 4.3: contrato e escopo do mesmo cliente; origem Institucional só no cadastro da ELO, e esse cadastro só com ela; com mais de um especialista, exatamente um principal; a Equipe não altera nem apaga comentários; o contato com especialista guarda o especialista e a data.
- Função `registrar_demanda` (numa transação: número ELO-AAAA-NNNN por ano, com trava na tabela de numeração, status Nova e data de abertura) e `clientes_para_registro` (só id e nome dos clientes Ativos), para a Equipe registrar demanda de cliente fora dos vínculos sem passar a vê-lo (DF-39).
- Gatilho de transição da demanda com as exigências de cada status (categoria, criticidade e responsável para Em atendimento; solução para Resolvida; retorno ao cliente para Encerrada; comentário para voltar de Resolvida) e quem pode encerrar (DF-61). A alteração do prazo vai para o histórico com o prazo anterior e o novo.
- **E-mail de nova demanda** (3.4): depois de gravar, o servidor envia pelo `lib/email` para o responsável pela triagem, o responsável pelo atendimento (se definido) e a caixa da Central, com o assunto e o conteúdo da F10, o link `/central/[numero]` e o remetente da finalidade na `configuracao`. Nada sai antes do início oficial da operação. Falha de envio não desfaz a demanda e vai para o `log_tecnico`.
- Na triagem, a referência de prazo da criticidade aparece ao lado do campo Prazo, que continua vazio (DF-22).
- Telas ligadas ao banco: fila com filtros (cliente, contrato, escopo, responsável, status, criticidade, período), nova demanda, página da demanda (triagem, atendimento, comentários, contato com especialista, solução, retorno, encerramento, "Corrigir status" do Administrador), edição. Corrija a leitura dos filtros vindos do endereço, que hoje aceita contrato ou escopo de outro cliente (pendência da revisão de código).

#### Critérios de aceite (19)

- **CA-09.1** Ao salvar uma demanda nova, o sistema gera o número, registra a data de abertura e o status "Nova".
- **CA-09.2** Não é possível passar para "Em atendimento" sem categoria, criticidade e responsável pelo atendimento.
- **CA-09.3** Não é possível marcar como "Resolvida" sem preencher a solução.
- **CA-09.4** Não é possível encerrar uma demanda Resolvida sem registrar o retorno ao cliente. Ao marcar como "Encerrada", o sistema registra a data de encerramento (RN-12, DF-29).
- **CA-09.6** Comentários mostram autor e data e não podem ser apagados por usuário Equipe.
- **CA-09.7** A lista filtra por cliente, contrato, escopo, responsável, status, criticidade e período [MVP §25].
- **CA-09.8** Só o responsável pelo atendimento ou o Administrador encerram a demanda; enquanto não há responsável pelo atendimento, o responsável pela triagem também encerra (DF-61). Ela pode ir de qualquer status aberto para "Encerrada" sem passar por "Resolvida", desde que a justificativa esteja no campo Solução.
- **CA-09.9** Um usuário Equipe registra uma demanda para um cliente Ativo fora dos seus vínculos, vendo só o nome do cliente; depois de salvar, não tem acesso a ela.
- **CA-09.10** Uma demanda em Aguardando retorno com prazo vencido continua nos alertas, e a alteração do prazo fica registrada com o prazo anterior e o novo, usuário, data e hora.
- **CA-09.11** Uma demanda Resolvida só volta para Em atendimento com um comentário que explique o motivo.
- **CA-09.12** Uma demanda aceita mais de um especialista Ativo. Com mais de um, é obrigatório indicar o principal (DF-32).
- **CA-09.13** O contato com um especialista fica registrado na demanda, com o especialista, a data do contato e o autor, e não aparece na Visão Executiva nem no PDF (DF-30, DF-52).
- **CA-09.14** Na triagem, ao escolher a criticidade, a tela mostra a referência de prazo cadastrada para ela, e o campo Prazo continua vazio até alguém preenchê-lo (DF-22).
- **CA-09.15** A origem "Institucional" só é aceita em demanda do cadastro da ELO, e esse cadastro só aceita demandas dessa origem (DF-40).
- **CA-10.1** Depois do início oficial da operação, ao criar uma demanda, o sistema dispara o e-mail para os destinatários definidos no mesmo momento (DF-46).
- **CA-10.2** O link abre a demanda após o login, respeitando as permissões.
- **CA-10.3** Uma falha de envio não impede o registro da demanda e fica registrada no log técnico.
- **CA-10.4** O Administrador altera o remetente de cada finalidade entre endereços do domínio elogovernance.com.br, e o próximo e-mail já sai com o novo endereço (DF-21).
- **CA-10.5** Antes do início oficial da operação, registrar uma demanda não dispara e-mail. Depois do início, dispara normalmente (DF-46).

**O que o protótipo não fazia e este épico faz de verdade:**

- CA-09.1: o número gerado e a gravação.
- CA-09.4: a data de encerramento gravada.
- CA-09.9: a demanda gravada e fora do alcance de quem registrou.
- CA-09.10: o prazo anterior e o novo no histórico.
- CA-09.13: o contato gravado.
- CA-10.1: o envio.
- CA-10.2: o link no e-mail.
- CA-10.4: o próximo e-mail com o novo remetente.
- CA-10.3: fora do protótipo, pelo próprio PRD.

#### Cenários das regras (15)

| Cenário | Dado | Quando | Então |
|---|---|---|---|
| **CN-01.3** | Ana, vinculada só ao cliente A, e o cliente B Ativo | Ela registra uma demanda para B, escolhendo B pelo nome | A demanda é gravada e Ana vê o número, mas B continua fora das buscas e das listas dela |
| **CN-01.4** | O cliente C, Inativo | Ana registra uma demanda | C não aparece na lista de clientes para registro |
| **CN-11.1** | Demanda com triagem para Ana e sem responsável pelo atendimento | A demanda é registrada | Ana e a caixa da Central recebem o e-mail de F10 |
| **CN-11.2** | O serviço de e-mail fora do ar | Uma demanda é registrada | A demanda fica gravada, com número, e a falha vai para o log técnico |
| **CN-11.3** | A última demanda de 2026 é ELO-2026-0042 | A primeira demanda de 2027 é registrada | Recebe o número ELO-2027-0001 |
| **CN-11.4** | Demanda já registrada | Um especialista é vinculado a ela na triagem | O especialista não recebe e-mail; o analista o aciona (DF-30) |
| **CN-11.5** | O início oficial da operação ainda não foi registrado | Uma demanda é registrada | A demanda fica gravada, com número, e nenhum e-mail sai |
| **CN-12.1** | Demanda Em atendimento | Ela vai para Resolvida sem o campo Solução | Recusa |
| **CN-12.2** | Demanda Resolvida | Ela é encerrada, com o retorno ao cliente registrado | Fica Encerrada, com a data de encerramento gravada |
| **CN-12.3** | Demanda Em triagem duplicada, sem responsável pelo atendimento | O responsável pela triagem a encerra, com a justificativa no campo Solução | Aceita |
| **CN-12.4** | Demanda Resolvida | Ana a volta para Em atendimento sem comentário; depois, com comentário | A primeira tentativa é recusada; a segunda é aceita |
| **CN-12.5** | Demanda Encerrada | Ana tenta reabrir | Não consegue; só o Administrador reabre |
| **CN-12.6** | Demanda Resolvida | Ela é encerrada sem o retorno ao cliente | Recusa |
| **CN-14.3** | Demanda com dois especialistas Ativos | Ela é salva sem indicar o principal; depois, indicando | A primeira tentativa é recusada; a segunda é aceita |
| **CN-22.1** | Demanda Em atendimento | O Administrador a volta para Em triagem, com justificativa | Aceita, desde que cumpra as exigências de Em triagem |

#### Fluxos alternativos (26)

Da seção 7.1 do PRD. O número depois do caso de uso é a ordem da linha na tabela dele.

| Fluxo | Situação | O que acontece | Regra |
|---|---|---|---|
| **UC-05.4** | Cliente sem nenhum usuário Equipe vinculado | Só o Administrador vê; a Equipe ainda registra demanda para ele pelo nome | RN-01, DF-39 (EC-10) |
| **UC-11.1** | Cliente fora dos vínculos de quem recebeu o pedido | A Equipe registra escolhendo o cliente Ativo pelo nome; a triagem fica com quem tem vínculo | DF-39 (EC-59, EC-131) |
| **UC-11.2** | Mesmo pedido por dois canais | Uma das demandas é encerrada como duplicada, com justificativa | RN-12, DF-29 (EC-60, EC-133) |
| **UC-11.3** | Demanda interna | Sempre sobre um cliente, que é obrigatório | DF-40 (EC-61) |
| **UC-11.4** | Demanda administrativa ou institucional da própria ELO | Origem Institucional, no cadastro da ELO como cliente; o acesso segue o vínculo com esse cadastro | DF-40, RN-01 |
| **UC-11.5** | Cliente Prospect, sem contrato | Só o cliente é obrigatório | DF-12 (EC-62) |
| **UC-11.6** | Escopo de outro cliente | Bloqueia | DF-12, RN-02 (EC-63) |
| **UC-11.7** | Falha no envio do e-mail | A demanda fica gravada, e a falha vai para o log técnico | RN-11, CA-10.3 (EC-97) |
| **UC-11.8** | Virada do ano | A numeração recomeça com o ano novo | DF-11 (EC-98) |
| **UC-11.9** | Especialista vinculado | Não recebe o e-mail; o analista o aciona | DF-30 (EC-100) |
| **UC-11.10** | Carga inicial | Só demandas abertas entram, e nenhum e-mail de demanda sai até o início oficial da operação | DF-46 (EC-101) |
| **UC-11.11** | Cliente fala direto com o especialista | Origem Especialista; a Central faz a ponte | F09 (EC-132) |
| **UC-12.1** | Falta campo obrigatório da triagem | A demanda não vai para Em atendimento | CA-09.2 (EC-64) |
| **UC-12.2** | Responsável pelo atendimento sem vínculo com o cliente | Não aparece na lista | DF-35 (EC-66) |
| **UC-12.3** | Responsável pelo atendimento definido só na triagem | Não recebe e-mail; a demanda aparece na fila dele | F10 (EC-67, EC-83) |
| **UC-12.5** | A demanda precisa de duas especialidades | Vincula os dois especialistas e indica o principal | DF-32 (EC-34) |
| **UC-12.6** | Especialista Em análise ou Inativo | Não aparece para vínculo | CA-11.2 (EC-33) |
| **UC-12.7** | Nenhum especialista Ativo na especialidade | Segue sem especialista; o campo é opcional | F09 (EC-36) |
| **UC-12.8** | O especialista precisa do contexto da demanda | O analista repassa o recorte necessário pelo canal dele; o especialista não acessa a plataforma | DF-30, RNF-06 (EC-118) |
| **UC-13.1** | Prazo vence enquanto aguarda o cliente ou o especialista | O alerta continua; o analista ajusta o prazo, e a mudança fica registrada | DF-41 (EC-69, EC-121) |
| **UC-13.2** | Cliente diz que não resolveu | Resolvida volta para Em atendimento, com comentário obrigatório | DF-42 (EC-70, EC-134) |
| **UC-13.3** | Reabrir demanda Encerrada | Só o Administrador, que escolhe o status de volta e justifica | RN-17, RN-22 (EC-71) |
| **UC-13.4** | Comentário errado | A Equipe não altera nem apaga | CA-09.6 (EC-72) |
| **UC-13.5** | Duplicada ou desistência | Encerra sem resolver, com justificativa; sem atendente, quem fez a triagem também encerra | CA-09.8, DF-61 (EC-73) |
| **UC-13.6** | Retorno ao cliente dado fora da plataforma | Quem encerra registra o retorno dado; sem ele, a demanda Resolvida não encerra | RN-12, DF-29 (EC-135) |
| **UC-13.7** | Especialista recusa | Troca o vínculo; fica registrado quem mudou, quando, e os especialistas anterior e novo | DF-16, DF-32 (EC-35, EC-119) |

**Completa também:** CA-01.6 (responsáveis pela triagem e pelo atendimento), CA-11.2, CA-11.4 e CA-11.5 (a parte das demandas).

---

### E11 · Documentos e evidências

**Objetivo:** a área documental: arquivos com categoria, status, versões e vínculo a qualquer registro, com acesso pelo perfil e pelo vínculo.

**Depende de:** E4, E7, E8, E9, E10.
**Contrato:** 3.9 (organização documental com categorias, status e vínculo a escopos, atividades e demandas).
**Base:** PRD, F12, RN-15, RN-16, RN-24, DF-13, DF-44, DF-63, DF-65, DF-72; arquitetura, 4.3 (`documento`), 4.5, 5 e 7.

**Construir:**

- Tabela `documento`, com as regras da 4.3: cliente obrigatório, exceto em Documento do Especialista, que exige o especialista; Superado exige o substituto; vínculos opcionais do mesmo cliente; sinal de inativo separado do status. Documento principal do contrato.
- Storage com bucket privado. **Envio direto ao Storage:** como a Vercel recusa requisições acima de 4,5 MB e o limite da plataforma é 10 MB, o servidor confere o acesso e devolve um link de envio assinado; o navegador envia o arquivo direto ao Storage; depois, o servidor confere tipo e tamanho do objeto (DF-72), higieniza o nome e só então grava o documento. Arquivo recusado é apagado.
- Download pela rota `GET /api/documentos/[id]/arquivo`: confere o acesso à linha com a sessão do usuário e redireciona para um link temporário de poucos segundos (RN-16).
- Política do Documento do Especialista sem cliente: todos os logados leem e baixam, só o Administrador grava (DF-65).
- Telas ligadas ao banco: lista, inclusão e nova versão, página, edição, status, inativação e exclusão; os painéis de documentos de cliente, contrato, escopo, etapa, plano, atividade, demanda, especialista e avaliação.

#### Critérios de aceite (7)

- **CA-03.4** Incluir um aditivo ou anexo não cria um novo contrato e aparece na lista de documentos do contrato.
- **CA-12.1** Não é possível salvar um documento sem nome, categoria, cliente, data e arquivo. Em Documento do Especialista, o especialista é obrigatório e o cliente é opcional (DF-65).
- **CA-12.2** Um arquivo fora dos formatos ou do tamanho permitidos é recusado com mensagem clara.
- **CA-12.3** Um documento vinculado a escopo, etapa, plano, atividade, demanda, especialista ou avaliação de maturidade aparece na tela de cada um desses registros.
- **CA-12.4** Não é possível marcar um documento como Superado sem indicar o documento que o substitui, e os dois ficam ligados (RN-15, DF-63).
- **CA-12.5** Um usuário Equipe não vê nem baixa documento de cliente ou escopo fora dos seus vínculos.
- **CA-12.6** Só o Administrador altera status e inativa documentos. Exceção: ao incluir um documento como substituto de outro, o usuário Equipe marca o anterior como Superado, e os dois ficam ligados (DF-44).

#### Cenários das regras (4)

| Cenário | Dado | Quando | Então |
|---|---|---|---|
| **CN-15.1** | Um documento Vigente | Ele é marcado como Superado sem indicar o substituto | Recusa |
| **CN-15.2** | Documento Superado | Ele é aberto | Continua consultável, com o link para o documento que o substituiu |
| **CN-16.1** | Documento do cliente B | Ana tenta abrir o link de download | Acesso negado |
| **CN-16.2** | Documento do Especialista sem cliente | Ana abre e baixa o documento, depois tenta alterá-lo | Ela consegue abrir e baixar, mas não alterar |

#### Fluxos alternativos (6)

Da seção 7.1 do PRD. O número depois do caso de uso é a ordem da linha na tabela dele.

| Fluxo | Situação | O que acontece | Regra |
|---|---|---|---|
| **UC-06.8** | Aditivo ou anexo entregue junto | Vira documento do contrato, sem criar contrato novo | CA-03.4 (EC-129) |
| **UC-06.11** | Aditivo chega depois do vencimento | O contrato segue Ativo, com vigência Vencido, até o Administrador prorrogar | DF-25 (EC-44) |
| **UC-15.1** | Arquivo fora do formato ou do tamanho | Recusa, com mensagem | CA-12.2, DF-72 (EC-77) |
| **UC-15.2** | Nova versão de um documento | A Equipe marca o anterior como Superado ao enviar o substituto, que fica ligado a ele | DF-44, DF-63 (EC-79) |
| **UC-15.3** | Arquivo errado | A Equipe não exclui; pede ao Administrador | CA-18.1 (EC-80) |
| **UC-15.4** | Parecer com dado sensível do cliente | Acesso por vínculo, sem permissão por documento | RN-16 (EC-122) |

**Completa também:** CA-06.5 (a Equipe vincula documentos às etapas), CA-06.8 (etapa com documento não vira Não aplicável).

---

### E12 · Início: dashboard e alertas

**Objetivo:** a tela de Início com os números da carteira e os alertas internos, todos calculados na consulta e restritos aos vínculos de quem vê.

**Depende de:** E4, E6, E7, E8, E10.
**Contrato:** 3.10 (dashboard operacional) e a parte de alerta de 3.3.
**Base:** PRD, F13, F15, RN-05, RN-09, RN-10, RN-14, DF-15, DF-25, DF-34, DF-40, DF-46, DF-51, DF-54; arquitetura, 3.3 (`alerta`).

**Construir:**

- Visão `alerta`: a união dos 8 tipos de alerta do F15, com a criticidade do item quando existe, já filtrada pelas políticas de acesso e vazia até o início oficial da operação. Ordenada da maior para a menor criticidade. Some sozinho quando a condição deixa de existir.
- Números do Início lidos das mesmas consultas das listas, para baterem com elas (CA-13.1), e cada número abrindo a lista com o filtro aplicado. O cadastro da ELO fica fora do total de clientes ativos.
- Tela `/inicio` ligada ao banco.

#### Critérios de aceite (13)

- **CA-05.3** Um escopo com criticidade Crítica entra nos alertas [MVP §24].
- **CA-09.5** Uma demanda com prazo vencido e não resolvida, ou com criticidade Crítica, entra nos alertas [MVP §24].
- **CA-13.1** Os números do dashboard batem com as listas filtradas correspondentes.
- **CA-13.2** O usuário Equipe vê números calculados só sobre os seus vínculos.
- **CA-13.3** Clicar num indicador abre a lista com o filtro aplicado.
- **CA-13.4** O total de clientes ativos e a lista aberta por ele não incluem o cadastro da ELO (DF-40).
- **CA-15.1** Cada alerta leva ao registro que o originou.
- **CA-15.2** O alerta some sozinho quando a condição deixa de existir.
- **CA-15.3** O usuário Equipe só vê alertas dos seus vínculos e responsabilidades.
- **CA-15.4** Uma atividade ou demanda com prazo hoje não aparece como atrasada ou vencida. Passa a aparecer a partir da 0h do dia seguinte, no horário de Brasília.
- **CA-15.5** Os alertas mostram a criticidade do item, quando ela existe, e a lista vem ordenada da maior para a menor criticidade (DF-15).
- **CA-15.6** Um especialista inativado com vínculo em escopo ou demanda aberta gera um alerta para o responsável, que some quando o vínculo é trocado (DF-51).
- **CA-15.7** Antes do início oficial da operação, os alertas não aparecem. Depois do início, aparecem normalmente, com a situação real da carteira (DF-46).

#### Cenários das regras (5)

| Cenário | Dado | Quando | Então |
|---|---|---|---|
| **CN-05.1** | Contrato Ativo com término em 09/04/2027 | Um usuário com acesso abre o dashboard | O alerta de vencimento aparece |
| **CN-05.2** | Contrato Ativo com término em 19/04/2027, a 40 dias | O Administrador muda o alerta de vencimento para 45 dias | O contrato passa a ter alerta |
| **CN-05.3** | Contrato Ativo por prazo indeterminado | A qualquer momento | Nunca gera alerta de vencimento |
| **CN-05.4** | Contrato Ativo com término em 09/03/2027 | Um usuário com acesso abre o dashboard | O alerta de contrato vencido aparece, e o contrato continua Ativo |
| **CN-14.2** | Especialista vinculado a uma demanda aberta | O Administrador o inativa | Aceita, o vínculo na demanda aparece sinalizado para troca, e o responsável recebe um alerta até a troca |

#### Fluxos alternativos (10)

Da seção 7.1 do PRD. O número depois do caso de uso é a ordem da linha na tabela dele.

| Fluxo | Situação | O que acontece | Regra |
|---|---|---|---|
| **UC-04.3** | Inativar especialista com escopo ou demanda aberta | Permitido; os vínculos abertos ficam, sinalizados para troca e com alerta para o responsável | DF-51 (EC-06) |
| **UC-06.6** | Contrato cadastrado já vencido | Entra com vigência Vencido; o alerta aparece depois do início oficial da operação | DF-46 (EC-17) |
| **UC-06.10** | Contrato com menos de 30 dias de duração | Entra no alerta de vencimento desde o início | RN-05 (EC-91) |
| **UC-12.4** | Prazo informado no passado | A demanda já entra como vencida | F15 (EC-68) |
| **UC-12.9** | O analista esquece de acionar o especialista | Só o prazo da demanda gera alerta | F15 (EC-120) |
| **UC-16.1** | Primeiro dia depois da carga inicial | Os alertas só aparecem depois do início oficial da operação, com a carteira já conferida | DF-46 (EC-38) |
| **UC-16.2** | Clientes Prospect e Inativo | Ficam fora do total de clientes ativos | F13 (EC-39) |
| **UC-16.3** | Contrato Suspenso | Continua gerando alertas | DF-54 (EC-41) |
| **UC-16.5** | Mudar o prazo para apagar o atraso | Fica registrado quem mudou, quando, e os prazos anterior e novo | DF-16 (EC-43) |
| **UC-16.6** | Registros inativos | Ficam fora dos números padrão | CA-18.2 (EC-107) |

**Completa também:** CA-04.1, CA-04.5, CA-04.8 e CA-04.9 (vencimento no dashboard e nos alertas), CA-06.4 (etapa atual no dashboard), CA-08.3 (atividade próxima do prazo nos alertas), CA-09.10 (demanda aguardando retorno com prazo vencido nos alertas).

---

### E13 · Visão Executiva e PDF

**Objetivo:** a visão por cliente para apresentar em reunião e o PDF, com dados sempre atuais e sem nada interno.

**Depende de:** E4, E7, E8, E9, E10.
**Contrato:** 3.11 (Visão Executiva do Cliente com relatório resumido em PDF).
**Requisitos não funcionais:** RNF-06, RNF-08 (PDF em até 10 segundos), RNF-09 (projeção em 1920×1080).
**Base:** PRD, F14, RN-25, DF-52, DF-71, DF-73, DF-74, DF-82; arquitetura, 3.5, 4.3 (`visao_executiva_texto`) e 5.

**Construir:**

- Uma consulta única para a tela e o PDF que **não traz do banco** o que nunca aparece: valor do contrato, observações internas (inclusive as da avaliação), comentários, justificativa da criticidade e dados de especialistas. O executor da atividade aparece. Filtro opcional por contrato, que vale também para a maturidade.
- Tabela `visao_executiva_texto`: "Principais resultados", "Observações executivas" e "Próximos passos", com a data e o autor da última atualização; as versões anteriores vão para o histórico e não aparecem na tela nem no PDF.
- Rota `GET /api/visao-executiva/[cliente]/pdf` ligada à mesma consulta, com vínculo exigido, em até 10 segundos.
- Os números do PDF hoje saem na Helvetica; devem sair na JetBrains Mono, como na tela (pendência do protótipo).
- O tamanho máximo dos três textos está em aberto, para decisão do Jonathan (pendência da revisão de código). Pergunte antes de limitar.

#### Critérios de aceite (8)

- **CA-14.1** Ao escolher um cliente, a Visão Executiva mostra todos os blocos com dados atuais, sem montagem manual.
- **CA-14.2** A tela é legível em projeção (1920×1080) em modo de tela cheia.
- **CA-14.3** O PDF gerado reproduz os blocos da DF-74, com o nome do cliente, a data de emissão, a data da última atualização dos textos da Visão Executiva e a identidade visual da ELO.
- **CA-14.4** O usuário Equipe só gera a Visão Executiva dos clientes vinculados.
- **CA-14.5** A Visão Executiva e o PDF não mostram valor do contrato, observações internas, comentários de demandas, justificativa da criticidade nem dados de especialistas.
- **CA-14.6** A Visão Executiva e o PDF podem ser filtrados por um contrato do cliente.
- **CA-14.7** O Administrador e a Equipe vinculada editam "Principais resultados", "Observações executivas" e "Próximos passos" do cliente, e a tela mostra quem atualizou por último e quando.
- **CA-20.6** A Visão Executiva e o PDF mostram a avaliação inicial e a atual, com o nível por dimensão, a maturidade geral e a prontidão. Não mostram avaliações Em elaboração nem observações internas. Com filtro por contrato, contam só as avaliações com esse contrato de referência.

**O que o protótipo não fazia e este épico faz de verdade:**

- CA-14.7: o texto gravado e a versão anterior no histórico.

#### Cenários das regras (1)

| Cenário | Dado | Quando | Então |
|---|---|---|---|
| **CN-25.5** | Avaliações com o contrato C1 e com o C2 de referência | A Visão Executiva é filtrada por C1 | Contam só as avaliações com C1 |

#### Fluxos alternativos (6)

Da seção 7.1 do PRD. O número depois do caso de uso é a ordem da linha na tabela dele.

| Fluxo | Situação | O que acontece | Regra |
|---|---|---|---|
| **UC-18.1** | Apresentação aos fornecedores do cliente ou PDF entregue a ele | Nunca mostra valor do contrato, observações internas, comentários, justificativa da criticidade nem dados de especialistas | DF-52 (EC-45, EC-86, EC-109, EC-138) |
| **UC-18.2** | Cliente com vários contratos | Filtro por contrato, que vale também para a maturidade | DF-52, RN-25 (EC-46, EC-110) |
| **UC-18.3** | Cliente fora dos vínculos | Não gera a visão nem o PDF | CA-14.4 (EC-84, EC-108) |
| **UC-18.4** | Cliente ainda sem dados | Estados vazios, definidos depois do protótipo | DT-03 (EC-48) |
| **UC-18.5** | Cliente com muitos escopos | PDF em até 10 segundos, como diretriz | RNF-08 (EC-111) |
| **UC-18.6** | Cliente pede o indicador de maturidade | Aparece no bloco de maturidade, com a avaliação inicial e a atual | F20, CA-20.6 (EC-139) |

**Completa também:** CA-05.9 (escopo e plano de planejamento identificados na Visão Executiva), CA-06.4 (etapa atual), CA-08.8 (executor), CA-09.13 (contato com especialista fora da Visão Executiva e do PDF).

**Verificação manual:** CA-14.2 tem teste de ponta a ponta em 1920×1080, em tela cheia, sem rolagem horizontal nem texto cortado, e a legibilidade é conferida em projeção, com registro em `testes/verificacoes-manuais.md`.

---

### E14 · Formulários e página do site

**Objetivo:** os dois formulários públicos que alimentam a plataforma a partir do site, e o redesenho da página do site com imagens da plataforma pronta.

**Depende de:** E2, E6, E10.
**Requisitos não funcionais:** RNF-05 (consentimento).
**Base:** PRD, F19, DF-19, DF-50, DF-56, DF-76, Apêndice E; arquitetura, 3.6, 5 (`/api/publico/*`), 7 e 8 (redesenho da página).

**Construir:**

- Rotas públicas `POST /api/publico/especialista` e `POST /api/publico/diagnostico`, com o Turnstile, o campo armadilha e o limite de envios por IP **num armazenamento comum** (uma tabela no banco; o limite em memória do protótipo não vale entre funções da Vercel). Validação no servidor; gravação pela chave de serviço, só nesses pontos (arquitetura, 3.1).
- Consentimento gravado com data, hora e a versão do texto do Apêndice E.
- Candidatura: cria o especialista Em análise, origem Site; e-mail já cadastrado cria registro novo marcado, sem tocar no existente.
- Diagnóstico: cria o cliente Prospect com os campos da DF-76 e avisa a caixa da Central pelo `lib/email`; CNPJ já cadastrado não duplica, acrescenta o pedido às observações e manda o pedido completo à Central. A confirmação na tela é a mesma nos dois casos (DF-56).
- O teste do limitador de envios, que ficou sem teste próprio no protótipo (`lib/site/protecao.ts`).
- **Página do site (CA-19.5):** na parte final do desenvolvimento, com imagens da plataforma pronta, na mesma stack do site. A Result entrega a página pronta ao Osvaldo, que a publica; o formato da entrega é combinado com ele.

#### Critérios de aceite (7)

- **CA-11.1** Uma candidatura enviada pelo site aparece na lista de especialistas com status "Em análise" e origem "Site".
- **CA-19.1** O envio do formulário de especialista cria o registro em F11 com status "Em análise" e confirma o recebimento na tela.
- **CA-19.2** O formulário só é enviado com aceite do aviso e do consentimento.
- **CA-19.3** O envio do formulário de diagnóstico cria o cliente Prospect com os dados do formulário, envia o aviso à Central e mostra a confirmação na tela. Com CNPJ já cadastrado, não cria cliente, acrescenta o pedido às observações do cliente, envia todos os dados à Central e mostra a mesma confirmação (DF-56, DF-76).
- **CA-19.4** Os formulários têm proteção contra envio automatizado (spam).
- **CA-19.5** A página do site institucional é redesenhada e publicada na fase final, com imagens da plataforma, e aprovada pela Cleo.
- **CA-19.6** Uma candidatura com e-mail já cadastrado cria um registro novo marcado "e-mail já cadastrado" e não altera o cadastro existente.

**O que o protótipo não fazia e este épico faz de verdade:**

- CA-11.1: o registro criado pelo formulário.
- CA-19.1: o registro criado em Em análise.
- CA-19.3: o cliente Prospect criado e o aviso à Central.
- CA-19.6: o registro novo marcado.
- CA-19.5: fora do protótipo, pelo próprio PRD.

#### Fluxos alternativos (9)

Da seção 7.1 do PRD. O número depois do caso de uso é a ordem da linha na tabela dele.

| Fluxo | Situação | O que acontece | Regra |
|---|---|---|---|
| **UC-04.1** | Candidatura com e-mail já cadastrado | Entra como candidatura nova, marcada "e-mail já cadastrado"; o cadastro existente não muda, e a Equipe consulta as candidaturas anteriores | DF-50 (EC-05) |
| **UC-05.3** | Pedido de diagnóstico de quem já é cliente | Não cria cliente; o pedido fica nas observações do cliente e vai por completo à Central | DF-56, DF-76 (EC-09) |
| **UC-20.1** | Envio automatizado | Descartado | CA-19.4 (EC-123) |
| **UC-20.2** | Sem o consentimento LGPD | Não envia | CA-19.2, RNF-05 (EC-124) |
| **UC-20.3** | CNPJ inválido ou de empresa já cadastrada | Inválido: recusa no formulário. Já cadastrado: não cria cliente, guarda o pedido nas observações e envia os dados à Central | DF-56, DF-76 (EC-126) |
| **UC-21.1** | Sem o aceite do aviso ou do consentimento | Não envia | CA-19.2 (EC-113) |
| **UC-21.2** | Envio automatizado | Descartado | CA-19.4 (EC-114) |
| **UC-21.3** | Quer mandar o currículo em arquivo | Só por link; os arquivos do especialista são anexados pelo Administrador | DF-27, DF-65 (EC-115) |
| **UC-21.4** | Envia de novo para atualizar os dados | Entra como candidatura nova, marcada; não sobrescreve | DF-50 (EC-116) |

**Completa também:** CA-11.6 (as candidaturas com o mesmo e-mail, agora criadas pelo formulário).

**Verificação manual:** CA-19.5 é provado pela publicação e pela aprovação da Cleo, registradas em `testes/verificacoes-manuais.md`.

---

### E15 · Regras transversais

**Objetivo:** fechar as regras que valem para todas as entidades e provar que nenhuma ficou de fora: segregação, histórico, fechamento com itens abertos, inativação, exclusão definitiva, busca, filtros e exportação.

**Depende de:** E1 a E14.
**Contrato:** 3.14 (segregação lógica das informações), 3.17 (rastreabilidade de criação e alteração).
**Requisitos não funcionais:** RNF-02, RNF-07, RNF-09 (consulta pelo celular).
**Base:** PRD, F16, F17, F18, RN-01, RN-13, RN-17, RN-18, RN-22 a RN-24, DF-16, DF-17, DF-26, DF-33, DF-36, DF-59, DF-64, DF-75; arquitetura, 3.7, 4.4, 4.5 e 5.

**Construir:**

- Conferir o registro de entidades contra o PRD: todas as entidades da seção 6.1 estão lá, e as suítes de segregação (CA-01.1), histórico (CA-17) e fechamento, inativação e exclusão (CA-18) passam para cada uma.
- **Matriz de segregação (CA-01.1):** para cada tipo de registro (cliente, contrato, escopo, demanda, documento, avaliação), Ana não vê o do cliente B por lista, busca, link direto, exportação, PDF, download nem alerta, e a recusa vem do servidor.
- Função `itens_abertos` completa (tipo, status, responsável e link de cada item) para cliente, contrato, escopo, plano, usuário e vínculo, e `redistribuir_itens` (DF-36), com a tela de troca de responsável em Configurações.
- Função `excluir_definitivo` (registro sem nada ligado, com justificativa e gravação no `log_tecnico`) e a ausência da opção para a Equipe.
- Reabertura e correção de status com justificativa no histórico (RN-22), em todas as entidades com status.
- **Busca rápida:** cliente pelo nome ou nome fantasia e contrato pelo número, sem acento e por semelhança (extensões `unaccent` e `pg_trgm`).
- **Filtros:** combinados e mantidos ao voltar para a lista, inclusive pelo botão Voltar do navegador (pendência da revisão de código).
- **Exportação:** `GET /api/exportar/[lista]` em CSV para clientes, contratos, atividades e demandas, só do Administrador, com os filtros aplicados e a sessão do usuário.
- `lib/dados/mock/` apagado, sem nenhuma importação restante.

#### Critérios de aceite (14)

- **CA-01.1** Um usuário Equipe não vê, nem por busca nem por link direto, cliente, contrato, escopo, demanda, documento ou avaliação de maturidade fora dos seus vínculos. A única exceção é o nome dos clientes Ativos, ao registrar uma demanda (RN-01, DF-39).
- **CA-01.7** Ao tentar inativar um usuário, ou tirar o vínculo dele com um cliente, enquanto ele é responsável por itens abertos, o sistema impede a ação e lista esses itens.
- **CA-01.9** Na lista de itens abertos de um usuário, o Administrador escolhe um ou mais itens e um novo responsável com vínculo ao cliente, e a troca fica registrada (DF-16, DF-36).
- **CA-16.1** A busca encontra o cliente pelo nome ou nome fantasia e o contrato pelo número.
- **CA-16.2** Os filtros podem ser combinados e são mantidos ao voltar para a lista.
- **CA-16.3** O Administrador exporta as listas de clientes, contratos, atividades e demandas, e a exportação respeita os filtros aplicados. O usuário Equipe não vê a opção de exportar.
- **CA-17.1** Todo registro mostra quem criou e quando, e quem alterou por último e quando.
- **CA-17.2** As alterações relevantes (DF-16) ficam registradas automaticamente, com usuário, data e hora.
- **CA-17.3** O painel de histórico do registro é uma lista só de leitura, da alteração mais recente para a mais antiga, e mostra, para cada alteração relevante, o valor anterior, o novo, o usuário, a data e a hora. Nenhum usuário edita ou apaga o histórico pela plataforma (DF-16).
- **CA-17.4** Reabrir um status final, ou corrigir um status fora das transições da seção 6.1, exige justificativa, que fica no histórico com o status anterior e o novo (RN-22, DF-17, DF-64).
- **CA-18.1** Não há opção de excluir registros com histórico para o perfil Equipe.
- **CA-18.2** Um registro inativado sai das listas padrão, mas aparece com o filtro "inativos" e continua no histórico.
- **CA-18.3** Ao tentar encerrar, cancelar ou inativar um registro com itens abertos ligados a ele, o sistema impede a ação e lista os itens que precisam ser tratados, com tipo, status, responsável e link para cada um (RN-18, DF-26).
- **CA-18.4** O Administrador exclui definitivamente um registro sem nada ligado a ele, depois de confirmar e escrever a justificativa, e a exclusão fica no log técnico, com usuário, data e justificativa; em registros com itens ligados, a opção de excluir não aparece (RN-13, DF-33).

**O que o protótipo não fazia e este épico faz de verdade:**

- CA-01.9: a troca gravada e no histórico.
- CA-17.2: o registro automático.
- CA-18.4: a exclusão e o log técnico.

#### Cenários das regras (16)

| Cenário | Dado | Quando | Então |
|---|---|---|---|
| **CN-01.1** | Ana, vinculada só ao cliente A | Ela busca o cliente B pelo nome ou abre o link direto de um contrato de B | B não aparece na busca, e o link mostra acesso negado |
| **CN-01.2** | Ana, vinculada só ao cliente A | Ela abre o dashboard, a lista de demandas ou a Visão Executiva | Só aparecem dados de A |
| **CN-13.1** | Ana, num documento do cliente A | Ela procura a opção de excluir | A opção não existe para ela |
| **CN-13.2** | Contrato criado por engano, sem nada ligado | O Administrador confirma e justifica a exclusão | O contrato some e a exclusão fica no log técnico, com usuário, data e justificativa |
| **CN-13.3** | Contrato com um documento ligado | O Administrador abre o contrato | A opção de excluir não aparece |
| **CN-13.5** | Contrato criado por engano, sem nada ligado | O Administrador tenta excluir sem justificativa | Não exclui |
| **CN-17.1** | Um plano Concluído | Ana tenta reabrir; depois o Administrador reabre, com justificativa | Ana não consegue; o Administrador reabre e escolhe o status de volta, e o histórico guarda a justificativa e os status anterior e novo |
| **CN-17.3** | Um plano Concluído | O Administrador tenta reabrir sem justificativa | Recusa |
| **CN-18.1** | Contrato com um escopo Em andamento e uma demanda Em atendimento | O Administrador tenta encerrar o contrato | Bloqueia e lista os dois itens, com tipo, status, responsável e link para cada um |
| **CN-18.2** | Escopo com uma etapa da Jornada Em andamento | O Administrador tenta concluir o escopo | Bloqueia e lista a etapa |
| **CN-18.3** | Cliente com uma avaliação de maturidade Em elaboração | O Administrador tenta inativar o cliente | Bloqueia e lista a avaliação |
| **CN-18.4** | Ana, responsável por uma atividade aberta do cliente A | O Administrador tenta inativar Ana ou tirar o vínculo dela com A | Bloqueia e lista a atividade |
| **CN-23.1** | Contrato Encerrado | Alguém tenta criar um escopo nele; depois liga um aditivo e uma demanda | O escopo é recusado; o aditivo e a demanda são aceitos |
| **CN-23.2** | Avaliação de maturidade Concluída | Um plano de ação e um documento são ligados a ela | Aceita, e os níveis continuam iguais |
| **CN-23.3** | Escopo Concluído | Alguém tenta mudar uma etapa da Jornada dele | Recusa |
| **CN-24.1** | Cliente Inativo | A lista padrão de clientes é aberta, depois filtrada por Inativo | Ele não aparece na lista padrão e aparece no filtro, com o histórico consultável |

#### Fluxos alternativos (10)

Da seção 7.1 do PRD. O número depois do caso de uso é a ordem da linha na tabela dele.

| Fluxo | Situação | O que acontece | Regra |
|---|---|---|---|
| **UC-01.4** | Equipe abre o link direto de um registro fora dos vínculos | Acesso negado, no servidor e não só na tela | RN-01, RNF-02 (EC-53, EC-88) |
| **UC-01.6** | Link de um e-mail aberto por quem não tem vínculo | Acesso negado; os destinatários dos e-mails sempre têm vínculo | RN-01, DF-35 (EC-89, EC-102) |
| **UC-02.2** | Inativar usuário, ou tirar o vínculo dele, com itens abertos sob a responsabilidade dele | Bloqueia e lista os itens, e o Administrador pode redistribuí-los ali mesmo | DF-36 (EC-02, EC-54) |
| **UC-16.4** | Redistribuir para analista sem vínculo com o cliente | Ele não aparece na lista | DF-35 (EC-42) |
| **UC-17.1** | Cliente fora dos vínculos | Não aparece na busca, e o link direto nega o acesso | RN-01 (EC-52, EC-53) |
| **UC-17.2** | Consulta pelo celular | Telas de consulta com boa leitura e navegação, como diretriz | DF-31 (EC-85) |
| **UC-19.1** | Encerrar ou cancelar com itens abertos, inclusive etapa Em andamento | Bloqueia e lista quais são | RN-18, DF-59 (EC-49) |
| **UC-19.2** | Registro criado por engano, sem nada ligado | Exclusão definitiva pelo Administrador, com confirmação, justificativa e log | DF-33 (EC-50) |
| **UC-19.3** | Reabrir | Só o Administrador, que escolhe o status de volta e justifica; vigência e alertas voltam | RN-17, RN-22 (EC-51) |
| **UC-19.4** | Inativar cliente com avaliação de maturidade Em elaboração | Bloqueia e lista | RN-18 |

**Pronto quando**, além do pronto comum: `npm run criterios -- --completo` passa, com todos os itens do PRD provados.

---

### E16 · Produção, backup e operação

**Objetivo:** a plataforma em produção, no endereço da ELO, com backup de 30 dias, e-mail no domínio e a documentação para operar.

**Depende de:** E15 para a entrada em produção. Os registros de DNS e o domínio de e-mail vêm do E1, e o armazenamento do backup pode ser contratado antes ([Contas](#contas)).
**Contrato:** 3.16 (rotina de backup), 3.18 (aplicação publicada), 4.6 (plataforma em produção).
**Requisitos não funcionais:** RNF-04, RNF-05 (exclusão a pedido), RNF-08, RNF-10, RNF-12, RNF-13, RNF-14, RNF-16, RNF-17.
**Base:** PRD, DF-18, DF-19, DF-46, DF-83; arquitetura, 7, 8 e 9, DA-01, DA-06, DA-07.

**Construir:**

- Produção: organização do Supabase no plano Pro (DA-01) e a Vercel de produção ([Contas](#contas)), com as migrações aplicadas primeiro na homologação e depois na produção.
- Subdomínio da ELO (sugestão app.elogovernance.com.br, com o nome definido pela ELO) e domínio de envio do Resend, com os registros de DNS pedidos no E1 (arquitetura, 8). Nenhum registro do site nem do e-mail atual muda.
- **Cópia independente do backup** (DA-07): rotina diária no GitHub Actions que copia o banco e os arquivos para um armazenamento independente, no Brasil, em conta da ELO, cifrada, guardada por 30 dias, com aviso por e-mail quando falha. Credenciais nos segredos do GitHub.
- **Restauração testada** antes da entrega, com o procedimento escrito na documentação de operação. A frequência dos testes periódicos depois da entrega está a alinhar com a Cleo (PRD, 14.3, DF-18).
- **Exclusão de dados a pedido** (DF-19): procedimento documentado, com o registro no `log_tecnico` (solicitação, titular, data e resultado).
- **Carga inicial e início da operação** (DF-46): a equipe cadastra a carteira com as notificações e os alertas desligados; o Administrador confere e registra o início oficial, e as comunicações passam a funcionar.
- Conferência das diretrizes no volume previsto: listas e telas principais em até 3 segundos, PDF em até 10 (RNF-08); Chrome, Edge, Firefox e Safari atuais (RNF-10); contraste e teclado nas telas principais (RNF-16).
- Alertas automáticos de atualização de segurança das dependências no GitHub.
- Documentação de operação: ambientes, variáveis, publicação, migrações, restauração, exclusão a pedido, carga inicial e início da operação.

Este épico não é dono de critério de aceite: ele põe em produção o que os outros provaram. O teste do fluxo abaixo é o do procedimento de exclusão a pedido, sobre a homologação.

#### Fluxos alternativos (1)

Da seção 7.1 do PRD. O número depois do caso de uso é a ordem da linha na tabela dele.

| Fluxo | Situação | O que acontece | Regra |
|---|---|---|---|
| **UC-04.2** | Candidato recusado pede a exclusão dos dados | Procedimento operacional, sem tela, com registro da solicitação, do titular, da data e do resultado | DF-19 (EC-04) |

---

## Fora dos épicos

Itens do contrato que não são desenvolvimento e ficam com a Result, na Etapa 4 (detalhe em [`docs/criterios-de-aceite-do-contrato.md`](docs/criterios-de-aceite-do-contrato.md)):

- Ajustes decorrentes dos testes de aceitação da Cleo (4.2).
- Validação dos critérios de aceite um a um com a Cleo (4.3), a partir do resultado de `npm run criterios -- --completo` e dos testes.
- Capacitação da equipe ELO (4.4) e material de apoio para a operação (4.8). Já existem os guias de uso do protótipo, por perfil.
- Transferência dos ativos digitais (4.5) e termo de transferência (4.9).
- Relatório final com os testes realizados e os critérios validados (4.7).
- Registro das aprovações de cada entrega no grupo oficial (3.20).
- Repositório na conta da ELO (3.19): o desenvolvedor cria a organização da ELO no GitHub ([Contas](#contas)), e o Jonathan decide quando transferir.

---

## Ambientes, contas e variáveis

| Ambiente | Para quê | Infraestrutura |
|---|---|---|
| Local | Desenvolvimento e testes | `supabase start` (Docker) e `npm run dev` |
| Pré-visualização | Cada ramo, antes de entrar | Vercel, ligada à homologação |
| Homologação | A Cleo aprova as entregas e faz os testes de aceite, sem dados reais | Supabase no plano gratuito, em organização separada da produção (DA-06). Único banco durante o desenvolvimento |
| Produção | Uso real da ELO, a partir da entrada em produção (E16) | Vercel e Supabase Pro (DA-01) |

### Contas

O desenvolvedor cria as contas. Todas ficam em nome da ELO desde o início (RNF-13; arquitetura, 8), para que a transferência dos ativos digitais na Etapa 4 (contrato, 4.5 e 4.9) seja só tirar os acessos da Result.

**Regras para todas as contas:**

1. Criada com o e-mail da ELO criado para as contas da plataforma, nunca com e-mail pessoal ou da Result. O código de confirmação chega nesse e-mail.
2. O desenvolvedor entra como membro convidado, com o login dele. A ELO fica como dona.
3. Verificação em duas etapas ligada.
4. O que é pago, a ELO paga direto ao fornecedor, com o meio de pagamento dela (arquitetura, 9). Nada fica no cartão da Result nem no do desenvolvedor.
5. Cada conta criada entra na lista da documentação de operação (E16): serviço, e-mail dono, plano, quem tem acesso e data de criação. Essa lista é a base do termo de transferência.

| Conta | Quando | Plano | O que configurar |
|---|---|---|---|
| Supabase, organização da homologação | E1 | Gratuito | Projeto na região São Paulo. No Auth: autocadastro desligado, senha de no mínimo 8 caracteres, endereço do site e endereços de retorno da homologação e das pré-visualizações, SMTP do Resend com o remetente padrão (DF-21) e modelos do convite e da recuperação de senha em português. O projeto gratuito pausa depois de 1 semana sem uso (arquitetura, 9): conferir que está ativo antes de cada aprovação da Cleo |
| Resend | E1 | Gratuito: 3.000 e-mails por mês e 100 por dia | Domínio elogovernance.com.br, com o envio num subdomínio próprio, sem mexer no e-mail atual. Uma chave para a homologação e, no E16, outra para a produção |
| Vercel | E1 | Pro, pago pela ELO | Projeto ligado ao repositório, funções na região São Paulo (arquitetura, 2), variáveis por ambiente (abaixo). Até o E16, a publicação do `main` é a homologação |
| Cloudflare | E14 | Gratuito | Turnstile, com os domínios da homologação e da produção. No computador e nos testes, as chaves de teste que a Cloudflare publica |
| GitHub, organização da ELO | Quando o Jonathan decidir a transferência, ainda na Etapa 3 (contrato, 3.19) | Gratuito | O Jonathan entra como dono e transfere o repositório. Depois, religar a Vercel ao repositório transferido e cadastrar os segredos do GitHub Actions na organização |
| Supabase, organização da produção | E16 | Pro, pago pela ELO (DA-01) | Separada da homologação (DA-06), com as mesmas configurações do Auth e os endereços da produção |
| Armazenamento do backup | E16 | Pago pela ELO | Outro provedor, região no Brasil, cifrado, cópias guardadas por 30 dias (DA-07). O provedor e o custo vão ao Jonathan antes da contratação, porque a arquitetura deixou o valor a confirmar |

**Registros de DNS.** Com o Resend e a Vercel configurados, o desenvolvedor monta a lista da arquitetura, seção 8 (CNAME do subdomínio, DKIM, MX e SPF do envio e DMARC, se o domínio não tiver), com os valores que os dois mostram, e a entrega ao Jonathan Silva, que pede ao Osvaldo para criá-los no Registro.br. Ninguém da Result entra no Registro.br, e nenhum registro do site nem do e-mail atual muda. O nome do subdomínio é definido pela ELO; a sugestão é app.elogovernance.com.br. Até os registros existirem, os e-mails do Auth na homologação não saem pelo domínio da ELO, e os testes usam o Mailpit local.

**Variáveis de ambiente** (nunca no repositório; as do servidor nunca no navegador):

| Variável | Onde | Para quê |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Navegador e servidor | Endereço do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Navegador e servidor | Chave pública; o acesso é decidido pelas políticas do banco |
| `SUPABASE_SERVICE_ROLE_KEY` | Só servidor | Operações privilegiadas da arquitetura, 3.1: convite, formulários públicos e funções com permissão elevada |
| `RESEND_API_KEY` | Só servidor | Envio da notificação da Central e do aviso de diagnóstico |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Navegador | Desafio do Turnstile nos formulários públicos |
| `TURNSTILE_SECRET_KEY` | Só servidor | Verificação do Turnstile |
| `NEXT_DIST_DIR` | Local | Pasta da build de conferência (`.next/verificacao`) |

As credenciais da cópia independente do backup ficam nos segredos do GitHub Actions (DA-07).
