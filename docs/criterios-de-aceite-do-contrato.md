# Critérios de aceite do contrato | Plataforma ELO

| Campo | Valor |
|---|---|
| Contrato | Sebraetec SB.2038.26, entre a ELO HUB Governança Inteligente LTDA (Empresa Demandante) e a Result Consultoria e Inovação |
| Situação em | 24/11/2026 |
| Atendidos | Etapa 1: 19 de 19. Etapa 2: 13 de 13. Etapa 3: 0 de 20. Etapa 4: 0 de 9 |

O contrato não traz critérios por etapa: as etapas aparecem na tabela da cláusula 1ª, com as datas. O que cada etapa entrega vem da proposta de serviço, que a cláusula 16ª torna parte integrante do contrato. Cada linha abaixo é um item verificável tirado do texto literal da proposta. A Result mantém este arquivo atualizado a cada etapa.

Os critérios de aceite **do produto** são outra coisa: os 136 do PRD (`docs/prd.md`), com os 88 cenários das regras e os 117 fluxos alternativos. A Etapa 4 valida esses um a um (critério 4.3). O mapa deles por épico de desenvolvimento está no `README.md`.

## Etapa 1 | Documentação, descoberta e alinhamento

**Período:** 03/11 a 13/11/2026. Concluída: aprovada pela Cleo em 16/11/2026

> ENTREGA ETAPA 01: Documentação funcional e técnica aprovada, contendo o escopo detalhado, o modelo de dados, as regras de negócio, os perfis de acesso, o mapa de telas e os critérios de aceite, acompanhada do plano de ação com o cronograma das atividades e da definição dos responsáveis por parte da Empresa Demandante e da Prestadora de Serviços.

| # | Critério | Situação | Evidência |
|---|---|---|---|
| 1.1 | Reunião de abertura realizada, com nivelamento do escopo e validação do planejamento | Atendido | Reunião de kickoff em 30/10/2026, registrada na ata. |
| 1.2 | Cronograma resumido com os principais eventos | Atendido | Ata §4: as 4 etapas com datas e horas. |
| 1.3 | Agendas de reuniões | Atendido | Reuniões de fim de etapa marcadas no Google Agenda, com Meet e gravação, para a Cleo e o David: 13/11, 04/12, 23/12 (quarta, último dia da Etapa 3) e 15/01, das 14h às 14h30. Nas outras sextas há vídeo de entrega. Datas e vídeos comunicados no grupo em 05/11. |
| 1.4 | Responsáveis pelo acompanhamento definidos, pela ELO HUB e pela Result | Atendido | Ata §5: aprovações com a Cleonice; consultor responsável e gestor do contrato; Osvaldo como apoio técnico. |
| 1.5 | Documentação funcional e técnica consolidada a partir da Definição Funcional do MVP | Atendido | PRD v1.20 e arquitetura v1.14 (18/11), pré-aprovados pela Cleo em 16/11 na v1.18 e na v1.13, com a validação das 72 definições pela Cleo (08/11). O PRD consolida a Definição Funcional do MVP em 20 funcionalidades, 25 regras, 83 definições, 136 critérios de aceite, 88 cenários das regras e os fluxos alternativos dos 22 casos de uso. A arquitetura traz stack, estrutura, modelo de dados, APIs, autenticação, segurança, deploy e custos. As 18 pendências estão fechadas. A aprovação é o critério 1.18. |
| 1.6 | Escopo detalhado | Atendido | PRD v1.20: a proposta inteira coberta, mais 8% além dela (aderência de 108%, Apêndice F). O que vai além está registrado como extra, por decisão da Result: avaliação de maturidade (F20), redesenho da página do site (F19) e histórico com valor anterior e novo (DF-16). A aprovação é o critério 1.18. |
| 1.7 | Modelagem de dados, com o encadeamento Cliente, Contrato, Escopo Contratado, Criticidade, Jornada ELO, Plano de Ação, Atividades, Documentos, Central ELO e Resultados | Atendido | Modelo de dados na arquitetura v1.14 (seção 4): diagrama de entidades, 22 tabelas e 2 de apoio, regras no banco e segregação por vínculo, sobre o encadeamento do PRD v1.20. "Resultados" foi definido pela Cleo: dois textos por cliente, sempre atualizados (DF-73). A aprovação é o critério 1.18. |
| 1.8 | Regras de negócio de vigência, criticidade, inativação e rastreabilidade | Atendido | PRD v1.20 traz RN-04, RN-05, RN-07, RN-13, RN-17, RN-18, RN-20 e RN-24, com 88 cenários de teste das regras (Apêndice D), o ciclo de vida das entidades (seção 6.1) e as definições DF-25, DF-26, DF-36, DF-38, DF-51, DF-62 e DF-68 (tipos de vigência). A arquitetura v1.14 leva essas regras para o banco (seção 4.4). A aprovação é o critério 1.18. |
| 1.9 | Perfis de acesso do Administrador ELO e da Equipe ELO | Atendido | Matriz de permissões no PRD v1.20 (seção 4.3), com as definições DF-23, DF-24, DF-35, DF-39, DF-44, DF-65 e DF-75 (só o Administrador exporta), e as políticas de acesso na arquitetura v1.14 (seção 4.5). A aprovação é o critério 1.18. |
| 1.10 | Mapa de telas | Atendido | Mapa de telas completo no PRD v1.20 (seção 10), ligado às rotas da arquitetura. A aprovação é o critério 1.18. |
| 1.11 | Critérios de aceite de cada funcionalidade | Atendido | 136 critérios no PRD v1.20, com 88 cenários das regras (Apêndice D) e os fluxos alternativos dos 22 casos de uso (seção 7.1). A aprovação é o critério 1.18. |
| 1.12 | Decisão de kickoff: categorias definitivas da Central ELO | Atendido | Respondida pela Cleo em 04/11 (PD-01): mantém as categorias sugeridas e inclui KPIs e SLAs, documentação e mobilização de fornecedores e auditoria e avaliação de fornecedores (DF-70, Apêndice C). "Outros assuntos" mantida em 10/11 (PRD 14.2, item 3). |
| 1.13 | Decisão de kickoff: lista oficial dos serviços que aparecerão no cadastro | Atendido | Respondida pela Cleo em 04/11 (PD-02): 20 serviços que o cliente presta ao contratante, com a lista aberta a inclusões (DF-70, Apêndice C). |
| 1.14 | Decisão de kickoff: formatos e limites de tamanho de arquivos | Atendido | Respondida pela Cleo em 04/11 (PD-04): PDF, Word, Excel, imagens (.jpg, .png), PowerPoint e e-mails salvos (.msg, .eml), com até 10 MB cada (DF-72). |
| 1.15 | Decisão de kickoff: dados obrigatórios do cadastro de especialistas | Atendido | Ata §6, decisão 7: nome, data de nascimento, especialidade e contato. Conciliado com o §14 do MVP na DF-27. Na validação de 08/11, a Cleo deixou a data de nascimento opcional. |
| 1.16 | Decisão de kickoff: endereço institucional que receberá as notificações | Atendido | Respondida pela Cleo em 04/11 (PD-07): atendimento@elogovernance.com.br, com os e-mails da plataforma saindo do domínio elogovernance.com.br (DF-72). Em 08/11, ela pediu também outros endereços do domínio conforme a finalidade (DF-21). |
| 1.17 | Plano de ação com o cronograma das atividades | Atendido | Plano de ação 1.0 enviado no grupo em 05/11 (PDF): responsáveis, acompanhamento, calendário das sextas e atividades de cada etapa, com as datas do contrato. |
| 1.18 | Documentação aprovada formalmente pela Empresa Demandante | Atendido | Aprovada pela Cleo no grupo oficial em 16/11/2026, citando o PRD v1.18 e a arquitetura v1.13: é a aprovação da documentação que dá início ao protótipo. As 72 definições foram validadas por ela em 08/11. |
| 1.19 | O desenvolvimento só começa após a aprovação formal da documentação | Atendido | Cumprido até agora: nenhum código de produção foi iniciado. |

## Etapa 2 | Prototipação e design

**Período:** 16/11 a 04/12/2026. Concluída: protótipo aprovado pela Cleo em 24/11/2026

> ENTREGA ETAPA 02: Protótipo navegável publicado em ambiente acessível pela internet, com o conjunto de telas do MVP validado e aprovado pela Empresa Demandante, acompanhado do padrão visual e da biblioteca de componentes de interface definidos para o projeto.

| # | Critério | Situação | Evidência |
|---|---|---|---|
| 2.1 | Protótipo navegável construído diretamente em código | Atendido | Protótipo construído em código (Next.js), com as telas das 9 partes do mapa de telas do PRD v1.20, dados fictícios e os perfis Administrador e Equipe. Atende os 134 critérios de aceite do PRD que cabem no protótipo, com 1681 testes automatizados (18/11). A aprovação é o critério 2.13. |
| 2.2 | Protótipo publicado em ambiente acessível pela internet | Atendido | Protótipo publicado na Vercel em 21/11/2026: https://elo-hub-rho.vercel.app, com a entrada pelos perfis Administrador e Equipe e os guias de uso de cada perfil em PDF. A aprovação é o critério 2.13. |
| 2.3 | Telas de cadastro de clientes | Atendido | Lista, cadastro e edição e página do cliente, com contratos, escopos, demandas, documentos, avaliações de maturidade e Visão Executiva (/clientes), mais o cadastro da avaliação de maturidade (/avaliacoes). A aprovação é o critério 2.13. |
| 2.4 | Telas de contratos e propostas | Atendido | Lista com a vigência calculada e os destaques de vencimento, cadastro e edição e página do contrato, com escopos e documentos (/contratos). A aprovação é o critério 2.13. |
| 2.5 | Telas de Escopo Contratado | Atendido | Lista, cadastro e edição e página do escopo, com criticidade e histórico, Jornada ELO, planos e atividades, especialistas, documentos e demandas (/escopos). A aprovação é o critério 2.13. |
| 2.6 | Telas de planos de ação e atividades | Atendido | Página do plano com as atividades, cadastro e edição de planos e de atividades, e Minhas atividades (/planos, /atividades, /minhas-atividades). A aprovação é o critério 2.13. |
| 2.7 | Telas da Central ELO | Atendido | Fila de demandas, nova demanda e página da demanda, com triagem, atendimento, comentários, contato com especialista, anexos, solução e retorno ao cliente (/central), mais o cadastro de especialistas (/especialistas). A aprovação é o critério 2.13. |
| 2.8 | Telas da área documental | Atendido | Lista, inclusão, página e edição do documento, com vínculos, versões, status e download do arquivo (/documentos). A aprovação é o critério 2.13. |
| 2.9 | Tela do dashboard operacional | Atendido | Início com os indicadores da carteira, cada um abrindo a lista filtrada, e a lista de alertas internos (/inicio). A aprovação é o critério 2.13. |
| 2.10 | Tela da Visão Executiva do Cliente | Atendido | Visão Executiva por cliente, com os blocos da DF-74, a maturidade, os três textos editáveis, o modo de tela cheia e o PDF (/clientes/[id]/visao-executiva). A aprovação é o critério 2.13. |
| 2.11 | Padrão visual definido: tipografia, cores, componentes e estados de interface | Atendido | Padrão visual em docs/padrao-visual.md e na página /designsystem: tipografia, cores da marca em tokens, componentes e estados de interface (vazio, carregando, erro e sucesso), usado em todas as telas. Com a marca nova da ELO, recebida em 18/11 (PRD 14.2, item 7): logo, Playfair Display nos títulos e Montserrat nos textos. A aprovação é o critério 2.13. |
| 2.12 | Biblioteca de componentes de interface definida | Atendido | Biblioteca de componentes em código, mostrada em /designsystem: ações, campos de formulário, tabelas, etiquetas de status, painéis, navegação, avisos e confirmações, usada em todas as telas. A aprovação é o critério 2.13. |
| 2.13 | Conjunto de telas do MVP validado e aprovado pela Empresa Demandante | Atendido | Aprovado pela Cleo em 24/11/2026, na versão publicada em https://elo-hub-rho.vercel.app: as telas das 9 partes do mapa de telas, nos perfis Administrador e Equipe, com o padrão visual e a biblioteca de componentes. |

## Etapa 3 | Desenvolvimento da aplicação

**Período:** 23/11 a 23/12/2026. Em andamento

> ENTREGA ETAPA 03: Aplicação desenvolvida e publicada em ambiente acessível pela internet, com os módulos do MVP em funcionamento, código versionado em repositório de titularidade da Empresa Demandante e registro das aprovações realizadas a cada entrega.

| # | Critério | Situação | Épico do README |
|---|---|---|---|
| 3.1 | Entregas incrementais publicadas, com acompanhamento e aprovação de cada avanço pela Empresa Demandante | Não atendido | Todos: cada épico pronto vai para a homologação e é aprovado pela Cleo |
| 3.2 | Cadastro de clientes | Não atendido | E2 |
| 3.3 | Cadastro de contratos e propostas com acompanhamento de vigência e alerta interno de vencimento | Não atendido | E4, E12 |
| 3.4 | Escopo Contratado com status, prioridade e criticidade | Não atendido | E7 |
| 3.5 | Jornada ELO aplicada ao escopo | Não atendido | E7 |
| 3.6 | Planos de ação e atividades com identificação automática de atraso | Não atendido | E8 |
| 3.7 | Central ELO com registro, triagem, direcionamento, acompanhamento e notificação automática por e-mail | Não atendido | E10 |
| 3.8 | Cadastro de especialistas | Não atendido | E6 |
| 3.9 | Organização documental com categorias, status e vínculo a escopos, atividades e demandas | Não atendido | E11 |
| 3.10 | Dashboard operacional | Não atendido | E12 |
| 3.11 | Visão Executiva do Cliente com relatório resumido em PDF | Não atendido | E13 |
| 3.12 | Segurança: autenticação | Não atendido | E1 |
| 3.13 | Segurança: controle por perfis | Não atendido | E3 |
| 3.14 | Segurança: segregação lógica das informações | Não atendido | E2, E15 |
| 3.15 | Segurança: HTTPS | Não atendido | E1 |
| 3.16 | Segurança: rotina de backup | Não atendido | E16 |
| 3.17 | Segurança: rastreabilidade básica de criação e alteração de registros | Não atendido | E1, E15 |
| 3.18 | Aplicação publicada em ambiente acessível pela internet | Não atendido | E1 (homologação), E16 (produção) |
| 3.19 | Código versionado em repositório de titularidade da Empresa Demandante | Não atendido | Fora dos épicos: transferência do repositório, decidida pelo Jonathan |
| 3.20 | Registro das aprovações realizadas a cada entrega | Não atendido | Fora dos épicos: registro no grupo oficial |

O backup (3.16) segue a arquitetura v1.14: Supabase Pro em produção, com backup diário guardado por 7 dias (DA-01), e uma cópia própria guardada por 30 dias em armazenamento independente (DA-07, DF-18). A aplicação (3.18) fica num subdomínio de elogovernance.com.br, com o nome definido pela ELO; a sugestão é app.elogovernance.com.br (DF-83). As aprovações (3.20) valem quando registradas no grupo oficial.

## Etapa 4 | Testes de qualidade e entrega final

**Período:** 04/01 a 15/01/2027. A começar

> ENTREGA ETAPA 04: Plataforma em ambiente de produção, relatório final contendo o registro dos testes realizados e dos critérios de aceite validados, material de apoio para a operação da plataforma pela equipe ELO e termo de transferência dos ativos digitais.

| # | Critério | Situação | Evidência |
|---|---|---|---|
| 4.1 | Testes de qualidade da plataforma executados | Não atendido | Etapa começa em 04/01/2027. |
| 4.2 | Ajustes decorrentes dos testes de aceitação da Empresa Demandante tratados | Não atendido | Etapa começa em 04/01/2027. |
| 4.3 | Critérios de aceite definidos na Etapa 1 validados um a um | Não atendido | Os 136 critérios de aceite do PRD, com os 88 cenários das regras (Apêndice D), validados um a um com a Cleo na homologação, a partir dos testes (`npm run criterios -- --completo`). |
| 4.4 | Capacitação da equipe ELO para a operação da plataforma | Não atendido | Etapa começa em 04/01/2027. |
| 4.5 | Transferência integral dos ativos digitais: repositório de código e credenciais de hospedagem, banco de dados e e-mail transacional em nome da ELO HUB | Não atendido | Etapa começa em 04/01/2027. |
| 4.6 | Plataforma em ambiente de produção | Não atendido | Épico E16 do README. |
| 4.7 | Relatório final com o registro dos testes realizados e dos critérios de aceite validados | Não atendido | Etapa começa em 04/01/2027. |
| 4.8 | Material de apoio para a operação da plataforma pela equipe ELO | Não atendido | Etapa começa em 04/01/2027. |
| 4.9 | Termo de transferência dos ativos digitais | Não atendido | Etapa começa em 04/01/2027. |
