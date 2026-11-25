# PRD | Plataforma ELO (ELO Hub)

| Campo | Valor |
|---|---|
| Versão | 1.21. A v1.18 foi pré-aprovada pela Cleo no grupo em 16/11/2026, com a arquitetura v1.13; a aprovação final vem junto com a do protótipo |
| Aderência ao escopo | 108%: toda a proposta coberta, mais 8% além dela (Apêndice F) |
| Data | 19/11/2026 |
| Responsável | Jonathan Silva (Result Consultoria e Inovação) |
| Aprovação | Cleonice Azevedo Jardim (ELO HUB Governança Inteligente) |
| Etapa do contrato | Etapa 1, Documentação, descoberta e alinhamento (03/11 a 13/11/2026) |
| Próximos documentos que dependem deste | Arquitetura, Protótipo |

## Histórico de versões

Toda alteração gera uma nova linha nesta tabela. A seção do PRD no FigJam mostra a mesma versão no título e deve ser atualizada a partir deste arquivo.

| Versão | Data | O que mudou |
|---|---|---|
| 1.0 | 31/10/2026 | Primeira versão, a partir da Definição Funcional do MVP, das reuniões de 07/09 e 30/10, da ata de alinhamento e do mapa de JTBD. |
| 1.1 | 31/10/2026 | **Hardening de aderência à proposta** (Apêndices A e B). **Acrescentado:** PD-31 (prazo do alerta de vencimento); DF-22 (prazo da demanda informado na triagem); RNF-17 (publicação em endereço definido pela ELO); repositório e contas em nome da ELO desde o início do projeto (RNF-13); Apêndices A e B. **Reduzido para não passar da proposta:** histórico com valor anterior e novo virou registro de usuário, data e hora (CA-05.2, CA-17.2, DF-16); e-mail "em até 5 minutos" virou disparo no momento do registro (CA-10.1, RNF-15); falha de envio vai para o log técnico (CA-10.3); desempenho, navegadores e acessibilidade viraram diretrizes, fora dos critérios de aceite (RNF-08, RNF-10, RNF-16); "Modo apresentação" deixou de ser tela própria (seção 10). **Movido para fora do escopo:** indicadores estruturados de maturidade, não conformidades e fornecedores auditados (PD-20 encerrada); prazo automático por criticidade (PD-14 encerrada); importação automática de dados (PD-26 reformulada). **Marcado como decisão:** validade de documentos com alerta (PD-18) e atualização do site com imagens da plataforma (PD-22). |
| 1.2 | 31/10/2026 | **Decisões da Result.** Validade de documentos fica fora: o alerta de vencimento vale só para contratos, como na proposta (campo removido de F12, PD-18 encerrada, seção 11). Redesenho da página do site institucional incluído, na fase final, com imagens da plataforma, atendendo a ata de 30/10 (F19, CA-19.5, seção 10). PD-22 reformulada para a plataforma do site atual. |
| 1.3 | 31/10/2026 | **Pendências decididas pela Result**, que viram definições para a Cleo confirmar na revisão. PD-08 → DF-23: vínculo da Equipe por cliente, mantido pelo Administrador; o "Responsável ELO" não define acesso; clientes fora dos vínculos não aparecem (RN-01, F01, F12, seção 4.3, glossário). PD-09 → DF-24: a Equipe atualiza o andamento das etapas da Jornada e os dados dos documentos nos clientes vinculados; cadastro e edição do escopo, criticidade e desenho da Jornada ficam com o Administrador (seção 4.3, CA-06.5). PD-10 → DF-25: o vencimento não altera o status do contrato; prorrogação manual por aditivo (RN-04, F03, CA-04.5). PD-11 → DF-26: sem cascata; o encerramento é bloqueado enquanto houver itens abertos, que o sistema lista (RN-18, CA-18.3). PD-17 → DF-27: campos do especialista conforme a ata, sem CPF/CNPJ, currículo por link e sem upload no site; documentos anexados pela equipe (F11, F19). PD-12 → DF-28: etapa atual da Jornada calculada (F05, RN-08, CA-06.6). PD-15 → DF-29: Resolvida = solução registrada; Encerrada = retorno dado e arquivada, ou fechamento justificado sem solução (RN-12, CA-09.8). PD-16 → DF-30: o especialista não recebe o e-mail da demanda; o analista o aciona (F10). PD-27 → DF-31: desktop primeiro, telas de consulta legíveis no celular como diretriz (RNF-09). PD-28 → DF-32: vários especialistas por escopo e um por demanda (F05, F09). **Nova PD-32** (prioridade A, com a Cleo): quem são as partes do contrato cadastrado; glossário passa a tratar "Contrato" como hipótese; PD-29 passa a depender da PD-32. PD-30 → DF-33: o Administrador exclui de vez registros sem nada ligado, com log técnico (RN-13, CA-18.4, seção 4.3). PD-31 → DF-34: alerta de vencimento fixo em 30 dias (RN-05, F04). Seção 14 reorganizada: só as 17 perguntas abertas com a Cleo (7 de prioridade A), mais a lista das 15 encerradas; PD-23 reduzida à lista de especialidades e segmentos. Total: 34 definições e 82 critérios de aceite. |
| 1.4 | 31/10/2026 | **Pendências reduzidas ao formulário da Cleo.** A seção 14 lista só as 17 perguntas enviadas à Cleo, na ordem do formulário, com o link, a origem de cada uma (Kickoff ou PRD) e os documentos de exemplo pedidos (14.1). Sai a lista das 15 pendências encerradas: as decididas pela Result estão nas definições, com a pendência de origem (DF-22 a DF-34), e as que ficaram fora do escopo estão na seção 11. Em F14, a referência à PD-20 passa a apontar para a seção 11. Sem mudança de escopo, funcionalidades, regras ou critérios de aceite. |
| 1.5 | 01/11/2026 | **Decisões dos edge cases.** Os fluxos de cada job, desenhados no FigJam, levantaram 139 edge cases e 24 decisões (D-01 a D-24). A Result fechou todas pela recomendação: 23 viram definições (DF-35 a DF-57) e 1 vira pergunta à Cleo (PD-33, a enviar com o retorno da PD-32). **Regras novas:** RN-19 (o responsável precisa ter vínculo com o cliente), RN-20 (prazos vencem no fim do dia, no horário de Brasília), RN-21 (datas fora da vigência ou do plano geram aviso, sem bloquear). **Regras ajustadas:** RN-01 (a Equipe registra demanda de cliente Ativo fora dos vínculos, sem passar a vê-lo), RN-02 (o Administrador move escopo entre contratos do mesmo cliente), RN-03 (contrato sem término vai para a PD-33), RN-04 (contrato Suspenso mantém vigência e alertas), RN-08 (bordas da Jornada e um ciclo por escopo), RN-09 (prazo vale até o fim do dia), RN-12 (Resolvida volta para Em atendimento), RN-13 (item de lista em uso é inativado), RN-14 (especialista inativado com vínculo aberto), RN-17 (etapa concluída), RN-18 (usuário com itens abertos). **Corrigido:** o conflito entre UC-15 e CA-12.6; a Equipe marca Superado só ao enviar o substituto (DF-44). **Campos:** data de conclusão automática na atividade; código do contrato único por cliente; campos de responsável limitados a quem tem vínculo. **Visão Executiva:** o que nunca aparece e filtro por contrato (DF-52). **Critérios de aceite:** 22 novos e 2 ajustados (CA-01.1 e CA-12.6). Total: 57 definições, 21 regras, 104 critérios de aceite e 18 pendências com a Cleo. |
| 1.6 | 01/11/2026 | **PD-33 entra no formulário.** O formulário ainda não tinha sido enviado, então a pergunta sobre contrato sem data de término (D-13) virou a pergunta 3, logo depois das perguntas sobre o contrato (PD-32 e PD-29). As seguintes passam de 3–17 para 4–18, e a subseção 14.2 sai. Todas as 18 pendências com a Cleo agora estão no formulário. Sem mudança de escopo, funcionalidades, regras ou critérios de aceite. |
| 1.7 | 01/11/2026 | **Ciclo de vida das entidades (seção 6.1).** Status, transições, quem pode e em que condição para usuário, cliente, contrato, escopo, etapa da Jornada, plano, atividade, demanda, especialista, documento e item de lista oficial, consolidando RN-12, RN-17, RN-18, os critérios de aceite e as definições. Montar as transições levantou 7 decisões (D-25 a D-31), fechadas pela recomendação e registradas como DF-58 a DF-64. **Regras novas:** RN-22 (correção e reabertura pelo Administrador), RN-23 (o que pode acontecer dentro de registro em status final), RN-24 (o que é inativar em cada entidade). **Ajustes:** RN-17 aponta para a 6.1; RN-18 impede concluir ou cancelar escopo com etapa Em andamento; F03 define Encerrado e Cancelado; CA-09.8 (o responsável pela triagem encerra a demanda enquanto não há atendente); CA-12.4 (substituto obrigatório, resolvendo a contradição com a RN-15). **Seção 15:** a DT-02 foi feita; a DT-03 e a DT-04 saem do PRD e ficam para depois da validação do protótipo, por serem especificação de interface. Total: 64 definições, 24 regras e 104 critérios de aceite (2 ajustados). |
| 1.8 | 01/11/2026 | **Documento do Especialista (D-32).** A modelagem de dados da arquitetura (`docs/arquitetura.md`) mostrou que o CA-12.1 exigia cliente em todo documento, mas os arquivos do cadastro do especialista (DF-27) não pertencem a nenhum cliente. A Result fechou pela recomendação (DF-65): nessa categoria, o especialista é obrigatório e o cliente é opcional; sem cliente, só o Administrador inclui e altera o documento, e os dois perfis consultam e baixam, como consultam especialistas. **Ajustes:** matriz 4.3, nota de F11, F12 (campo Especialista, cliente condicional e acesso), CA-12.1, CA-12.3, RN-16 e a criação do documento na seção 6.1. Total: 65 definições, 24 regras e 104 critérios de aceite (2 ajustados). |
| 1.9 | 04/11/2026 | **Respostas da Cleo ao formulário e documentos de exemplo.** As 18 pendências foram respondidas e viraram as definições DF-66 a DF-77; só a plataforma do site (PD-22) segue aberta, com o Osvaldo. **Contrato (PD-32):** é o contrato ou a proposta do cliente com o grande contratante, e não o da ELO com o cliente. F03 ganha os campos Contratante (lista oficial, DF-69) e Tipo de vigência (DF-68): contrato por prazo indeterminado fica sem término e sem alerta (RN-03, RN-04). Vários serviços por contrato (DF-67). **Novo F20, Avaliação de maturidade:** o diagnóstico de maturidade e prontidão, centro do trabalho da ELO, entra no MVP numa versão enxuta. A plataforma guarda o resultado (nível por dimensão, maturidade geral, prontidão e síntese), e não o questionário nem o cálculo; mostra a avaliação inicial e a atual na página do cliente e na Visão Executiva; o plano de desenvolvimento usa os planos de ação (RN-25, DF-78 a DF-80). Sai da seção 11 a maturidade inicial e atual. **Parametrização:** os prazos dos alertas passam a ser parâmetros do Administrador; regras, etapas, status e fluxos configuráveis por cliente ficam para evolução (DF-81, DF-34 ajustada). **Outros:** executor da atividade (F08), textos da Visão Executiva por cliente (F14), blocos do PDF, exportação só pelo Administrador, campos e destino do formulário de diagnóstico, metas M-04 e M-05, métricas M-08 e M-09, números da operação (2.3), listas e parâmetros iniciais (Apêndice C). Seção 14 vira o registro das respostas. Total: 81 definições, 25 regras e 116 critérios de aceite (7 ajustados). |
| 1.10 | 04/11/2026 | **Hardening da v1.9.** Revisão do documento inteiro atrás de contradições, ambiguidades e trechos desatualizados. **Contradições corrigidas:** seção 14 ("18 fechadas" contra "17 fechadas e 1 aberta"); DF-03 ("exportar" a Visão Executiva) contra DF-75 (só o Administrador exporta listas); RN-12 sem a exceção da DF-61 que o CA-09.8 já previa; RNF-12 com o custo da proposta, sem o da DA-01 da arquitetura; DF-52 e DF-62 sem acompanhar a DF-71 e a RN-24. **Desatualizados:** fluxo UC-06 sem contratante e tipo de vigência; UC-20; Apêndice A (CAs de F01 a F20); RNF-04 (backup já resolvido na DA-01); DF-07, DF-16 e DF-25 sem as mudanças da v1.9; CA-01.2, CA-04.1 e F01 sem os parâmetros, o prazo configurável e o avaliador; seção 11 (alertas configuráveis). **Ambiguidades resolvidas:** de onde vem cada bloco da Visão Executiva e do PDF, com "Próximos passos" como terceiro texto por cliente (F14, DF-82, D-38); empresa do formulário de diagnóstico vira a razão social (DF-76); dimensões da avaliação fixadas na criação, desempate por data e nível sem conferência com a média (F20, RN-25); medição da M-04 e da M-08; dimensão de maturidade não é camada do Framework ELO (glossário); pendência pode depender de outra pessoa indicada pela ELO ("Como ler"). Total: 82 definições, 25 regras e 116 critérios de aceite (5 ajustados: CA-01.1, CA-01.2, CA-04.1, CA-14.7 e CA-20.2). |
| 1.11 | 04/11/2026 | **Resposta do Osvaldo sobre o site (PD-22 fechada).** O site institucional está publicado no ChatGPT Sites, da OpenAI, na infraestrutura da Cloudflare, e foi feito em Next.js, React e Vinext; o código fica num projeto da OpenAI a que o Osvaldo tem acesso. Domínio e DNS ficam no Registro.br. A plataforma fica independente do site, num subdomínio de elogovernance.com.br (sugestão do Osvaldo: app.elogovernance.com.br, com o nome a confirmar pela ELO), e a Result pede ao Osvaldo que crie no DNS os registros necessários (DF-83). **Ajustes:** F19, seção 13 e seção 14 (18 pendências fechadas). Fonte nova [OSV]. Total: 83 definições, 25 regras e 116 critérios de aceite. |
| 1.12 | 04/11/2026 | **Parte da Result concluída: só faltam as validações da Cleo.** **Rastreabilidade:** DF-01 a DF-22 ganham a origem (seção do MVP e versão). **Testabilidade:** seção 7.1 com os fluxos alternativos e de exceção dos 22 casos de uso, a partir dos 139 edge cases do FigJam e dos casos da F20 (DT-01); Apêndice D com 82 cenários das 25 regras (DT-06). **Ambiguidades:** RN-04 deixa de dizer "recalculado diariamente" e passa a "calculado a cada consulta", como na arquitetura; RN-10 diz que o prazo de hoje já conta como próximo; DF-04 fixa a sessão em 4 horas sem uso (DA-05); RNF-17 troca "momento oportuno" pelo subdomínio e pelos registros de DNS da DF-83. **Completude:** metas propostas para a M-08 e a M-09 (DF-85). **Protótipo:** o mapa de telas deixa de ser preliminar e ganha a ordem de aprovação em três lotes (DF-84); Apêndice E com o aviso e os consentimentos dos formulários do site (DT-05). **Validação:** nova seção 14.2 com os 12 itens que dependem da Cleo. A seção 15 vira o registro dos detalhamentos. Total: 85 definições, 25 regras, 116 critérios de aceite e 82 cenários. |
| 1.13 | 04/11/2026 | **Definições e aderência ao escopo.** As premissas passam a se chamar **Definições**, e os códigos PR-nn viram DF-nn, com o mesmo número; nas versões anteriores desta tabela, os códigos já aparecem no formato novo. Saem a DF-84 (lotes de aprovação do protótipo) e a DF-85 (metas da M-08 e da M-09): as duas métricas ficam como indicadores, sem meta no MVP. A seção 14.2 passa a 8 itens, e as 72 definições que a Cleo valida vão num formulário próprio. **Novo Apêndice F**, com o índice de aderência ao escopo: 108%, com toda a proposta coberta e 8% além dela (F20 e redesenho da página do site). Total: 83 definições, 25 regras, 116 critérios de aceite e 82 cenários. |
| 1.14 | 08/11/2026 | **Validação das definições pela Cleo [FORM2].** Ela respondeu às 72 definições em 08/11/2026, em duas submissões que não se contradizem: 22 aprovadas sem ressalva, 14 com ressalva que o PRD já atendia, 33 ajustadas, 1 registrada para evolução e 2 com ponto a alinhar. O resultado, item a item, está na nova seção 14.3. **Mudam de direção:** histórico com valor anterior e novo (DF-16, revertendo a redução da v1.1); data de nascimento do especialista opcional (DF-27); mais de um especialista por demanda, com um principal (DF-32); backup com retenção mínima de 30 dias, em armazenamento independente (DF-18, RNF-04); comunicações controladas até o início oficial da operação (DF-46). **Regras ajustadas:** RN-08 (progresso da Jornada), RN-12 (retorno ao cliente ao encerrar), RN-13 (justificativa na exclusão definitiva), RN-14 (alerta do vínculo a trocar), RN-17 e RN-22 (justificativa na reabertura e na correção; o status anterior passa a ser guardado) e RN-21 (aviso com confirmação). **Alertas:** entram contrato vencido e especialista inativo em vínculo aberto, e os alertas mostram a criticidade (DF-15, DF-25, DF-51). **Parâmetros novos:** remetente por finalidade (DF-21), referência de prazo por criticidade (DF-22) e início oficial da operação (DF-46). Apêndice F recalculado: 108%. Total: 83 definições, 25 regras, 134 critérios de aceite (18 novos e 9 ajustados) e 88 cenários. |
| 1.15 | 09/11/2026 | **Decisões sobre os pontos abertos da validação e revisão de coerência.** **DF-40:** as demandas institucionais da própria ELO usam a origem "Institucional" e ficam no cadastro da ELO como cliente, que existe só para esse uso e fica fora do total de clientes ativos (F02, F09, F13, CA-09.15, CA-13.4, Apêndice C). **Custo:** a ELO assume o custo do banco no plano pago e do armazenamento do backup (DA-01, DA-07, RNF-12, 14.2). Da DF-18 resta só definir a frequência dos testes de recuperação e quem os faz depois da entrega. **Contradições corrigidas:** RN-17 listava Encerrado como status final de escopo e plano, que fecham em Concluído; RN-11, CA-10.1 e a seção 6.1 não previam a exceção da DF-46; RN-05 não previa o alerta de contrato vencido; RN-02 e RN-14 ainda citavam o código antigo "PR"; a matriz 4.3 não trazia "Próximos passos" e dizia "exportar PDF" (DF-03, DF-75); a seção 6.1 não listava quatro transições normais (Proposta para Em contratação; Planejado para Em andamento; Em andamento para Em espera e de volta), que a regra de justificativa passaria a tratar como correção. **Ajustes de texto:** CA-04.4 (cálculo a cada consulta), CA-09.10 (prazos anterior e novo), RNF-07, DF-31, DF-81, "Como ler", glossário e Apêndices C e D. Total: 83 definições, 25 regras, 136 critérios de aceite (2 novos e 3 ajustados), 88 cenários e 117 fluxos alternativos. |
| 1.16 | 10/11/2026 | **Itens da seção 14.2 resolvidos pela Result.** A M-07 fica como está. A categoria "Outros assuntos" é mantida (Apêndice C). Os consentimentos do site ganham um prazo padrão de guarda: enquanto houver relação com a ELO e até 2 anos depois do último contato (Apêndice E, DF-19, RNF-05). O que vai além da proposta entra sem custo adicional, e falta só o aceite dela no grupo, junto com a pré-aprovação. O protótipo começa com a marca disponível, e a Cleo envia o logo em vetor e os códigos das cores (seção 10). Sem mudança em funcionalidades, regras ou critérios de aceite. |
| 1.17 | 10/11/2026 | **Extras além do escopo contratado, por decisão de Jonathan Silva (Result).** Três itens ficam registrados como extras, sem custo adicional e sem depender de aceite da Cleo (14.2, Apêndices B e F). A avaliação de maturidade (F20) é decisão da Result, e a decisão é final. No site, entre a ata e a proposta, o que vale é o redesenho da página (F19). O histórico com valor anterior e novo fica na versão mais enxuta do pedido da Cleo: uma lista só de leitura, sem filtro, busca, exportação ou destaque das diferenças (F17, CA-17.3, DF-16, seção 11). A situação da DT-05 passa a acompanhar a 14.2. Sem mudança nas contagens: 136 critérios de aceite e aderência de 108%. |
| 1.18 | 10/11/2026 | **Repositório durante a prototipação, por decisão de Jonathan Silva (Result).** O repositório fica no GitHub de Jonathan Silva (Result) durante a prototipação e é transferido para a conta da ELO com a aprovação do protótipo (RNF-13, Apêndice A). A proposta previa o repositório em nome da ELO desde o início [PROP Anexo II], e a ata registra a entrega em titularidade da ELO ao fim do projeto [ATA]. As contas de hospedagem, banco e e-mail não mudam. Sem mudança em funcionalidades, regras ou critérios de aceite. |
| 1.19 | 18/11/2026 | **Data do documento editável, por decisão de Jonathan Silva (Result).** A construção do protótipo mostrou que a matriz 4.3 não listava a data do documento entre os dados que se alteram, e uma data digitada errada só se corrigia por nova versão, que deixa um documento Superado sem o arquivo ter mudado. A data passa a se alterar como o nome, por quem altera os dados do documento: o Administrador e a Equipe vinculada; no Documento do Especialista sem cliente, só o Administrador (DF-65). A mudança vai para o histórico, com a data anterior e a nova (DF-16). O arquivo continua mudando só por nova versão (DF-44). **Ajustes:** matriz 4.3 e acesso de F12. Sem mudança nas contagens: 136 critérios de aceite e aderência de 108%. |
| 1.20 | 18/11/2026 | **Pré-aprovação da Cleo e ajustes da aderência do protótipo, por decisão de Jonathan Silva (Result).** A Cleo pré-aprovou no grupo, em 16/11/2026, o PRD v1.18 e a arquitetura v1.13 (14.2, item 8); a aprovação final vem junto com a do protótipo, em 04/12. A medição da aderência do protótipo ao PRD achou uma contradição: o CA-06.4 pede a etapa atual do escopo no dashboard, e o F13 não a listava. O F13 passa a mostrar a etapa atual dos escopos abertos no bloco Escopos, e cada número abre a lista de escopos filtrada pela etapa atual. Na seção 6.1, a demanda ganha uma nota explícita sobre a correção do Administrador entre status abertos, que a regra geral (RN-22) já previa. Sem mudança nas contagens: 136 critérios de aceite e aderência de 108%. |
| 1.21 | 19/11/2026 | **Marca da ELO no protótipo.** A Cleo enviou o branding em 18/11/2026 (14.2, item 7): o logo, só em PNG, foi vetorizado pela Result, e as fontes passam a ser Playfair Display nos títulos e Montserrat nos textos, com os números em JetBrains Mono. A paleta do branding vale só para o logo; a interface mantém a do padrão visual, por decisão de Jonathan Silva (Result). **Ajustes:** seção 10 e 14.2, item 7. Sem mudança em funcionalidades, regras ou critérios de aceite. |

## Como ler este documento

Cada afirmação traz a fonte entre colchetes. O que não está nas fontes aparece como **definição** (decisão nossa, validada pela Cleo, ver seção 14.3) ou como **pendência** (resposta que depende da ELO: da Cleo ou de quem ela indicar).

| Código | Fonte |
|---|---|
| [MVP §n] | Definição Funcional do MVP, versão consolidada, seção n (05/09/2026) |
| [R0709] | Reunião de avaliação com a Cleo (07/09/2026) |
| [KO] | Reunião de kickoff (30/10/2026) |
| [ATA] | Ata de alinhamento e diagnóstico inicial (30/10/2026) |
| [CTR] | Contrato Sebraetec SB.2038.26 |
| [PROP] | Proposta de serviço e anexos I e II |
| [JTBD] | Mapa de Jobs to be Done por perfil, FigJam (31/10/2026) |
| [FORM] | Respostas da Cleo ao formulário "Plataforma ELO · Decisões para fechar a documentação" (04/11/2026), ver seção 14 |
| [EX] | Documentos de exemplo enviados pela Cleo em 04/11/2026, na pasta `descoberta`: Teste de Maturidade e Prontidão do Fornecedor (modelo), avaliação e apresentação de resultados da DSI Network, propostas da DSI Network à FMC Logística, atestado de capacidade técnica e portfólio |
| [OSV] | Resposta do Osvaldo, que administra o site da ELO, sobre a plataforma e a hospedagem do site (04/11/2026) |
| [FORM2] | Respostas da Cleo ao formulário "Plataforma ELO · Validação das definições do PRD v1.13", com as 72 definições (08/11/2026), ver seção 14.3 |
| DF-nn | Definição, ver seção 13 |
| PD-nn | Pendência com a ELO, ver seção 14 |
| DT-nn | Detalhamento da documentação, ver seção 15 |
| D-nn | Decisão tirada dos edge cases (D-01 a D-24, seção "Fluxos dos jobs e edge cases" do FigJam) ou do ciclo de vida das entidades (D-25 a D-31, seção 6.1) ou da modelagem de dados da arquitetura (D-32, `docs/arquitetura.md`) ou das respostas da Cleo (D-33 a D-37, v1.9) ou do hardening da v1.10 (D-38). Cada uma virou definição ou pendência |

---

## 1. Visão geral

A Plataforma ELO é a base digital de operação da ELO HUB Governança Inteligente, consultoria que faz a gestão administrativa e a governança dos contratos de pequenas e médias empresas que prestam serviço a grandes contratantes [R0709].

O trabalho começa com um diagnóstico em duas frentes: o contrato, firmado ou pretendido, entre o cliente e o grande contratante, e a estrutura da empresa que vai executá-lo. Do cruzamento saem as lacunas e um modelo de gestão e fiscalização do contrato, com controles, indicadores e responsáveis. A ELO não substitui a equipe do cliente: orienta e conduz as práticas de governança para que ela conduza melhor o contrato [FORM PD-32, EX].

O MVP deve permitir que a ELO opere digitalmente o seu ciclo básico de governança e acompanhamento dos serviços contratados [MVP §1]:

> Cliente → Contrato → Escopo Contratado → Criticidade → Jornada ELO → Plano de Ação → Atividades → Documentos e Evidências → Central ELO → Resultados

O objetivo desta versão não é a plataforma definitiva, e sim uma base operacional funcional, organizada, rastreável, segura e preparada para evoluir [MVP §1].

**Quem usa no MVP:** somente a equipe interna da ELO, nos perfis Administrador ELO e Equipe ELO. Clientes e especialistas não têm login nesta versão [MVP §3.3, §3.4]. O site institucional funciona como porta de entrada, com formulários de solicitação de diagnóstico e de cadastro de especialistas [PROP, ATA].

**Princípios do produto** [MVP §2]: simplicidade operacional, facilidade de uso, baixo custo inicial de infraestrutura, rastreabilidade, proteção do Método ELO, autonomia tecnológica da ELO, segregação de informações, possibilidade de evolução, ausência de dependência obrigatória do desenvolvedor e prioridade para funcionalidades que geram valor direto à operação.

**Regra de controle de escopo** [MVP §32]: uma funcionalidade só entra no MVP se for indispensável para cadastrar e acompanhar cliente, contrato, Escopo Contratado, criticidade, Jornada ELO, planos de ação, atividades, documentos, demandas ou resultados. O restante vai para o roadmap.

---

## 2. Problema

### 2.1 O problema do cliente da ELO

- Fornecedores pequenos e médios que atendem grandes contratantes (no contexto de Macaé, por exemplo Petrobras e Porto do Açu) ficam focados em executar o escopo e não cuidam do instrumento contratual. Cumprem o escopo e têm prejuízo nas outras cláusulas [R0709].
- *"Ele acaba sendo bom de escopo, mas administrativamente ele não consegue performar"* [R0709].
- Essas empresas não têm áreas estruturadas (jurídico, financeiro, suprimentos, riscos, ESG etc.), porque cada área é cara para quem está começando [R0709].
- A informação do contrato fica fragmentada por área: para saber algo de sustentabilidade, SSO ou financeiro, é preciso depender do gestor de cada área [R0709].
- O nível de maturidade dos processos, e não o porte, define se a empresa consegue atender as exigências de um grande contratante [R0709].

### 2.2 O problema da operação da ELO

- A ELO é o primeiro negócio próprio da sócia e opera hoje sem ambiente digital de apoio. A gestão dos contratos dos clientes é manual [ATA §2].
- A proposta de valor depende de ter as informações do contrato prontas e resumidas, em tempo quase real (*"defasagem mínima de 24 horas"*), para decidir e conduzir reuniões [R0709].
- Montar apresentações à parte para cada reunião não escala: *"imagina em uma base muito grande de clientes, se a gente tiver que gerar qualquer coisa à parte, a gente não vai conseguir fazer com a mesma excelência"* [R0709].
- As demandas dos clientes chegam por vários canais (WhatsApp, e-mail, telefone, reunião) e precisam passar por triagem e chegar ao especialista certo, sem que o cliente fale direto com o especialista [R0709, MVP §12].
- O banco de especialistas e candidatos hoje está espalhado. A Cleo quer um canal único de entrada para não controlar em vários lugares [KO].

### 2.3 Dimensão do problema

Números informados pela Cleo [FORM PD-24]:

| Item | Hoje | Em 12 meses |
|---|---|---|
| Clientes atendidos | 2 | 10 |
| Contratos ativos, somando todos os clientes | 0 | 10 |
| Usuários da plataforma, incluindo a Cleo | 2 | 6 |
| Demandas por mês | Cerca de 5 | Não informado |

Os dados de clientes, especialistas, propostas e diagnósticos estão em parte em planilhas, documentos e arquivos, sem base única. O cadastro inicial é feito pela equipe ELO na própria plataforma (DF-46) [FORM PD-26].

---

## 3. Solução

Uma plataforma web interna que concentra, para cada cliente, os contratos e propostas com os contratantes, os escopos contratados, a criticidade, a Jornada ELO aplicada, os planos de ação, as atividades, os documentos, as demandas e o diagnóstico de maturidade. A partir disso, gera um painel operacional para a equipe e uma Visão Executiva por cliente, usada nas reuniões e com relatório em PDF [MVP §1, §21, §22, §23].

**Pilares da solução**

1. **Cadastro centralizado e feito pela ELO.** O cliente entrega o contrato numa reunião inicial e a equipe ELO faz todo o cadastro, o que reduz atrito e aumenta a segurança [R0709].
2. **O Escopo Contratado como unidade operacional.** Um contrato tem um ou mais escopos, e cada escopo tem a sua criticidade, a sua Jornada e os seus planos [MVP §7, §8].
3. **A Jornada ELO aplicada a cada escopo:** Diagnosticar → Estruturar → Implementar → Monitorar → Evoluir. O escopo pode começar em qualquer etapa e pular etapas [MVP §9].
4. **A Central ELO como canal único de demandas.** Toda demanda, de qualquer canal, é registrada pela equipe, triada, direcionada a quem atende (equipe ou especialista), acompanhada e encerrada. A criação dispara um e-mail [MVP §12, §13].
5. **Alertas internos** para vencimentos, atrasos e itens críticos [MVP §24].
6. **A Visão Executiva por cliente**, pronta para reunião ou projeção, sem montar apresentação à parte [MVP §22, R0709].
7. **Rastreabilidade e segregação:** quem fez o quê, quando e o que mudou, e cada usuário vê só o que o perfil e o vínculo permitem [MVP §20, §27, §28].
8. **O diagnóstico de maturidade do cliente**, com o resultado por dimensão e a evolução entre a primeira avaliação e a atual, que a Cleo cita como indicador desde 07/09 [R0709, EX] (F20).

**Relação com o Método ELO.** A Jornada representa como o trabalho avança. O Framework ELO representa as dimensões que sustentam o trabalho, nas camadas Governance Layer, Performance Layer, Intelligence Layer e Ecosystem Layer [MVP §9]. No MVP, critérios, pesos e regras proprietárias do método não são automatizados [MVP §8, §31]. Por isso o questionário do diagnóstico e o cálculo das notas ficam fora da plataforma, que guarda só o resultado (DF-78). O conteúdo metodológico é confidencial [PROP Anexo II].

---

## 4. Usuários e perfis

### 4.1 Perfis com login

**Administrador ELO.** Sócia administradora e quem ela designar. Tem acesso integral [MVP §3.1].
Job principal: *quando assumo a gestão dos contratos de um cliente, quero ter toda a governança do contrato organizada e visível num só lugar, para decidir rápido, evitar prejuízo e mostrar a evolução do cliente* [JTBD].

**Equipe ELO.** Analistas de contrato da Central ELO. Têm acesso operacional conforme o perfil e o vínculo, sem acesso às configurações gerais [MVP §3.2, R0709].
Job principal: *quando acompanho os escopos e demandas sob minha responsabilidade, quero saber o que fazer agora e registrar tudo sem esforço, para que nenhum prazo, demanda ou evidência se perca* [JTBD].

### 4.2 Perfis sem login no MVP

**Especialista.** Profissional do ecossistema ELO (jurídico, financeiro, suprimentos, riscos, ESG, contratos, fornecedores). É um cadastro vinculável a escopos e demandas, sem portal próprio [MVP §3.3, §14]. Não fala direto com o cliente: a Central faz a ponte [R0709]. Entra pelo formulário do site ou pelo cadastro interno [KO].

**Cliente da ELO.** Empresa contratante dos serviços da ELO, normalmente um fornecedor pequeno ou médio de um grande contratante. Exemplo real: a DSI Network, empresa de TI que presta serviços à FMC Logística [EX]. Não acessa a plataforma no MVP. Recebe o acompanhamento por reuniões, relatórios, Visão Executiva, documentos compartilhados e comunicação direta [MVP §3.4]. O acesso do cliente ao próprio painel foi pedido pela Cleo como diferencial de venda, fica fora do contrato Sebraetec e será objeto de proposta à parte [KO, ATA §3].

**Visitante do site.** Empresa que solicita diagnóstico ou profissional que se candidata a especialista, pelos formulários do site [MVP §29, PROP].

### 4.3 Matriz de permissões (MVP)

Legenda: ✔ permitido · ✖ não permitido · V = só nos clientes vinculados ao usuário (RN-01, DF-23).

| Ação | Administrador | Equipe | Fonte |
|---|---|---|---|
| Gerenciar usuários, perfis e vínculos | ✔ | ✖ | [MVP §3.1, §3.2] |
| Gerenciar listas oficiais (serviços, contratantes, categorias, dimensões de maturidade etc.) e parâmetros (prazos dos alertas, remetentes, referências de prazo e início da operação) | ✔ | ✖ | DF-01, DF-21, DF-22, DF-46, DF-70, DF-81 |
| Ver clientes | ✔ todos | V | [MVP §3.2], DF-23 |
| Cadastrar e editar clientes | ✔ | ✖ | [MVP §3.1, §3.2] |
| Ver contratos e propostas | ✔ todos | V | [MVP §3.2] |
| Cadastrar e editar contratos e propostas | ✔ | ✖ | [MVP §3.1] |
| Ver Escopos Contratados | ✔ todos | V | [MVP §3.2] |
| Cadastrar e editar Escopos Contratados | ✔ | ✖ | [MVP §3.1], DF-24 |
| Definir e alterar criticidade do escopo | ✔ | ✖ | [MVP §3.1], DF-24 |
| Desenhar a Jornada do escopo (marcar etapas como Não aplicável) | ✔ | ✖ | [MVP §3.1], DF-24 |
| Atualizar o andamento das etapas da Jornada (status, datas, observações, documentos) | ✔ | V | [MVP §9], DF-24 |
| Criar planos de ação | ✔ | V | [MVP §3.1, §3.2] |
| Criar e atualizar atividades | ✔ | V | [MVP §3.1, §3.2] |
| Registrar, triar e atender demandas da Central | ✔ | V (registrar: qualquer cliente Ativo, DF-39) | [MVP §3.1, §3.2], DF-39 |
| Cadastrar e editar especialistas | ✔ | ✖ | [MVP §3.1] |
| Consultar especialistas (para direcionar demandas) | ✔ | ✔ | DF-02 |
| Incluir documentos e fazer download | ✔ | V. Documento do Especialista sem cliente: baixa, mas não inclui (DF-65) | [MVP §20], DF-65 |
| Alterar dados de documentos (nome, categoria, data do documento, vínculos, observações; o arquivo muda por nova versão) | ✔ | V, exceto Documento do Especialista sem cliente (DF-65) | [MVP §20] "conforme permissão", DF-24, DF-44, DF-65, v1.19 |
| Alterar status de documentos | ✔ | ✖ (só marca Superado ao enviar o substituto, DF-44) | [MVP §20], DF-44 |
| Inativar registros | ✔ | ✖ | [MVP §3.1, §20], RN-24 |
| Reabrir status final e corrigir status fora das transições da seção 6.1, com justificativa | ✔ | ✖ | RN-17, RN-22 |
| Excluir de vez registro sem nada ligado | ✔ | ✖ | RN-13, DF-33 |
| Consultar o histórico de alterações de um registro | ✔ todos | V | F17, DF-16 |
| Ver avaliações de maturidade | ✔ todos | V | DF-79 |
| Criar e editar avaliação de maturidade Em elaboração | ✔ | V | DF-79 |
| Concluir e reabrir avaliação de maturidade | ✔ | ✖ | DF-79 |
| Ver dashboard | ✔ geral | V | [MVP §3.2] |
| Ver Visão Executiva e gerar PDF | ✔ | V | [MVP §3.2], DF-03 |
| Escrever "Principais resultados", "Observações executivas" e "Próximos passos" | ✔ | V | DF-73, DF-82 |
| Exportar listas para Excel/CSV | ✔ | ✖ | DF-75 |

---

## 5. Funcionalidades

Notação dos campos: **Obr.** = obrigatório · Auto = preenchido pelo sistema · Calc = calculado.

### F01. Acesso e gestão de usuários

**Objetivo.** Garantir que só a equipe ELO acesse a plataforma e que cada pessoa veja apenas o que lhe cabe [MVP §3, §28].

| Campo | Obr. | Observação |
|---|---|---|
| Nome | Sim | |
| E-mail | Sim | Login, único |
| Perfil | Sim | Administrador ELO ou Equipe ELO |
| Status | Sim | Ativo ou Inativo |
| Vínculos | Para Equipe | Clientes que o usuário acompanha, definidos pelo Administrador (DF-23) |

**Comportamento**
- Login com e-mail e senha. Recuperação de senha por e-mail (DF-04).
- Antes de a sessão expirar, a tela avisa o usuário, para evitar perda do que não foi salvo. É uma diretriz (DF-04).
- Não existe autocadastro. O Administrador cria o usuário, que recebe um convite por e-mail para definir a senha (DF-04).
- Usuário inativo não consegue entrar e continua aparecendo no histórico dos registros que criou.
- Nos campos de responsável (contrato, escopo, etapa, plano, atividade, triagem e atendimento, avaliador da avaliação de maturidade), só aparecem Administradores e usuários Equipe vinculados ao cliente do registro (RN-19, DF-35).
- Um usuário não é inativado, nem perde o vínculo com um cliente, enquanto for responsável por itens abertos (desse cliente, no caso do vínculo). O sistema lista os itens, e o Administrador os redistribui ali mesmo para outro responsável com vínculo, preservando o histórico das atribuições (RN-18, RN-19, DF-16, DF-36).
- O último Administrador ativo não pode ser inativado nem passar para o perfil Equipe (DF-37).

**Critérios de aceite**
- CA-01.1 Um usuário Equipe não vê, nem por busca nem por link direto, cliente, contrato, escopo, demanda, documento ou avaliação de maturidade fora dos seus vínculos. A única exceção é o nome dos clientes Ativos, ao registrar uma demanda (RN-01, DF-39).
- CA-01.2 Um usuário Equipe não vê o menu nem acessa as telas de usuários, de listas oficiais e de parâmetros.
- CA-01.3 Um usuário inativo recebe uma mensagem de acesso negado ao tentar entrar.
- CA-01.4 Só o Administrador cria, edita, inativa e vincula usuários.
- CA-01.5 A recuperação de senha envia um link de redefinição para o e-mail cadastrado.
- CA-01.6 Nos campos de responsável, a lista mostra só os Administradores e os usuários Equipe vinculados ao cliente do registro.
- CA-01.7 Ao tentar inativar um usuário, ou tirar o vínculo dele com um cliente, enquanto ele é responsável por itens abertos, o sistema impede a ação e lista esses itens.
- CA-01.8 Não é possível inativar o último Administrador ativo nem mudar o perfil dele para Equipe.
- CA-01.9 Na lista de itens abertos de um usuário, o Administrador escolhe um ou mais itens e um novo responsável com vínculo ao cliente, e a troca fica registrada (DF-16, DF-36).

### F02. Clientes [MVP §4]

| Campo | Obr. | Observação |
|---|---|---|
| Razão Social | Sim | |
| Nome Fantasia | Não | Nome exibido nas listas, quando houver |
| CNPJ | Sim | Único, com validação de formato e dígitos (DF-05) |
| Segmento | Não | Lista oficial (DF-70) |
| Cidade | Não | |
| Estado | Não | UF |
| Contato Principal | Não | |
| Cargo | Não | |
| Telefone | Não | |
| E-mail | Não | |
| Status | Sim | Prospect, Ativo, Inativo |
| Observações | Não | |

A obrigatoriedade acima é definição (DF-05). O MVP lista só "campos mínimos".

**Comportamento**
- O CNPJ identifica o cliente e não identifica o contrato [MVP §4].
- A página do cliente reúne contratos, escopos, demandas, documentos, avaliações de maturidade e o acesso à Visão Executiva (DF-06).
- A própria ELO fica cadastrada como cliente, só para registrar as demandas institucionais dela. Esse cadastro fica fora do total de clientes ativos (DF-40).

**Critérios de aceite**
- CA-02.1 Não é possível salvar dois clientes com o mesmo CNPJ.
- CA-02.2 Um CNPJ com formato ou dígito verificador inválido é recusado com mensagem clara.
- CA-02.3 A lista de clientes filtra por nome, status e segmento [MVP §25].
- CA-02.4 Um cliente inativo continua consultável com todo o histórico.

### F03. Contratos e propostas [MVP §5, §18]

É o contrato ou a proposta entre o cliente da ELO e o grande contratante, que a ELO ajuda a gerir e fiscalizar. O contrato da ELO com o cliente não é cadastrado (DF-66). Exemplo: as propostas da DSI Network à FMC Logística para implantar o Tactical RMM e o GLPI [EX]. Proposta e contrato são o mesmo registro, que evolui de status (DF-07).

| Campo | Obr. | Observação |
|---|---|---|
| Código/Número do contrato ou proposta | Sim | Único por cliente (DF-07, DF-47) |
| Cliente | Sim | |
| Contratante | Sim | Lista oficial de contratantes, como Petrobras, Porto do Açu e FMC Logística (DF-69) |
| Objeto | Sim | |
| Serviço Contratado | Sim | Um ou vários (DF-67), da lista oficial de serviços. A lista traz os serviços que o cliente presta ao contratante (DF-70) |
| Data da Proposta | Não | |
| Tipo de vigência | Sim | Prazo determinado (padrão), Prazo indeterminado, Renovação automática (DF-68) |
| Data de Início da Vigência | Quando Ativo | RN-03 |
| Data de Término da Vigência | Quando Ativo, exceto em Prazo indeterminado | RN-03, DF-68 |
| Valor | Não | R$ |
| Responsável ELO | Sim | Usuário com vínculo ao cliente (RN-19) |
| Status | Sim | Proposta, Em contratação, Ativo, Suspenso, Encerrado, Cancelado |
| Observações | Não | |
| Documento principal | Não | Documento da categoria Contrato ou Proposta Comercial (F12) |

**Comportamento**
- Cada contrato pertence a um cliente [MVP §5].
- Um contrato pode ter vários documentos (proposta aprovada, anexos, aditivos, termos complementares, referências). Um anexo nunca gera um novo registro de contrato [MVP §18].
- O vencimento da vigência não muda o status do contrato. Ativo é a situação do cadastro e não autoriza executar serviço depois do vencimento (DF-25). Para prorrogar, o Administrador anexa o aditivo e atualiza a data de término (na renovação automática, só atualiza a data, como abaixo); não há fluxo automático de aditivos ou renovação [MVP §6, §31] (DF-25).
- **Prazo indeterminado:** o contrato fica sem data de término e sem alerta de vencimento. **Renovação automática:** a data de término continua obrigatória; a cada renovação, o Administrador atualiza a data, sem aditivo, e o alerta avisa antes de cada fim de prazo. A renovação automática dentro da plataforma fica para evolução (DF-68, seção 11).
- Encerrado é o contrato que vigorou e terminou, no prazo ou antes, inclusive por rescisão. Cancelado é o contrato ou a proposta que não chegou a vigorar (DF-58). As transições estão na seção 6.1.

**Critérios de aceite**
- CA-03.1 Não é possível salvar um contrato sem cliente, código, contratante, objeto, serviço, tipo de vigência, responsável e status.
- CA-03.2 Não é possível colocar um contrato em Ativo sem data de início da vigência, nem sem data de término, exceto quando o tipo de vigência é Prazo indeterminado.
- CA-03.3 A data de término não pode ser anterior à de início.
- CA-03.4 Incluir um aditivo ou anexo não cria um novo contrato e aparece na lista de documentos do contrato.
- CA-03.5 A lista filtra por cliente, contratante, status e status da vigência [MVP §25].
- CA-03.6 Não é possível salvar dois contratos com o mesmo código no mesmo cliente. Clientes diferentes podem ter contratos com o mesmo código.
- CA-03.7 Um contrato aceita um ou mais serviços da lista oficial, e a lista de contratos filtra por serviço.

### F04. Vigência e alerta de vencimento [MVP §6]

| Dado | Tipo |
|---|---|
| Data de início da vigência | Do contrato |
| Data de término da vigência | Do contrato, vazia em Prazo indeterminado |
| Tipo de vigência | Do contrato (DF-68) |
| Dias restantes | Calc, vazio em Prazo indeterminado |
| Status da vigência | Calc: Vigente, Próximo do vencimento, Vencido, Encerrado |

**Comportamento.** O cálculo segue RN-04. O sistema gera um alerta interno para contratos próximos do vencimento, 30 dias antes do término, como o MVP define [MVP §6] (DF-34). Os 30 dias são um parâmetro que o Administrador altera na tela de configurações (DF-81). Contrato por prazo indeterminado não tem dias restantes nem alerta (DF-68). Contratos Vencidos também entram nos alertas, e os Próximos do vencimento e Vencidos ficam destacados no dashboard e nas listas (DF-25, DF-34). Contrato Suspenso tem identificação visual própria (DF-54).

**Critérios de aceite**
- CA-04.1 Um contrato Ativo com término dentro do prazo do alerta (30 dias, ou o valor do parâmetro, DF-81) aparece como "Próximo do vencimento" e entra nos alertas.
- CA-04.2 Um contrato Ativo com término anterior a hoje aparece como "Vencido".
- CA-04.3 Um contrato Encerrado ou Cancelado aparece com vigência "Encerrado" e sai dos alertas.
- CA-04.4 Os dias restantes são calculados a cada consulta, sem ação do usuário.
- CA-04.5 Um contrato Ativo que passa da data de término continua Ativo, com vigência "Vencido", e entra no indicador de contratos vencidos do dashboard.
- CA-04.6 Um contrato Suspenso tem status da vigência e alertas calculados como os de um contrato Ativo (RN-04, DF-54).
- CA-04.7 Um contrato Ativo de Prazo indeterminado aparece como "Vigente", sem dias restantes, e nunca entra nos alertas de vencimento.
- CA-04.8 Um contrato com vigência "Vencido" entra nos alertas, e os contratos Próximos do vencimento e Vencidos aparecem destacados no dashboard e na lista de contratos (DF-25, DF-34).
- CA-04.9 Um contrato Suspenso tem identificação visual diferente da de um contrato Ativo no dashboard e nas listas (DF-54).

### F05. Escopo Contratado e criticidade [MVP §7, §8]

O Escopo Contratado é a principal unidade operacional. Um contrato tem um ou mais escopos [MVP §7].

| Campo | Obr. | Observação |
|---|---|---|
| Nome do Escopo | Sim | |
| Descrição | Não | |
| Contrato Vinculado | Sim | |
| Cliente | Auto | Herdado do contrato (RN-02) |
| Responsável ELO | Sim | Usuário com vínculo ao cliente (RN-19) |
| Especialistas Vinculados | Não | Um ou vários (DF-32). Só especialistas Ativos (RN-14) |
| Data de Início | Não | |
| Data Prevista de Conclusão | Não | |
| Data Efetiva de Conclusão | Ao concluir | DF-08 |
| Status | Sim | Planejado, Em andamento, Em espera, Concluído, Cancelado |
| Prioridade | Sim | Baixa, Média, Alta |
| Criticidade | Sim | Baixa, Moderada, Alta, Crítica |
| Etapa Atual da Jornada ELO | Calc | RN-08 (DF-28) |
| Ciclo anterior | Não | Escopo do mesmo cliente que este continua, quando é um novo ciclo da Jornada (DF-57) |
| Observações | Não | |

**Criticidade** [MVP §8]. É atribuída ao escopo, não ao contrato, para que um mesmo contrato tenha escopos com tratamentos diferentes. É definida manualmente pela ELO (RN-07).

| Campo da criticidade | Obr. |
|---|---|
| Criticidade atual | Sim |
| Justificativa | Sim (DF-09) |
| Data da classificação | Auto |
| Responsável pela classificação | Auto (usuário logado) |
| Data da última alteração | Auto |

**Comportamento**
- Escopos e planos de ação podem ser criados num contrato em Proposta ou Em contratação, para registrar o diagnóstico antes da assinatura. Eles aparecem identificados como planejamento, separados dos serviços já formalizados (DF-48).
- O Administrador pode mover um escopo para outro contrato do mesmo cliente. Planos, atividades, Jornada, documentos e demandas ligados ao escopo vão junto (RN-02, DF-45).
- Uma data prevista de conclusão depois do término da vigência gera um aviso, que o usuário confirma para salvar (RN-21).

**Critérios de aceite**
- CA-05.1 Não é possível salvar ou alterar a criticidade sem justificativa.
- CA-05.2 Ao alterar a criticidade, o sistema atualiza a justificativa, o responsável e a data da última alteração [MVP §8].
- CA-05.3 Um escopo com criticidade Crítica entra nos alertas [MVP §24].
- CA-05.4 Um contrato pode ter escopos com criticidades diferentes.
- CA-05.5 A lista de escopos filtra por cliente, contrato, responsável, status, criticidade e prioridade [MVP §25].
- CA-05.6 O Administrador move um escopo para outro contrato do mesmo cliente, e tudo o que está ligado ao escopo passa a apontar para o novo contrato. A mudança fica registrada (DF-16).
- CA-05.7 É possível criar escopos e planos de ação num contrato em Proposta ou Em contratação.
- CA-05.8 Uma data prevista de conclusão do escopo depois do término da vigência do contrato mostra um aviso, e o usuário confirma para salvar (RN-21).
- CA-05.9 Um escopo ou plano de ação de contrato em Proposta ou Em contratação aparece identificado como planejamento nas listas, na página do escopo e na Visão Executiva (DF-48).
- CA-05.10 O escopo pode apontar para o escopo do ciclo anterior, do mesmo cliente, e cada um mostra o link para o outro (DF-57).

### F06. Jornada ELO [MVP §9]

Etapas oficiais: **Diagnosticar → Estruturar → Implementar → Monitorar → Evoluir**.

| Campo por etapa | Observação |
|---|---|
| Nome da etapa | Fixo |
| Status | Não iniciada, Em andamento, Concluída, Não aplicável |
| Responsável | Usuário com vínculo ao cliente (RN-19) |
| Data de Início | |
| Data de Conclusão | |
| Observações | |
| Documentos associados | Documentos e evidências vinculados à etapa (F12) |

**Comportamento** [MVP §9]: a Jornada pode começar numa etapa diferente da primeira, não percorrer todas, encerrar antes da última e avançar conforme a natureza do serviço. Ver RN-08. Cada escopo tem um único ciclo da Jornada: um novo ciclo depois de Evoluir é um novo escopo, que pode apontar para o anterior (DF-57). O progresso é o número de etapas Concluídas sobre o de etapas aplicáveis (DF-28). As bordas (etapa aplicável mínima, Não aplicável e reabertura) estão em DF-49.

**Critérios de aceite**
- CA-06.1 Todo escopo novo nasce com as 5 etapas em "Não iniciada".
- CA-06.2 É possível iniciar a Jornada em qualquer etapa e marcar etapas como "Não aplicável".
- CA-06.3 Uma etapa Concluída exige data de conclusão.
- CA-06.4 A etapa atual do escopo aparece na lista de escopos, no dashboard e na Visão Executiva.
- CA-06.5 O usuário Equipe atualiza status, datas, observações e documentos das etapas nos clientes vinculados, mas não marca etapas como "Não aplicável" nem altera o escopo ou a criticidade.
- CA-06.6 A etapa atual é calculada pela regra da RN-08 e muda sozinha quando o status de uma etapa muda; não é editável.
- CA-06.7 Não é possível marcar como Não aplicável a última etapa aplicável do escopo.
- CA-06.8 Uma etapa Em andamento, Concluída ou com documento vinculado não pode ser marcada como Não aplicável.
- CA-06.9 Só o Administrador reabre uma etapa Concluída.
- CA-06.10 O progresso da Jornada aparece junto da etapa atual, como etapas Concluídas sobre etapas aplicáveis, e muda sozinho quando o status de uma etapa muda; Não aplicável não conta (RN-08, DF-28).

### F07. Planos de ação [MVP §10]

| Campo | Obr. | Observação |
|---|---|---|
| Nome do Plano | Sim | |
| Escopo Contratado | Sim | |
| Cliente | Auto | Herdado do escopo |
| Descrição | Não | |
| Responsável | Sim | Usuário com vínculo ao cliente (RN-19) |
| Data de Criação | Auto | |
| Prazo | Não | |
| Status | Sim | Aberto, Em andamento, Concluído, Cancelado |
| Avaliação de maturidade | Não | Avaliação do mesmo cliente da qual o plano saiu, quando ele é um plano de desenvolvimento (F20, DF-80) |
| Observações | Não | |

**Critérios de aceite**
- CA-07.1 Um escopo pode ter vários planos de ação.
- CA-07.2 O plano mostra o total de atividades, as concluídas e as atrasadas.

### F08. Atividades [MVP §11]

| Campo | Obr. | Observação |
|---|---|---|
| Nome da Atividade | Sim | |
| Descrição | Não | |
| Plano de ação | Sim | |
| Responsável | Sim | Usuário com vínculo ao cliente (RN-19). Responde pela atividade e recebe os alertas |
| Executor | Não | Nome de quem executa, quando não é o responsável: pessoa do cliente ou especialista. Só texto, sem acesso à plataforma (DF-71) |
| Data de Criação | Auto | |
| Prazo | Sim (DF-10) | |
| Prioridade | Sim | Baixa, Média, Alta (DF-10) |
| Status | Sim | Não iniciada, Em andamento, Concluída, Cancelada |
| Data de Conclusão | Auto | Registrada ao marcar Concluída (DF-43) |
| Observações | Não | |
| Evidência/Documento associado | Não | F12 |
| Indicador "Atrasada" | Calc | RN-09 |
| Indicador "Próxima do prazo" | Calc | RN-10, DF-72 |

**Critérios de aceite**
- CA-08.1 Uma atividade com prazo vencido e status diferente de Concluída ou Cancelada aparece como Atrasada, sem ação manual.
- CA-08.2 Ao ser concluída, a atividade deixa de ser Atrasada.
- CA-08.3 Uma atividade dentro da janela de "próxima do prazo" aparece destacada e entra nos alertas.
- CA-08.4 O usuário Equipe vê uma lista "minhas atividades" com atrasadas e próximas do prazo no topo.
- CA-08.5 A lista filtra por responsável, status, prazo e escopo [MVP §25].
- CA-08.6 Ao marcar a atividade como Concluída, o sistema registra a data de conclusão, que aparece junto do prazo.
- CA-08.7 Um prazo de atividade depois do prazo do plano ou do término da vigência do contrato mostra um aviso, e o usuário confirma para salvar (RN-21).
- CA-08.8 O executor, quando informado, aparece na atividade, na lista de atividades e na Visão Executiva. Os alertas continuam indo para o responsável.

### F09. Central ELO [MVP §12]

Estrutura interna de registro, triagem, direcionamento, tratamento e acompanhamento de demandas. As demandas são registradas pela equipe ELO, qualquer que seja o canal de origem [MVP §12].

| Campo | Obr. | Observação |
|---|---|---|
| Número da Demanda | Auto | Sequencial (formato em DF-11) |
| Data de Abertura | Auto | |
| Cliente | Sim | |
| Contrato | Não | Do cliente selecionado (DF-12) |
| Escopo Contratado | Não | Do contrato selecionado (DF-12) |
| Origem | Sim | Cliente, Interna, Institucional, Especialista, Reunião, E-mail, Telefone/WhatsApp, Outro. "Interna" é a demanda levantada pela ELO sobre um cliente. "Institucional" é a demanda administrativa ou institucional da própria ELO, registrada no cadastro da ELO (DF-40) |
| Assunto | Sim | |
| Descrição | Sim | |
| Categoria | Na triagem | Lista oficial (DF-70) |
| Criticidade | Na triagem | Baixa, Moderada, Alta, Crítica |
| Responsável pela Triagem | Sim | Usuário com vínculo ao cliente (RN-19) |
| Responsável pelo Atendimento | Na triagem | Usuário com vínculo ao cliente (RN-19) |
| Especialistas Vinculados | Não | Um ou vários, conforme a complexidade. Com mais de um, um é marcado como principal (DF-32). Só especialistas Ativos |
| Prazo | Não | Informado na triagem. Se houver referência cadastrada para a criticidade, ela aparece como orientação, sem preencher o campo (DF-22) |
| Status | Sim | Nova, Em triagem, Em atendimento, Aguardando retorno, Resolvida, Encerrada |
| Comentários | Não | Histórico com autor e data. O tipo "Contato com especialista" guarda também o especialista e a data do contato (DF-30) |
| Anexos | Não | Documentos vinculados à demanda (F12) |
| Solução | Para resolver | RN-12 |
| Retorno ao cliente | Para encerrar depois de Resolvida | O que foi informado ao cliente (RN-12, DF-29) |
| Data de Encerramento | Auto | Ao encerrar |

**Comportamento**
- O usuário Equipe registra demanda para qualquer cliente Ativo, escolhendo só pelo nome, mesmo fora dos seus vínculos. A triagem fica com um Administrador ou um analista vinculado, e quem registrou não passa a ver o cliente (RN-01, DF-39).
- Em "Aguardando retorno" o prazo continua valendo, e a demanda vencida segue nos alertas. Quem atende ajusta o prazo combinado, e a mudança fica registrada (DF-16, DF-41).
- Se o cliente discorda da solução, a demanda Resolvida volta para Em atendimento, com comentário obrigatório (RN-12, DF-42).

**Critérios de aceite**
- CA-09.1 Ao salvar uma demanda nova, o sistema gera o número, registra a data de abertura e o status "Nova".
- CA-09.2 Não é possível passar para "Em atendimento" sem categoria, criticidade e responsável pelo atendimento.
- CA-09.3 Não é possível marcar como "Resolvida" sem preencher a solução.
- CA-09.4 Não é possível encerrar uma demanda Resolvida sem registrar o retorno ao cliente. Ao marcar como "Encerrada", o sistema registra a data de encerramento (RN-12, DF-29).
- CA-09.5 Uma demanda com prazo vencido e não resolvida, ou com criticidade Crítica, entra nos alertas [MVP §24].
- CA-09.6 Comentários mostram autor e data e não podem ser apagados por usuário Equipe.
- CA-09.7 A lista filtra por cliente, contrato, escopo, responsável, status, criticidade e período [MVP §25].
- CA-09.8 Só o responsável pelo atendimento ou o Administrador encerram a demanda; enquanto não há responsável pelo atendimento, o responsável pela triagem também encerra (DF-61). Ela pode ir de qualquer status aberto para "Encerrada" sem passar por "Resolvida", desde que a justificativa esteja no campo Solução.
- CA-09.9 Um usuário Equipe registra uma demanda para um cliente Ativo fora dos seus vínculos, vendo só o nome do cliente; depois de salvar, não tem acesso a ela.
- CA-09.10 Uma demanda em Aguardando retorno com prazo vencido continua nos alertas, e a alteração do prazo fica registrada com o prazo anterior e o novo, usuário, data e hora.
- CA-09.11 Uma demanda Resolvida só volta para Em atendimento com um comentário que explique o motivo.
- CA-09.12 Uma demanda aceita mais de um especialista Ativo. Com mais de um, é obrigatório indicar o principal (DF-32).
- CA-09.13 O contato com um especialista fica registrado na demanda, com o especialista, a data do contato e o autor, e não aparece na Visão Executiva nem no PDF (DF-30, DF-52).
- CA-09.14 Na triagem, ao escolher a criticidade, a tela mostra a referência de prazo cadastrada para ela, e o campo Prazo continua vazio até alguém preenchê-lo (DF-22).
- CA-09.15 A origem "Institucional" só é aceita em demanda do cadastro da ELO, e esse cadastro só aceita demandas dessa origem (DF-40).

### F10. Notificação por e-mail da Central ELO [MVP §13]

**Gatilho.** Registro de uma nova demanda.

**Destinatários.** O responsável pela triagem, o responsável pelo atendimento (quando já definido) e a caixa da Central, atendimento@elogovernance.com.br (DF-72). O especialista não recebe e-mail no MVP: o analista o aciona pelo canal dele (DF-30).

**Remetente.** O padrão é atendimento@elogovernance.com.br. O Administrador pode definir outro endereço do domínio para cada finalidade enviada pela aplicação: notificação de demanda e avisos dos formulários do site. Os e-mails de acesso (convite e senha) usam o remetente padrão (DF-21).

**Início da operação.** Até o Administrador registrar o início oficial da operação, as notificações de demanda não saem (DF-46).

**Conteúdo mínimo.** Número da demanda, cliente, Escopo Contratado (quando houver), assunto, descrição resumida, criticidade e responsável pelo atendimento (quando já definidos na criação), prazo (quando houver) e link para a demanda.

**Assunto.** `Nova Demanda Central ELO | [Número] | [Cliente] | [Criticidade]`

**Critérios de aceite**
- CA-10.1 Depois do início oficial da operação, ao criar uma demanda, o sistema dispara o e-mail para os destinatários definidos no mesmo momento (DF-46).
- CA-10.2 O link abre a demanda após o login, respeitando as permissões.
- CA-10.3 Uma falha de envio não impede o registro da demanda e fica registrada no log técnico.
- CA-10.4 O Administrador altera o remetente de cada finalidade entre endereços do domínio elogovernance.com.br, e o próximo e-mail já sai com o novo endereço (DF-21).
- CA-10.5 Antes do início oficial da operação, registrar uma demanda não dispara e-mail. Depois do início, dispara normalmente (DF-46).

### F11. Especialistas [MVP §14, ATA §6]

> Campos definidos pela ata (decisão 7): nome, data de nascimento, especialidade e contato, sem documentos sensíveis. O CPF/CNPJ previsto no §14 do MVP não é coletado. O campo "Documentos" do §14 vira a categoria "Documento do Especialista" em F12, ligada ao especialista e sem cliente obrigatório (DF-27, DF-65). Na v1.14, a Cleo pediu que a data de nascimento deixasse de ser obrigatória (DF-27).

| Campo | Obr. | Observação |
|---|---|---|
| Nome | Sim | |
| Data de nascimento | Não | [ATA §6], opcional desde a v1.14 (DF-27) |
| Especialidade | Sim | Lista oficial (DF-70) |
| Subespecialidade | Não | [MVP §14] |
| E-mail | Sim | Contato [ATA §6] |
| Telefone | Sim | Contato [ATA §6] |
| Cidade/UF | Não | [MVP §14] |
| Empresa | Não | [MVP §14] |
| Link do currículo ou LinkedIn | Não | Link, sem envio de arquivo pelo site (DF-27) |
| Origem | Auto | Site ou cadastro interno |
| Status | Sim | Em análise, Ativo, Inativo |
| Observações | Não | Uso interno |

**Comportamento**
- Uma candidatura vinda do site entra com status "Em análise" [ATA §5, KO].
- O especialista pode ser vinculado a escopos e demandas [MVP §14]. Ver RN-14.
- Uma candidatura com e-mail já cadastrado entra como candidatura nova, marcada "e-mail já cadastrado". O site nunca altera um cadastro existente. A Equipe consulta, no especialista, as outras candidaturas com o mesmo e-mail (DF-50).
- Um especialista com vínculos em escopos ou demandas abertos pode ser inativado. Os vínculos continuam, aparecem sinalizados para troca e geram alerta para o responsável até a troca (RN-14, DF-51).

**Critérios de aceite**
- CA-11.1 Uma candidatura enviada pelo site aparece na lista de especialistas com status "Em análise" e origem "Site".
- CA-11.2 Só especialistas Ativos aparecem para vínculo em escopos e demandas.
- CA-11.3 A lista filtra por status e especialidade.
- CA-11.4 No especialista dá para ver os escopos e demandas a que ele está ou esteve vinculado. O usuário Equipe só vê os dos clientes vinculados a ele (RN-01, DF-02).
- CA-11.5 Ao inativar um especialista com vínculos em escopos ou demandas abertos, os vínculos continuam e aparecem sinalizados nesses escopos e demandas.
- CA-11.6 Na página de um especialista aparecem as outras candidaturas com o mesmo e-mail, com a data e o status (DF-50).

### F12. Documentos e evidências [MVP §15 a §20]

**Categorias iniciais** [MVP §15]: Contrato, Proposta Comercial, Aditivo Contratual, Anexo Contratual, Termo Complementar, Relatório, Plano de Ação, Evidência, Documento do Cliente, Documento do Especialista, Documento do Escopo Contratado, Outros.

| Campo | Obr. | Fonte |
|---|---|---|
| Nome do Documento | Sim | [MVP §16] |
| Categoria | Sim | [MVP §16] |
| Cliente | Sim, exceto em Documento do Especialista, em que é opcional | [MVP §16], DF-65 |
| Especialista | Sim, em Documento do Especialista | [MVP §14], DF-27, DF-65 |
| Contrato Vinculado | Quando aplicável | [MVP §16] |
| Escopo Contratado | Quando aplicável | [MVP §16] |
| Etapa da Jornada | Opcional | [MVP §19], incluída para viabilizar evidência por etapa |
| Plano de Ação | Opcional | [MVP §19], incluída para viabilizar evidência por plano |
| Atividade Vinculada | Opcional | [MVP §16] |
| Demanda Vinculada | Opcional | [MVP §16] |
| Avaliação de maturidade | Opcional | Instrumento preenchido, apresentação de resultados e evidências do diagnóstico (F20, DF-78) |
| Data do Documento | Sim | [MVP §16] |
| Data de Inclusão | Auto | [MVP §16] |
| Responsável pelo Upload | Auto | [MVP §16] |
| Status | Sim | Vigente, Superado, Encerrado [MVP §17] |
| Substituído por | Quando Superado | DF-13 |
| Observações | Opcional | [MVP §16] |
| Arquivo | Sim | PDF, Word, Excel, PowerPoint, imagens (.jpg, .png) e e-mails salvos (.msg, .eml), até 10 MB (DF-72) |

**Status** [MVP §17]: Vigente (válido), Superado (mantido para histórico e substituído por um posterior), Encerrado (finalidade ou vigência encerrada).

**Acesso** [MVP §20]: perfil + vínculo ao cliente (DF-23), sem permissão individual por documento. Documento do Especialista sem cliente: só o Administrador inclui e altera, e os dois perfis consultam e baixam, como consultam especialistas (DF-02, DF-65). Quem altera os dados muda também a data do documento, com registro no histórico (DF-16); o arquivo muda só por nova versão (DF-44, v1.19).

**Critérios de aceite**
- CA-12.1 Não é possível salvar um documento sem nome, categoria, cliente, data e arquivo. Em Documento do Especialista, o especialista é obrigatório e o cliente é opcional (DF-65).
- CA-12.2 Um arquivo fora dos formatos ou do tamanho permitidos é recusado com mensagem clara.
- CA-12.3 Um documento vinculado a escopo, etapa, plano, atividade, demanda, especialista ou avaliação de maturidade aparece na tela de cada um desses registros.
- CA-12.4 Não é possível marcar um documento como Superado sem indicar o documento que o substitui, e os dois ficam ligados (RN-15, DF-63).
- CA-12.5 Um usuário Equipe não vê nem baixa documento de cliente ou escopo fora dos seus vínculos.
- CA-12.6 Só o Administrador altera status e inativa documentos. Exceção: ao incluir um documento como substituto de outro, o usuário Equipe marca o anterior como Superado, e os dois ficam ligados (DF-44).

### F13. Dashboard operacional [MVP §21]

| Bloco | Indicadores |
|---|---|
| Clientes | Total de clientes ativos |
| Contratos | Vigentes, próximos do vencimento, vencidos |
| Escopos | Total, por status, por criticidade e, nos escopos abertos, por etapa atual da Jornada (CA-06.4) |
| Atividades | Abertas, concluídas, atrasadas, próximas do prazo |
| Central ELO | Demandas abertas, por status, por criticidade |
| Alertas | Lista dos alertas ativos (F15) |

**Comportamento**
- O Administrador vê a carteira inteira. A Equipe vê os números dos seus vínculos e responsabilidades [MVP §3.2].
- Cada indicador abre a lista correspondente já filtrada (DF-14).
- Os dados vêm da própria plataforma. A Cleo aceita uma defasagem de até 24 horas [R0709], mas o dashboard reflete o estado atual ao ser aberto (DF-14).
- O total de clientes ativos não conta o cadastro da ELO (DF-40).
- Contratos Próximos do vencimento, Vencidos e Suspensos aparecem destacados (DF-25, DF-34, DF-54).
- A etapa atual conta só os escopos abertos, porque o escopo concluído ou cancelado já terminou a Jornada. Cada número abre a lista de escopos filtrada pela etapa atual, calculada pela RN-08 (DF-14, v1.20).

**Critérios de aceite**
- CA-13.1 Os números do dashboard batem com as listas filtradas correspondentes.
- CA-13.2 O usuário Equipe vê números calculados só sobre os seus vínculos.
- CA-13.3 Clicar num indicador abre a lista com o filtro aplicado.
- CA-13.4 O total de clientes ativos e a lista aberta por ele não incluem o cadastro da ELO (DF-40).

### F14. Visão Executiva do cliente e relatório PDF [MVP §22, §23]

Visão gerencial de um cliente, usada internamente pela ELO em reuniões, relatórios e apresentações. No MVP é apresentada pela ELO ao cliente, que não tem login [MVP §22].

**Informações** [MVP §22]: cliente, contrato, Escopos Contratados, criticidade, etapa atual da Jornada, status, planos de ação, atividades concluídas, atividades pendentes, demandas abertas, demandas resolvidas, próximos prazos, pendências, principais resultados e observações executivas. Na v1.9 entra também a maturidade: a avaliação inicial e a atual, com o nível por dimensão, a maturidade geral e a prontidão (F20, RN-25).

**Textos por cliente.** "Principais resultados" e "Observações executivas" são dois textos por cliente, sempre atualizados, como o MVP descreve (DF-73). "Próximos passos", que o PDF do MVP pede [MVP §23], é um terceiro texto, com a mesma regra (DF-82). O Administrador e a Equipe vinculada escrevem, e a tela mostra quem atualizou por último e quando. A atualização fica registrada, com o texto anterior e o novo, e as versões anteriores não aparecem na Visão Executiva nem no PDF (DF-16, DF-82). Indicadores que não são estruturados no MVP, como não conformidades a tratar e fornecedores auditados, podem ser descritos aqui em texto (seção 11).

**De onde vem cada bloco** (DF-82). Proposta para o protótipo, que a DT-04 detalha no layout:

| Bloco | Conteúdo |
|---|---|
| Escopos contratados e situação atual | Escopos não cancelados: nome, contrato, contratante, status e prioridade. Escopos de contrato em Proposta ou Em contratação aparecem como planejamento (DF-48) |
| Criticidade | Criticidade de cada escopo, sem a justificativa |
| Etapa da Jornada ELO | Etapa atual de cada escopo e o status das 5 etapas |
| Planos de ação | Planos Abertos e Em andamento, com total de atividades, concluídas e atrasadas |
| Atividades concluídas e pendentes | Contagem por plano. As pendentes (Não iniciada e Em andamento) aparecem com prazo, responsável e executor |
| Demandas abertas e resolvidas | Contagem por status e lista das abertas: número, assunto, criticidade e prazo, sem comentários |
| Entregas realizadas | Atividades e etapas da Jornada concluídas nos últimos 30 dias, com a data de conclusão |
| Próximos prazos | Atividades e demandas com prazo nos próximos 30 dias e término da vigência dos contratos ativos nesse período |
| Pendências | Atividades atrasadas e demandas vencidas |
| Maturidade | Avaliação inicial e atual (F20) |
| Principais resultados, Observações executivas e Próximos passos | Os textos do cliente |

**Relatório PDF** [MVP §23, ATA §3]: entram todos os blocos da tela (DF-74): escopos contratados e situação atual, criticidade de cada escopo, etapa da Jornada ELO, planos de ação, atividades concluídas e pendentes, demandas abertas e resolvidas, entregas realizadas, próximos prazos, pendências, maturidade, principais resultados, observações executivas e próximos passos. O cabeçalho traz o nome do cliente, a data de emissão e a data da última atualização dos textos da Visão Executiva. A apresentação de resultados do diagnóstico da DSI Network serve de referência visual para o layout [EX] (DT-04).

**Nunca aparecem** na Visão Executiva nem no PDF, porque podem ir para o cliente e para os fornecedores dele: valor do contrato, observações internas dos cadastros e da avaliação de maturidade, comentários de demandas, justificativa da criticidade e dados de especialistas. O executor da atividade aparece, porque é escrito para isso (DF-71). A visão pode ser filtrada por contrato do cliente (DF-52).

**Critérios de aceite**
- CA-14.1 Ao escolher um cliente, a Visão Executiva mostra todos os blocos com dados atuais, sem montagem manual.
- CA-14.2 A tela é legível em projeção (1920×1080) em modo de tela cheia.
- CA-14.3 O PDF gerado reproduz os blocos da DF-74, com o nome do cliente, a data de emissão, a data da última atualização dos textos da Visão Executiva e a identidade visual da ELO.
- CA-14.4 O usuário Equipe só gera a Visão Executiva dos clientes vinculados.
- CA-14.5 A Visão Executiva e o PDF não mostram valor do contrato, observações internas, comentários de demandas, justificativa da criticidade nem dados de especialistas.
- CA-14.6 A Visão Executiva e o PDF podem ser filtrados por um contrato do cliente.
- CA-14.7 O Administrador e a Equipe vinculada editam "Principais resultados", "Observações executivas" e "Próximos passos" do cliente, e a tela mostra quem atualizou por último e quando.

### F15. Alertas internos [MVP §24]

| Alerta | Regra |
|---|---|
| Contrato próximo do vencimento | RN-04 |
| Contrato vencido | Vigência "Vencido", RN-04 (DF-25) |
| Atividade atrasada | RN-09 |
| Atividade próxima do prazo | RN-10 |
| Escopo Contratado crítico | Criticidade = Crítica |
| Demanda crítica | Criticidade = Crítica e não resolvida |
| Demanda vencida | Prazo vencido e status diferente de Resolvida e Encerrada |
| Especialista inativo em vínculo aberto | Escopo ou demanda abertos com especialista Inativo. Vai para o responsável do escopo ou da demanda (DF-51) |

No MVP os alertas são internos: aparecem no dashboard e nas listas (DF-15). Cada alerta mostra a criticidade do item quando ela existe: a do escopo, a da demanda ou, na atividade, a do escopo do plano. A lista traz primeiro os mais críticos (DF-15). Até o início oficial da operação, os alertas ficam ocultos (DF-46). Prazos e términos vencem no fim do dia, no horário de Brasília (RN-20). Contrato Suspenso gera alertas como um Ativo (RN-04, DF-54). Avisos externos por e-mail ou WhatsApp ficam para evolução [MVP §6, §13, §31].

**Critérios de aceite**
- CA-15.1 Cada alerta leva ao registro que o originou.
- CA-15.2 O alerta some sozinho quando a condição deixa de existir.
- CA-15.3 O usuário Equipe só vê alertas dos seus vínculos e responsabilidades.
- CA-15.4 Uma atividade ou demanda com prazo hoje não aparece como atrasada ou vencida. Passa a aparecer a partir da 0h do dia seguinte, no horário de Brasília.
- CA-15.5 Os alertas mostram a criticidade do item, quando ela existe, e a lista vem ordenada da maior para a menor criticidade (DF-15).
- CA-15.6 Um especialista inativado com vínculo em escopo ou demanda aberta gera um alerta para o responsável, que some quando o vínculo é trocado (DF-51).
- CA-15.7 Antes do início oficial da operação, os alertas não aparecem. Depois do início, aparecem normalmente, com a situação real da carteira (DF-46).

### F16. Pesquisa, filtros e exportação [MVP §25, §34]

| Lista | Filtros |
|---|---|
| Clientes | Nome, status, segmento |
| Contratos | Cliente, contratante, serviço, status, vigência |
| Escopos | Cliente, contrato, responsável, status, criticidade, prioridade |
| Central ELO | Cliente, contrato, escopo, responsável, status, criticidade, período |
| Atividades | Responsável, status, prazo, escopo |

- Busca rápida por nome do cliente ou número do contrato [R0709].
- Exportação para Excel/CSV, decisão de kickoff prevista no MVP §34: só o Administrador exporta, nas listas de clientes, contratos, atividades e demandas, em CSV, que abre no Excel (DF-75).

**Critérios de aceite**
- CA-16.1 A busca encontra o cliente pelo nome ou nome fantasia e o contrato pelo número.
- CA-16.2 Os filtros podem ser combinados e são mantidos ao voltar para a lista.
- CA-16.3 O Administrador exporta as listas de clientes, contratos, atividades e demandas, e a exportação respeita os filtros aplicados. O usuário Equipe não vê a opção de exportar.

### F17. Rastreabilidade e histórico [MVP §27]

O sistema registra criação e alteração relevante, com usuário, data e hora [MVP §27]. A pedido da Cleo, o registro guarda também o valor anterior e o novo, e a página de cada registro ganha um painel de histórico, só para leitura [FORM2]. Por decisão de Jonathan Silva (Result), em 10/11/2026, o painel é a versão mais enxuta do pedido: uma lista simples, sem filtro, busca, exportação ou destaque das diferenças. É um extra além do escopo contratado (Apêndice F). Não há tela central de auditoria. As alterações consideradas relevantes estão em DF-16.

**Critérios de aceite**
- CA-17.1 Todo registro mostra quem criou e quando, e quem alterou por último e quando.
- CA-17.2 As alterações relevantes (DF-16) ficam registradas automaticamente, com usuário, data e hora.
- CA-17.3 O painel de histórico do registro é uma lista só de leitura, da alteração mais recente para a mais antiga, e mostra, para cada alteração relevante, o valor anterior, o novo, o usuário, a data e a hora. Nenhum usuário edita ou apaga o histórico pela plataforma (DF-16).
- CA-17.4 Reabrir um status final, ou corrigir um status fora das transições da seção 6.1, exige justificativa, que fica no histórico com o status anterior e o novo (RN-22, DF-17, DF-64).

### F18. Inativação e encerramento [MVP §26]

Registros com histórico não são excluídos por usuários comuns. Em vez disso, são inativados, encerrados, cancelados ou marcados como superados [MVP §26]. Ver RN-13.

**Critérios de aceite**
- CA-18.1 Não há opção de excluir registros com histórico para o perfil Equipe.
- CA-18.2 Um registro inativado sai das listas padrão, mas aparece com o filtro "inativos" e continua no histórico.
- CA-18.3 Ao tentar encerrar, cancelar ou inativar um registro com itens abertos ligados a ele, o sistema impede a ação e lista os itens que precisam ser tratados, com tipo, status, responsável e link para cada um (RN-18, DF-26).
- CA-18.4 O Administrador exclui definitivamente um registro sem nada ligado a ele, depois de confirmar e escrever a justificativa, e a exclusão fica no log técnico, com usuário, data e justificativa; em registros com itens ligados, a opção de excluir não aparece (RN-13, DF-33).
- CA-18.5 Um item de lista oficial já usado em registros não pode ser excluído. Ao ser inativado, sai das novas escolhas e continua aparecendo nos registros que o usam. O Administrador consulta os itens inativos e os reativa, sem perder vínculos nem histórico (RN-13, DF-38).
- CA-18.6 Não é possível salvar dois itens com o mesmo nome na mesma lista oficial, sem diferenciar maiúsculas e acentos (DF-69).

### F19. Formulários do site [MVP §29, PROP, ATA]

A proposta prevê integrar o site atual da ELO a dois formulários e não inclui a reformulação completa do site [PROP]. A ata registra uma atualização do site institucional no fim do projeto, usando imagens da plataforma [ATA §3]. Em 31/10/2026 a Result decidiu atender a ata com o **redesenho da página do site institucional**, feito na fase final com imagens da plataforma. Entre a ata e a proposta, o que vale é o redesenho (decisão de Jonathan Silva, Result, em 10/11/2026), como extra além do escopo contratado (Apêndice F). O site atual é elogovernance.com.br, administrado pelo Osvaldo, publicado no ChatGPT Sites, da OpenAI, e feito em Next.js e React (DF-83). A integração dos formulários não depende do site, porque eles são páginas da própria plataforma (arquitetura, DA-02): o site só aponta para elas ou as incorpora. No redesenho, a Result entrega a página pronta, e o Osvaldo, que tem acesso ao código do site, a publica (DF-83).

**Solicitação de diagnóstico** (DF-76). Campos: nome, empresa, CNPJ, cargo, e-mail, telefone ou WhatsApp, cidade e estado, segmento de atuação, principais contratantes atendidos e mensagem ou necessidade, com consentimento LGPD. Obrigatórios: nome, empresa, CNPJ, e-mail e telefone. Ao enviar, a empresa entra como cliente Prospect, com o nome da empresa como razão social, e a caixa da Central recebe um e-mail (DF-72). Um CNPJ já cadastrado não gera cliente novo: os dados do pedido são acrescentados às observações do cliente e enviados por completo à caixa da Central, para análise e direcionamento. CNPJ inválido é recusado no formulário (DF-56). A tela confirma o envio com a mesma mensagem, com CNPJ já cadastrado ou não (Apêndice E).

**Cadastro de especialista.** Campos de F11 que o candidato preenche, sem envio de arquivos (o currículo é informado por link, DF-27), mais:
- aviso expresso de que o cadastro não garante contratação nem demanda e serve apenas como banco de candidaturas [ATA §5];
- consentimento para tratamento dos dados pessoais (RNF-05).
- reenvio com e-mail já cadastrado entra como candidatura nova, marcada, sem alterar o cadastro existente (DF-50).

**Critérios de aceite**
- CA-19.1 O envio do formulário de especialista cria o registro em F11 com status "Em análise" e confirma o recebimento na tela.
- CA-19.2 O formulário só é enviado com aceite do aviso e do consentimento.
- CA-19.3 O envio do formulário de diagnóstico cria o cliente Prospect com os dados do formulário, envia o aviso à Central e mostra a confirmação na tela. Com CNPJ já cadastrado, não cria cliente, acrescenta o pedido às observações do cliente, envia todos os dados à Central e mostra a mesma confirmação (DF-56, DF-76).
- CA-19.4 Os formulários têm proteção contra envio automatizado (spam).
- CA-19.5 A página do site institucional é redesenhada e publicada na fase final, com imagens da plataforma, e aprovada pela Cleo.
- CA-19.6 Uma candidatura com e-mail já cadastrado cria um registro novo marcado "e-mail já cadastrado" e não altera o cadastro existente.

### F20. Avaliação de maturidade [EX, R0709, FORM PD-32]

**Objetivo.** Registrar o diagnóstico de maturidade e prontidão que a ELO faz no cliente e mostrar a evolução entre a primeira avaliação e a mais recente. O diagnóstico abre o trabalho da ELO, e o plano de desenvolvimento sai dele [FORM PD-32, EX]. A Cleo pediu a maturidade inicial e atual como indicador em 07/09 [R0709] e a evolução da maturidade dos clientes como medida de sucesso [FORM PD-25].

**Decisão.** Incluir a avaliação de maturidade é decisão da Result, e a decisão é final (Jonathan Silva, 10/11/2026). É um extra além do escopo contratado (Apêndice F).

**Versão enxuta** (DF-78). A plataforma guarda o resultado da avaliação, e não o questionário. As perguntas, a evidência de cada item, as notas por pergunta, o cálculo das médias e da cobertura e os requisitos essenciais ficam no instrumento da ELO, o "Teste de Maturidade e Prontidão do Fornecedor", preenchido fora e anexado como documento [EX]. Assim o método não é automatizado nem exposto, como já acontece com a criticidade [MVP §8, §31] (RN-07, RN-25, RNF-06).

| Campo | Obr. | Observação |
|---|---|---|
| Cliente | Sim | |
| Contrato de referência | Não | Contrato ou proposta do cliente para o qual a prontidão é julgada. Traz o contratante e os serviços. Só contratos do mesmo cliente (RN-02) |
| Data da avaliação | Sim | |
| Avaliador | Sim | Usuário com vínculo ao cliente (RN-19) |
| Status | Sim | Em elaboração, Concluída |
| Nível por dimensão | Para concluir | Uma linha por dimensão da avaliação: Inicial, Básica, Em estruturação, Consistente, Avançada ou Não avaliada. As dimensões são as ativas na lista oficial (Apêndice C) quando a avaliação é criada |
| Média da dimensão | Não | De 1,00 a 5,00, copiada do instrumento pelo avaliador. A plataforma não calcula |
| Principal lacuna da dimensão | Não | Texto curto |
| Maturidade geral | Para concluir | Inicial, Básica, Em estruturação, Consistente, Avançada, Inconclusiva |
| Prontidão | Para concluir | Pronto, Pronto com condições, Não pronto no momento, Inconclusivo |
| Pontos fortes | Não | Texto |
| Lacunas prioritárias | Não | Texto |
| Recomendação ELO | Não | Texto, inclusive as condições para a contratação |
| Observações internas | Não | Nunca saem na Visão Executiva nem no PDF (DF-52) |
| Documentos | Não | Instrumento preenchido, apresentação de resultados e evidências (F12) |
| Planos de desenvolvimento | Não | Planos de ação ligados à avaliação (F07, DF-80) |

Os nomes dos níveis vêm das faixas de leitura da média no instrumento da Cleo (de 1,00 a 1,79 Inicial, até 4,20 a 5,00 Avançada), e a prontidão vem do parecer dele [EX]. A plataforma não converte a média em nível nem confere se os dois batem (RN-25).

**Comportamento**
- Um cliente tem várias avaliações ao longo do tempo. A primeira Concluída, pela data da avaliação, é a **inicial**; a última Concluída é a **atual**. Com uma só, ela é as duas. Na mesma data, vale a ordem de criação (RN-25).
- O avaliador informa os níveis, a maturidade geral e a prontidão. O sistema não calcula nada (RN-25).
- As dimensões são uma lista oficial que o Administrador edita (DF-01). Uma dimensão inativada continua nas avaliações que a usam, e as avaliações novas trazem só as ativas (DF-38). Uma dimensão criada depois não entra nas avaliações que já existem. Na comparação entre inicial e atual, a dimensão que falta numa das duas aparece como "Não avaliada".
- A equipe elabora a avaliação, e o Administrador conclui, porque o parecer de prontidão vai para o cliente e pode chegar ao contratante (DF-79).
- Das lacunas, a equipe cria planos de ação num escopo do cliente, ligados à avaliação. Sem contrato assinado, a oportunidade entra como contrato em Proposta, que já aceita escopos e planos (DF-48, DF-80).

**Critérios de aceite**
- CA-20.1 Não é possível salvar uma avaliação sem cliente, data, avaliador e status.
- CA-20.2 Não é possível concluir uma avaliação sem o nível de todas as dimensões dela ("Não avaliada" vale), a maturidade geral e a prontidão.
- CA-20.3 O contrato de referência só aceita contratos do mesmo cliente.
- CA-20.4 A página do cliente lista as avaliações e mostra, por dimensão, o nível da avaliação inicial e o da atual.
- CA-20.5 O usuário Equipe cria e edita avaliações Em elaboração dos clientes vinculados. Só o Administrador conclui e reabre.
- CA-20.6 A Visão Executiva e o PDF mostram a avaliação inicial e a atual, com o nível por dimensão, a maturidade geral e a prontidão. Não mostram avaliações Em elaboração nem observações internas. Com filtro por contrato, contam só as avaliações com esse contrato de referência.
- CA-20.7 Um plano de ação ligado a uma avaliação aparece na página dela, com o total de atividades, as concluídas e as atrasadas.
- CA-20.8 A média da dimensão, quando informada, só aceita valores de 1,00 a 5,00.

---

## 6. Regras de negócio

| ID | Regra | Fonte |
|---|---|---|
| RN-01 | **Segregação por perfil e vínculo.** Um usuário Equipe só acessa clientes, contratos, escopos, planos, atividades, demandas, documentos, avaliações de maturidade e indicadores dos clientes aos quais está vinculado. A regra vale para listas, buscas, links diretos, exportações e PDF. O vínculo é por cliente e mantido pelo Administrador; o campo "Responsável ELO" não define acesso (DF-23). Exceção: ao registrar uma demanda, o usuário Equipe escolhe qualquer cliente Ativo, vendo só o nome, e não passa a ter acesso a ele (DF-39). | [MVP §3.2, §20, §28] |
| RN-02 | **Herança de cliente.** Contrato pertence a um cliente; escopo herda o cliente do contrato; plano herda do escopo; atividade herda do plano. Um registro filho não pode apontar para cliente diferente do pai. A avaliação de maturidade, o contrato de referência dela e os planos ligados a ela são do mesmo cliente. O Administrador pode mover um escopo para outro contrato do mesmo cliente, e o que está ligado ao escopo vai junto (DF-45). | [MVP §5, §7, §10], DF-45 |
| RN-03 | **Datas de vigência.** Contrato Ativo exige data de início. Exige também data de término, exceto quando o tipo de vigência é Prazo indeterminado, em que o término fica vazio. Término maior ou igual ao início. | DF-07, DF-68 |
| RN-04 | **Status da vigência**, calculado a cada consulta com a data de hoje (RN-20): Encerrado se o contrato está Encerrado ou Cancelado; Vigente, sem dias restantes, se o tipo de vigência é Prazo indeterminado; Vencido se hoje é posterior ao término; Próximo do vencimento se faltam N dias ou menos para o término (N = 30, parâmetro, DF-81); Vigente nos demais casos. Contratos em Proposta ou Em contratação não têm status de vigência. Contrato Suspenso tem status de vigência e alertas como um Ativo (DF-54). O vencimento não altera o status do contrato: ele segue Ativo, com vigência "Vencido", até o Administrador encerrar ou prorrogar: por aditivo ou, na renovação automática, atualizando a data de término (DF-25, DF-68). | [MVP §6, §21] |
| RN-05 | **Alerta de vencimento.** Gerado quando o status da vigência é "Próximo do vencimento": 30 dias antes do término, valor que o Administrador pode alterar (DF-34, DF-81). Contrato por prazo indeterminado não gera alerta (DF-68). Quando a vigência fica Vencido, o alerta passa a ser de contrato vencido (DF-25). | [MVP §6] |
| RN-06 | **CNPJ.** Identifica o cliente, é único e não identifica contrato. | [MVP §4] |
| RN-07 | **Criticidade manual.** Definida pela ELO (Administrador), sempre com justificativa, e com histórico de alterações. Critérios, pesos e fórmulas proprietárias não são automatizados no MVP. | [MVP §8, §3.1] |
| RN-08 | **Jornada flexível.** Cada escopo tem as 5 etapas. Pode começar em qualquer uma, marcar etapas como Não aplicável e terminar antes da última. A etapa atual é calculada: a etapa "Em andamento" mais avançada; sem nenhuma em andamento, a última "Concluída"; sem nenhuma iniciada, "Não iniciada" (DF-28). Pelo menos uma etapa continua aplicável; etapa Em andamento, Concluída ou com documento não vira Não aplicável; só o Administrador reabre etapa Concluída (DF-49). Cada escopo tem um ciclo da Jornada; um novo ciclo é um novo escopo, que pode apontar para o anterior (DF-57). O progresso é o número de etapas Concluídas sobre o de etapas aplicáveis; Não aplicável não conta (DF-28). | [MVP §7, §9] |
| RN-09 | **Atividade atrasada.** Prazo vencido e status diferente de Concluída ou Cancelada. Indicador calculado, não é um status. O prazo vale até o fim do dia (RN-20). | [MVP §11] |
| RN-10 | **Atividade próxima do prazo.** Prazo entre hoje e os próximos N dias, inclusive, e status diferente de Concluída ou Cancelada. N = 5, parâmetro que o Administrador pode alterar (DF-72, DF-81). | [MVP §24, §34] |
| RN-11 | **Notificação de nova demanda.** Depois do início oficial da operação (DF-46), todo registro de demanda dispara o e-mail de F10. Falha de envio não bloqueia o registro. | [MVP §13] |
| RN-12 | **Ciclo da demanda.** "Resolvida": a solução foi registrada, e o campo Solução é obrigatório. "Encerrada": o retorno ao cliente foi dado e registrado, e a demanda foi arquivada, com registro da data de encerramento (DF-29). Normalmente Encerrada vem depois de Resolvida; uma demanda também pode ir de qualquer status aberto para Encerrada (duplicada, desistência), com a justificativa no campo Solução. Quem encerra é o responsável pelo atendimento ou o Administrador; enquanto não há responsável pelo atendimento, também o responsável pela triagem (DF-61). Só o Administrador reabre (RN-17). Se o cliente discordar da solução, a Resolvida volta para Em atendimento, com comentário obrigatório (DF-42). | [MVP §12], DF-29 |
| RN-13 | **Sem exclusão de histórico.** Registros com histórico não são excluídos por usuários comuns. Inativar é exclusivo do Administrador. O Administrador pode excluir definitivamente um registro sem nada ligado a ele (sem itens filhos, documentos, demandas ou comentários), com confirmação e justificativa, e a exclusão fica registrada no log técnico (DF-33). Item de lista oficial já usado é inativado, não excluído: sai das novas escolhas e fica nos registros (DF-38). | [MVP §26, §27, §3.1] |
| RN-14 | **Vínculo de especialista.** Só especialistas Ativos podem ser vinculados a escopos e demandas. Se o especialista for inativado, os vínculos antigos ficam no histórico, e os vínculos em escopos e demandas abertos continuam, sinalizados para troca e com alerta para o responsável (DF-51). | [MVP §14], DF-51 |
| RN-15 | **Documento superado.** Continua consultável para histórico e aponta para o documento que o substituiu. | [MVP §17] DF-13 |
| RN-16 | **Sem permissão por documento.** O acesso a documentos segue perfil + vínculo. Documento do Especialista sem cliente segue o acesso a especialistas (DF-65). | [MVP §20] |
| RN-17 | **Status finais.** Encerrado e Cancelado (contrato), Concluído e Cancelado (escopo e plano), Concluída e Cancelada (atividade), Concluída (etapa da Jornada e avaliação de maturidade) e Encerrada (demanda) são finais para o perfil Equipe. Só o Administrador reabre, com justificativa (RN-22). Transições na seção 6.1. | DF-17 |
| RN-18 | **Sem cascata: bloqueio.** Um registro não pode ser encerrado, cancelado ou inativado enquanto houver itens abertos ligados a ele, e o sistema lista quais são. Contrato: escopos e demandas abertos. Escopo: planos e demandas abertos e etapas da Jornada Em andamento (DF-59). Plano: atividades abertas. Cliente: contratos que não estejam Encerrados ou Cancelados, demandas abertas e avaliações de maturidade Em elaboração. Usuário: a inativação é bloqueada enquanto ele for responsável por itens abertos, e a remoção do vínculo com um cliente, enquanto ele for responsável por itens abertos desse cliente (DF-36). "Aberto" é qualquer status não final. | DF-26 |
| RN-19 | **Responsável com vínculo.** Os campos de responsável (contrato, escopo, etapa da Jornada, plano, atividade, triagem e atendimento da demanda e avaliador da avaliação de maturidade) aceitam só Administradores e usuários Equipe vinculados ao cliente do registro. Assim o responsável sempre vê o próprio item, e o link do e-mail abre. | DF-35 |
| RN-20 | **Contagem de prazos.** Datas são comparadas pelo dia no horário de Brasília (RNF-11). Um prazo ou término que cai hoje ainda está no prazo; o atraso ou o vencimento começa à 0h do dia seguinte. Vale para atividade, demanda e vigência. | DF-53 |
| RN-21 | **Datas fora da vigência ou do plano.** Prazo de atividade depois do prazo do plano ou do término da vigência, e conclusão prevista do escopo depois do término da vigência, geram um aviso claro na tela, que o usuário confirma para salvar, sem bloqueio. Contrato por prazo indeterminado não gera esse aviso. | DF-55 |
| RN-22 | **Correção e reabertura.** Entre status abertos, o Administrador move um registro livremente, cumprindo as exigências do status de destino; a Equipe faz só as transições da seção 6.1. Ao reabrir um status final, o Administrador escolhe o status aberto de destino. Toda reabertura, e toda correção fora das transições da seção 6.1, exige justificativa, registrada com o status anterior e o novo, usuário, data e hora (DF-16, DF-17). | DF-64 |
| RN-23 | **Registro em status final.** Contrato, escopo ou plano em status final não recebe escopos, planos ou atividades novos, e as etapas da Jornada de um escopo em status final não mudam. Documentos e demandas continuam podendo ser ligados a ele, como um aditivo tardio ou uma dúvida sobre contrato encerrado. Avaliação de maturidade Concluída não muda, mas continua recebendo planos de ação e documentos ligados (DF-80). | DF-60 |
| RN-24 | **O que é inativar.** Inativo é status em usuário, cliente e especialista, e sinal à parte do status em documento e item de lista oficial. Contrato, escopo, plano, atividade, demanda e avaliação de maturidade não são inativados: fecham pelos status finais. O registro inativo sai das listas padrão e continua no histórico (CA-18.2). | DF-62 |
| RN-25 | **Avaliação de maturidade.** O avaliador informa o nível de cada dimensão, a maturidade geral e a prontidão; o sistema não calcula notas, médias nem classificação, como na criticidade (RN-07). A avaliação inicial do cliente é a primeira Concluída, pela data da avaliação, e a atual é a última Concluída; com uma só, ela é as duas; na mesma data, vale a ordem de criação. Avaliação Em elaboração não conta. Com filtro por contrato na Visão Executiva, contam só as avaliações com esse contrato de referência. | [EX] DF-78 |

### 6.1 Ciclo de vida das entidades

Status de cada entidade, quem muda e em que condição. Consolida RN-12, RN-17, RN-18, as exigências dos critérios de aceite e as definições. A avaliação de maturidade entrou na v1.9 (F20). A arquitetura transforma estas tabelas em restrições do banco e cita esta seção, sem redefinir nada. Os diagramas de estado estão no FigJam, na seção 6 do PRD.

**Regras gerais**
- **Quem muda.** Conforme a matriz 4.3. Nas tabelas, "Equipe" é o usuário Equipe vinculado ao cliente (RN-01), e o Administrador faz tudo o que a Equipe faz.
- **Exigências.** Um status só é aceito com os campos que ele exige, qualquer que seja o perfil.
- **Status finais.** Só se chega a eles pelas transições listadas. Com itens abertos ligados, a ação é bloqueada e o sistema lista os itens (RN-18). Só o Administrador reabre (RN-17, RN-22).
- **Correção.** Entre status abertos, o Administrador move o registro livremente, cumprindo as exigências do destino (RN-22). A Equipe faz só as transições listadas.
- **Nada muda sozinho.** Nenhum status muda automaticamente, exceto a demanda, que nasce Nova (CA-09.1). O que o sistema calcula são indicadores: status da vigência (RN-04, DF-25), atrasada e próxima do prazo (RN-09, RN-10), etapa atual (RN-08, DF-28) e avaliação inicial e atual (RN-25).
- **Dentro de registro final.** Ver RN-23.
- **Inativar.** Ver RN-24.
- **Registro.** Toda mudança de status fica registrada com o status anterior e o novo, usuário, data e hora (DF-16). Reabertura de status final e correção do Administrador fora das transições listadas exigem justificativa (RN-22).

Legenda: "(novo)" = criação do registro.

#### Usuário
Status: Ativo, Inativo. Nenhum é final.

| De | Para | Quem | Condição | Fonte |
|---|---|---|---|---|
| (novo) | Ativo | Admin | Convite por e-mail para definir a senha | DF-04 |
| Ativo | Inativo | Admin | Não ser responsável por itens abertos e não ser o último Administrador ativo | DF-36, DF-37 |
| Inativo | Ativo | Admin | | CA-01.4 |

#### Cliente
Status: Prospect, Ativo, Inativo. Nenhum é final.

| De | Para | Quem | Condição | Fonte |
|---|---|---|---|---|
| (novo) | Prospect ou Ativo | Admin; pelo site, só Prospect | CNPJ válido e único | UC-05, DF-56, DF-76 |
| Prospect | Ativo | Admin | | F02 |
| Prospect, Ativo | Inativo | Admin | Sem contratos que não estejam Encerrados ou Cancelados, sem demandas abertas e sem avaliação de maturidade Em elaboração | RN-18 |
| Inativo | Prospect ou Ativo | Admin | | Seção 4.3 |

#### Contrato ou proposta
Abertos: Proposta, Em contratação, Ativo, Suspenso. Finais: Encerrado (vigorou e terminou, no prazo ou antes) e Cancelado (não chegou a vigorar) (DF-58). Só o Administrador muda.

| De | Para | Quem | Condição | Fonte |
|---|---|---|---|---|
| (novo) | Proposta, Em contratação ou Ativo | Admin | Ativo exige início da vigência e, fora do Prazo indeterminado, término | RN-03, DF-46, DF-68 |
| Proposta | Em contratação | Admin | | F03 |
| Proposta, Em contratação | Ativo | Admin | Início da vigência e, fora do Prazo indeterminado, término | CA-03.2 |
| Ativo | Suspenso | Admin | Vigência e alertas continuam | DF-54 |
| Suspenso | Ativo | Admin | | F03 |
| Ativo, Suspenso | Encerrado | Admin | Sem escopos e demandas abertos | RN-18, DF-58 |
| Proposta, Em contratação | Cancelado | Admin | Sem escopos e demandas abertos | RN-18, DF-58 |
| Encerrado, Cancelado | Status aberto | Admin | Reabertura | RN-17, RN-22 |

O vencimento não muda o status: o contrato segue Ativo, com vigência "Vencido" (DF-25).

#### Escopo Contratado
Abertos: Planejado, Em andamento, Em espera. Finais: Concluído, Cancelado. Só o Administrador muda (seção 4.3).

| De | Para | Quem | Condição | Fonte |
|---|---|---|---|---|
| (novo) | Planejado, Em andamento ou Em espera | Admin | Contrato não final; vale para contrato em Proposta ou Em contratação | DF-48, RN-23 |
| Planejado | Em andamento | Admin | | F05 |
| Em andamento | Em espera | Admin | | F05 |
| Em espera | Em andamento | Admin | | F05 |
| Status aberto | Concluído | Admin | Data efetiva de conclusão; sem planos e demandas abertos e sem etapa Em andamento | DF-08, RN-18 |
| Status aberto | Cancelado | Admin | Sem planos e demandas abertos e sem etapa Em andamento | RN-18 |
| Concluído, Cancelado | Status aberto | Admin | Reabertura | RN-17, RN-22 |

#### Etapa da Jornada
Abertos: Não iniciada, Em andamento, Não aplicável. Final: Concluída.

| De | Para | Quem | Condição | Fonte |
|---|---|---|---|---|
| (novo escopo) | Não iniciada, nas 5 etapas | Sistema | | CA-06.1 |
| Não iniciada | Em andamento | Equipe | | DF-24 |
| Em andamento | Não iniciada | Equipe | Desfaz o início | DF-24 |
| Não iniciada, Em andamento | Concluída | Equipe | Data de conclusão | CA-06.3 |
| Não iniciada | Não aplicável | Admin | Sem documento vinculado e com outra etapa aplicável | DF-49 |
| Não aplicável | Não iniciada | Admin | | DF-24 |
| Concluída | Não iniciada ou Em andamento | Admin | Reabertura | DF-49 |

Etapa Em andamento ou Concluída nunca vira Não aplicável (DF-49). Com o escopo em status final, as etapas não mudam (RN-23).

#### Plano de ação
Abertos: Aberto, Em andamento. Finais: Concluído, Cancelado.

| De | Para | Quem | Condição | Fonte |
|---|---|---|---|---|
| (novo) | Aberto | Equipe | Escopo não final | F07, RN-23 |
| Aberto | Em andamento | Equipe | | F07 |
| Em andamento | Aberto | Equipe | | F07 |
| Aberto, Em andamento | Concluído | Equipe | Sem atividades abertas | RN-18 |
| Aberto, Em andamento | Cancelado | Equipe | Sem atividades abertas | RN-18 |
| Concluído, Cancelado | Aberto ou Em andamento | Admin | Reabertura | RN-17 |

#### Atividade
Abertos: Não iniciada, Em andamento. Finais: Concluída, Cancelada.

| De | Para | Quem | Condição | Fonte |
|---|---|---|---|---|
| (novo) | Não iniciada ou Em andamento | Equipe | Prazo e prioridade; plano não final | DF-10, RN-23 |
| Não iniciada | Em andamento | Equipe | | F08 |
| Em andamento | Não iniciada | Equipe | | F08 |
| Não iniciada, Em andamento | Concluída | Equipe | O sistema registra a data de conclusão | DF-43 |
| Não iniciada, Em andamento | Cancelada | Equipe | | RN-17 |
| Concluída, Cancelada | Não iniciada ou Em andamento | Admin | Reabertura; a data de conclusão é apagada e registrada de novo na próxima conclusão | RN-17, DF-43 |

#### Demanda
Abertos: Nova, Em triagem, Em atendimento, Aguardando retorno, Resolvida. Final: Encerrada.

| De | Para | Quem | Condição | Fonte |
|---|---|---|---|---|
| (novo) | Nova | Equipe, para qualquer cliente Ativo | Número e data de abertura automáticos; dispara o e-mail depois do início oficial da operação | CA-09.1, DF-39, DF-46, RN-11 |
| Nova | Em triagem | Equipe | | F09 |
| Nova, Em triagem | Em atendimento | Equipe | Categoria, criticidade e responsável pelo atendimento | CA-09.2 |
| Em atendimento | Aguardando retorno | Equipe | O prazo continua valendo | DF-41 |
| Aguardando retorno | Em atendimento | Equipe | | F09 |
| Em atendimento, Aguardando retorno | Resolvida | Equipe | Solução preenchida | CA-09.3 |
| Resolvida | Em atendimento | Equipe | Comentário com o motivo | DF-42 |
| Resolvida | Encerrada | Responsável pelo atendimento ou Admin | Retorno ao cliente registrado; o sistema registra a data de encerramento | CA-09.4, CA-09.8, DF-29 |
| Nova, Em triagem, Em atendimento, Aguardando retorno | Encerrada | Responsável pelo atendimento ou Admin; enquanto não houver atendente, também o responsável pela triagem | Justificativa no campo Solução | CA-09.8, DF-61 |
| Encerrada | Status aberto | Admin | Reabertura; a data de encerramento é apagada | RN-12, RN-22 |

Entre status abertos, fora das linhas acima, vale a correção do Administrador: as exigências do status de destino e a justificativa, registrada com o status anterior e o novo (RN-22, CA-17.4, v1.20). A Encerrada volta só por reabertura.

#### Especialista
Status: Em análise, Ativo, Inativo. Nenhum é final. Só o Administrador muda.

| De | Para | Quem | Condição | Fonte |
|---|---|---|---|---|
| (novo, pelo site) | Em análise | Sistema | Candidatura repetida entra como nova, marcada | CA-11.1, DF-50 |
| (novo, interno) | Em análise ou Ativo | Admin | | F11 |
| Em análise | Ativo ou Inativo | Admin | Avaliação da candidatura | UC-04 |
| Ativo | Inativo | Admin | Vínculos abertos continuam, sinalizados para troca | DF-51 |
| Inativo | Ativo | Admin | | F11 |

Só especialista Ativo pode ser vinculado (RN-14).

#### Avaliação de maturidade
Aberto: Em elaboração. Final: Concluída.

| De | Para | Quem | Condição | Fonte |
|---|---|---|---|---|
| (novo) | Em elaboração | Equipe | Cliente, data e avaliador | CA-20.1, DF-79 |
| Em elaboração | Concluída | Admin | Nível de todas as dimensões da avaliação, maturidade geral e prontidão | CA-20.2, DF-79 |
| Concluída | Em elaboração | Admin | Reabertura | RN-17, RN-22 |

Planos de ação e documentos podem ser ligados a uma avaliação Concluída, porque o plano de desenvolvimento costuma vir depois do parecer (RN-23).

#### Documento
Status: Vigente, Superado, Encerrado. Nenhum é final. Só o Administrador altera status, com uma exceção (DF-44). A inativação é um sinal à parte do status (RN-24).

| De | Para | Quem | Condição | Fonte |
|---|---|---|---|---|
| (novo) | Vigente | Equipe; Documento do Especialista sem cliente, só Admin | Nome, categoria, data, arquivo e cliente, ou especialista em Documento do Especialista | CA-12.1, DF-65 |
| Vigente | Superado | Equipe, só ao incluir o substituto; Admin | Indicar o documento substituto | DF-44, RN-15, DF-63 |
| Vigente | Encerrado | Admin | | F12 |
| Superado, Encerrado | Vigente | Admin | Correção | CA-12.6 |
| Qualquer status | Inativo (sinal) | Admin | Sai das listas padrão e continua no histórico | CA-18.2, RN-24 |
| Inativo (sinal) | Status que tinha | Admin | | RN-24 |

#### Item de lista oficial
Status: Ativo, Inativo. Só o Administrador muda.

| De | Para | Quem | Condição | Fonte |
|---|---|---|---|---|
| (novo) | Ativo | Admin | | DF-01 |
| Ativo | Inativo | Admin | Sai das novas escolhas e continua nos registros | DF-38 |
| Inativo | Ativo | Admin | | DF-38 |

Excluir só se nunca foi usado (DF-38).

---

## 7. Casos de uso

Derivados do mapa JTBD [JTBD] e do fluxo consolidado do MVP [MVP §33]. Os fluxos alternativos e de exceção de cada caso de uso estão na seção 7.1.

| ID | Caso de uso | Ator | Gatilho | Resultado | Func. |
|---|---|---|---|---|---|
| UC-01 | Acessar a plataforma | Admin, Equipe | Início do trabalho | Usuário autenticado, vendo o que o perfil permite | F01 |
| UC-02 | Gerenciar usuários e vínculos | Admin | Pessoa entra ou sai da equipe; novo cliente | Usuário criado, vinculado ou inativado | F01 |
| UC-03 | Manter listas oficiais | Admin | Novo serviço, categoria ou especialidade | Listas atualizadas sem depender do desenvolvedor | F01, DF-01, DF-70 |
| UC-04 | Avaliar candidatura de especialista | Admin | Candidatura chega pelo site | Especialista Ativo ou Inativo | F11, F19 |
| UC-05 | Cadastrar cliente | Admin | Cliente fecha com a ELO ou solicita diagnóstico | Cliente Prospect ou Ativo | F02 |
| UC-06 | Registrar contrato ou proposta | Admin | Cliente entrega o contrato na reunião inicial | Contrato com vigência e documento principal | F03, F04, F12 |
| UC-07 | Desdobrar escopos e classificar criticidade | Admin | Contrato analisado | Escopos com prioridade e criticidade justificada | F05 |
| UC-08 | Aplicar a Jornada ELO ao escopo | Admin | Escopo estruturado | Etapas aplicáveis definidas e etapa inicial em andamento | F06 |
| UC-09 | Criar plano de ação e atividades | Admin, Equipe | Escopo pronto para execução | Plano com atividades, responsáveis e prazos | F07, F08 |
| UC-10 | Executar e atualizar atividades | Equipe, Admin | Trabalho do dia | Status atualizado, evidência anexada | F08, F12 |
| UC-11 | Registrar demanda | Equipe, Admin | Cliente aciona por qualquer canal | Demanda "Nova" com número e e-mail enviado | F09, F10 |
| UC-12 | Triar e direcionar demanda | Equipe, Admin | Demanda nova | Categoria, criticidade, prazo, atendente e especialista definidos | F09, F11 |
| UC-13 | Atender e encerrar demanda | Equipe, Admin | Demanda em atendimento | Solução registrada, demanda resolvida e encerrada | F09, F12 |
| UC-14 | Vincular especialista a escopo | Admin | Escopo exige especialidade | Especialista ligado ao escopo | F05, F11 |
| UC-15 | Incluir e substituir documentos | Equipe, Admin | Documento produzido ou recebido | Documento vinculado; versão anterior Superada | F12 |
| UC-16 | Monitorar carteira e alertas | Admin, Equipe | Início do dia ou da semana | Prioridades identificadas e alertas tratados | F13, F15 |
| UC-17 | Consultar cliente e contrato | Equipe, Admin | Cliente faz contato | Situação do contrato à mão | F02, F03, F16 |
| UC-18 | Apresentar a Visão Executiva e gerar PDF | Admin, Equipe | Reunião de performance | Visão projetada ou PDF entregue | F14 |
| UC-19 | Encerrar ou inativar registros | Admin | Fim de escopo, contrato ou relacionamento | Registro encerrado com histórico preservado | F18 |
| UC-20 | Solicitar diagnóstico | Visitante | Empresa quer se estruturar | Cliente Prospect criado e caixa da Central avisada | F19 |
| UC-21 | Candidatar-se como especialista | Visitante | Profissional quer entrar no ecossistema | Candidatura "Em análise" | F19, F11 |
| UC-22 | Avaliar a maturidade do cliente | Equipe, Admin | Diagnóstico inicial ou reavaliação | Avaliação concluída e plano de desenvolvimento criado | F20, F07 |

### Fluxos principais dos casos críticos

**UC-06 → UC-08 Do contrato à Jornada**
1. Admin abre o cliente e cria o contrato ou a proposta com código, contratante, objeto, serviços, responsável e status.
2. Informa o tipo de vigência e as datas, e anexa o documento principal.
3. O sistema calcula dias restantes e status da vigência.
4. Admin cria um ou mais escopos, com prioridade, criticidade e justificativa.
5. O sistema cria as 5 etapas da Jornada em "Não iniciada".
6. Admin marca etapas não aplicáveis e coloca a etapa inicial em andamento.

**UC-11 → UC-13 Da demanda à solução**
1. Cliente aciona a ELO por WhatsApp, e-mail, telefone ou reunião.
2. Equipe registra a demanda com cliente, origem, assunto e descrição, e opcionalmente contrato e escopo.
3. O sistema gera o número e envia o e-mail para triagem, atendimento e caixa da Central.
4. Na triagem, a equipe define categoria, criticidade, prazo e responsável pelo atendimento e, se precisar, vincula um ou mais especialistas, indicando o principal.
5. O atendimento acompanha com comentários e anexos. Status "Aguardando retorno" quando depende de terceiros. O contato com o especialista fica registrado na demanda (DF-30).
6. A equipe registra a solução e marca "Resolvida", dá o retorno ao cliente fora da plataforma, registra esse retorno e encerra.
*Alternativo:* se a demanda não tem escopo definido, fica ligada só ao cliente.

**UC-22 Do diagnóstico ao plano de desenvolvimento**
1. O avaliador aplica o Teste de Maturidade e Prontidão com o cliente, fora da plataforma [EX].
2. Cria a avaliação com cliente, data e, se houver, o contrato ou a proposta de referência.
3. Informa o nível de cada dimensão, a maturidade geral, a prontidão e a síntese, e anexa o instrumento preenchido e a apresentação de resultados.
4. O Administrador revisa e conclui. A avaliação passa a contar como inicial ou atual na página do cliente e na Visão Executiva.
5. A equipe cria planos de ação para as lacunas, ligados à avaliação, num escopo do cliente. O executor de cada atividade costuma ser o próprio cliente (DF-71).
6. Na reavaliação, uma nova avaliação é concluída, e a Visão Executiva passa a mostrar a inicial e a atual.

**UC-16 Monitoramento**
1. Usuário abre o dashboard.
2. Vê indicadores e alertas da sua carteira.
3. Clica num alerta ou indicador e vai para a lista filtrada ou para o registro.
4. Age: atualiza a atividade, redistribui, reclassifica (Admin) ou trata a demanda.

**UC-18 Reunião de performance**
1. Admin abre a Visão Executiva do cliente.
2. Projeta em tela cheia ou gera o PDF.
3. Usa os blocos para conduzir a reunião com o cliente ou com os fornecedores dele [R0709].

### 7.1 Fluxos alternativos e de exceção

O que acontece fora do caminho feliz de cada caso de uso, e a regra que responde. A base são os 139 edge cases (EC) dos fluxos por job no FigJam [JTBD], atualizados com as respostas da Cleo, mais os casos da avaliação de maturidade (UC-22), que entrou depois. Cada linha é testada na Etapa 4 pelo critério de aceite ou pelo cenário da regra citada (Apêndice D). (DT-01, feita na v1.12.)

| UC | Situação | O que acontece | Regra |
|---|---|---|---|
| UC-01 | Usuário inativo tenta entrar | Acesso negado, com mensagem | CA-01.3 |
| UC-01 | Esqueceu a senha | Recebe por e-mail o link de redefinição | CA-01.5 |
| UC-01 | 4 horas sem uso | A tela avisa antes de expirar, como diretriz. A sessão termina e pede novo login | DF-04 (EC-87) |
| UC-01 | Equipe abre o link direto de um registro fora dos vínculos | Acesso negado, no servidor e não só na tela | RN-01, RNF-02 (EC-53, EC-88) |
| UC-01 | Equipe tenta abrir usuários, listas ou parâmetros | O menu não aparece e a tela nega o acesso | CA-01.2 |
| UC-01 | Link de um e-mail aberto por quem não tem vínculo | Acesso negado; os destinatários dos e-mails sempre têm vínculo | RN-01, DF-35 (EC-89, EC-102) |
| UC-02 | Inativar ou rebaixar o último Administrador ativo | Impedido | DF-37 (EC-01) |
| UC-02 | Inativar usuário, ou tirar o vínculo dele, com itens abertos sob a responsabilidade dele | Bloqueia e lista os itens, e o Administrador pode redistribuí-los ali mesmo | DF-36 (EC-02, EC-54) |
| UC-03 | Excluir item de lista já usado | Não exclui; inativa. Some das novas escolhas e fica nos registros | DF-38 (EC-03) |
| UC-03 | Renomear item de lista | O novo nome vale para todos os registros que usam o item | DF-01 (EC-03) |
| UC-04 | Candidatura com e-mail já cadastrado | Entra como candidatura nova, marcada "e-mail já cadastrado"; o cadastro existente não muda, e a Equipe consulta as candidaturas anteriores | DF-50 (EC-05) |
| UC-04 | Candidato recusado pede a exclusão dos dados | Procedimento operacional, sem tela, com registro da solicitação, do titular, da data e do resultado | DF-19 (EC-04) |
| UC-04 | Inativar especialista com escopo ou demanda aberta | Permitido; os vínculos abertos ficam, sinalizados para troca e com alerta para o responsável | DF-51 (EC-06) |
| UC-05 | CNPJ inválido | Recusa, com mensagem | CA-02.2 (EC-07) |
| UC-05 | CNPJ já cadastrado | Bloqueia | CA-02.1 (EC-08) |
| UC-05 | Pedido de diagnóstico de quem já é cliente | Não cria cliente; o pedido fica nas observações do cliente e vai por completo à Central | DF-56, DF-76 (EC-09) |
| UC-05 | Cliente sem nenhum usuário Equipe vinculado | Só o Administrador vê; a Equipe ainda registra demanda para ele pelo nome | RN-01, DF-39 (EC-10) |
| UC-06 | Contrato vai para Ativo sem datas | Bloqueia; o término só fica vazio em Prazo indeterminado | CA-03.2, DF-68 (EC-12) |
| UC-06 | Término antes do início | Recusa | CA-03.3 (EC-13) |
| UC-06 | Prazo indeterminado ou renovação automática | Indeterminado: sem término e sem alerta. Renovação automática: o término é atualizado a cada renovação | DF-68 (EC-14) |
| UC-06 | Mesmo código em dois clientes, como num consórcio | Permitido; o código é único por cliente | DF-47 (EC-15, EC-130) |
| UC-06 | Mais de um serviço no contrato | Permitido, sem limite | DF-67 (EC-16) |
| UC-06 | Contrato cadastrado já vencido | Entra com vigência Vencido; o alerta aparece depois do início oficial da operação | DF-46 (EC-17) |
| UC-06 | Responsável sem vínculo com o cliente | Não aparece na lista de escolha | DF-35 (EC-18) |
| UC-06 | Aditivo ou anexo entregue junto | Vira documento do contrato, sem criar contrato novo | CA-03.4 (EC-129) |
| UC-06 | Vários contratos com o mesmo contratante | Um registro por contrato | [MVP §5] (EC-128) |
| UC-06 | Contrato com menos de 30 dias de duração | Entra no alerta de vencimento desde o início | RN-05 (EC-91) |
| UC-06 | Aditivo chega depois do vencimento | O contrato segue Ativo, com vigência Vencido, até o Administrador prorrogar | DF-25 (EC-44) |
| UC-07 | Criticidade sem justificativa | Não salva | CA-05.1 (EC-19) |
| UC-07 | Escopo no contrato errado, já com planos e demandas | O Administrador move o escopo para outro contrato do mesmo cliente, com tudo ligado a ele | DF-45 (EC-20) |
| UC-07 | Contrato ainda em Proposta ou Em contratação | Aceita escopos e planos | DF-48 (EC-21) |
| UC-07 | Conclusão prevista depois do fim da vigência | Aviso na tela, que o usuário confirma para salvar | RN-21 (EC-22) |
| UC-07 | Reclassificação da criticidade | Fica registrado quem mudou, quando, e os níveis anterior e novo | CA-05.2, DF-16 (EC-23) |
| UC-08 | Marcar todas as etapas como Não aplicável | Impedido; ao menos uma continua aplicável | DF-49 (EC-24, EC-95) |
| UC-08 | Não aplicável em etapa já iniciada, concluída ou com documento | Impedido | DF-49 (EC-25) |
| UC-08 | Começar direto em Implementar | Permitido | RN-08 (EC-26) |
| UC-08 | Novo ciclo depois de Evoluir | É um novo escopo, que pode apontar para o do ciclo anterior | DF-57 (EC-27) |
| UC-08 | Equipe tenta marcar Não aplicável ou reabrir etapa Concluída | Só o Administrador | CA-06.5, DF-49 (EC-56, EC-58) |
| UC-08 | Etapa marcada Concluída sem data | Exige a data | CA-06.3 (EC-55) |
| UC-08 | Etapa 4 concluída com a 2 em andamento | A etapa atual é a 2 | RN-08 (EC-57) |
| UC-08 | Todas as etapas aplicáveis concluídas | A etapa atual é a última concluída, e o escopo pode ser concluído | RN-08, DF-08 (EC-96) |
| UC-09 | Responsável sem vínculo com o cliente | Não aparece na lista | DF-35 (EC-28) |
| UC-09 | Quem executa é de fora da ELO, como o próprio cliente | O responsável é da ELO, e o executor é informado por nome | DF-71 (EC-29) |
| UC-09 | Prazo da atividade depois do prazo do plano ou da vigência | Aviso na tela, que o usuário confirma para salvar | RN-21 (EC-30) |
| UC-09 | Prazo já no passado | A atividade nasce Atrasada | RN-09 (EC-31) |
| UC-09 | Concluir plano com atividades abertas | Bloqueia e lista | RN-18 (EC-32) |
| UC-10 | Atividade concluída com atraso | A data de conclusão é gravada sozinha | DF-43 (EC-74, EC-103) |
| UC-10 | Cancelar atividade | Status final para a Equipe; só o Administrador reabre | RN-17 (EC-75) |
| UC-10 | Prazo que vence hoje | Ainda está no prazo; vira atraso à 0h do dia seguinte, no horário de Brasília | RN-20 (EC-40, EC-82, EC-104) |
| UC-10 | Atividade de contrato Suspenso | Os alertas continuam | DF-54 (EC-105) |
| UC-11 | Cliente fora dos vínculos de quem recebeu o pedido | A Equipe registra escolhendo o cliente Ativo pelo nome; a triagem fica com quem tem vínculo | DF-39 (EC-59, EC-131) |
| UC-11 | Mesmo pedido por dois canais | Uma das demandas é encerrada como duplicada, com justificativa | RN-12, DF-29 (EC-60, EC-133) |
| UC-11 | Demanda interna | Sempre sobre um cliente, que é obrigatório | DF-40 (EC-61) |
| UC-11 | Demanda administrativa ou institucional da própria ELO | Origem Institucional, no cadastro da ELO como cliente; o acesso segue o vínculo com esse cadastro | DF-40, RN-01 |
| UC-11 | Cliente Prospect, sem contrato | Só o cliente é obrigatório | DF-12 (EC-62) |
| UC-11 | Escopo de outro cliente | Bloqueia | DF-12, RN-02 (EC-63) |
| UC-11 | Falha no envio do e-mail | A demanda fica gravada, e a falha vai para o log técnico | RN-11, CA-10.3 (EC-97) |
| UC-11 | Virada do ano | A numeração recomeça com o ano novo | DF-11 (EC-98) |
| UC-11 | Especialista vinculado | Não recebe o e-mail; o analista o aciona | DF-30 (EC-100) |
| UC-11 | Carga inicial | Só demandas abertas entram, e nenhum e-mail de demanda sai até o início oficial da operação | DF-46 (EC-101) |
| UC-11 | Cliente fala direto com o especialista | Origem Especialista; a Central faz a ponte | F09 (EC-132) |
| UC-12 | Falta campo obrigatório da triagem | A demanda não vai para Em atendimento | CA-09.2 (EC-64) |
| UC-12 | Responsável pelo atendimento sem vínculo com o cliente | Não aparece na lista | DF-35 (EC-66) |
| UC-12 | Responsável pelo atendimento definido só na triagem | Não recebe e-mail; a demanda aparece na fila dele | F10 (EC-67, EC-83) |
| UC-12 | Prazo informado no passado | A demanda já entra como vencida | F15 (EC-68) |
| UC-12 | A demanda precisa de duas especialidades | Vincula os dois especialistas e indica o principal | DF-32 (EC-34) |
| UC-12 | Especialista Em análise ou Inativo | Não aparece para vínculo | CA-11.2 (EC-33) |
| UC-12 | Nenhum especialista Ativo na especialidade | Segue sem especialista; o campo é opcional | F09 (EC-36) |
| UC-12 | O especialista precisa do contexto da demanda | O analista repassa o recorte necessário pelo canal dele; o especialista não acessa a plataforma | DF-30, RNF-06 (EC-118) |
| UC-12 | O analista esquece de acionar o especialista | Só o prazo da demanda gera alerta | F15 (EC-120) |
| UC-13 | Prazo vence enquanto aguarda o cliente ou o especialista | O alerta continua; o analista ajusta o prazo, e a mudança fica registrada | DF-41 (EC-69, EC-121) |
| UC-13 | Cliente diz que não resolveu | Resolvida volta para Em atendimento, com comentário obrigatório | DF-42 (EC-70, EC-134) |
| UC-13 | Reabrir demanda Encerrada | Só o Administrador, que escolhe o status de volta e justifica | RN-17, RN-22 (EC-71) |
| UC-13 | Comentário errado | A Equipe não altera nem apaga | CA-09.6 (EC-72) |
| UC-13 | Duplicada ou desistência | Encerra sem resolver, com justificativa; sem atendente, quem fez a triagem também encerra | CA-09.8, DF-61 (EC-73) |
| UC-13 | Retorno ao cliente dado fora da plataforma | Quem encerra registra o retorno dado; sem ele, a demanda Resolvida não encerra | RN-12, DF-29 (EC-135) |
| UC-13 | Especialista recusa | Troca o vínculo; fica registrado quem mudou, quando, e os especialistas anterior e novo | DF-16, DF-32 (EC-35, EC-119) |
| UC-14 | Especialista Em análise ou Inativo | Não aparece para vínculo | CA-11.2 (EC-33) |
| UC-14 | Especialista inativado com vínculo aberto | O vínculo fica, sinalizado para troca | DF-51 (EC-37) |
| UC-15 | Arquivo fora do formato ou do tamanho | Recusa, com mensagem | CA-12.2, DF-72 (EC-77) |
| UC-15 | Nova versão de um documento | A Equipe marca o anterior como Superado ao enviar o substituto, que fica ligado a ele | DF-44, DF-63 (EC-79) |
| UC-15 | Arquivo errado | A Equipe não exclui; pede ao Administrador | CA-18.1 (EC-80) |
| UC-15 | Parecer com dado sensível do cliente | Acesso por vínculo, sem permissão por documento | RN-16 (EC-122) |
| UC-16 | Primeiro dia depois da carga inicial | Os alertas só aparecem depois do início oficial da operação, com a carteira já conferida | DF-46 (EC-38) |
| UC-16 | Clientes Prospect e Inativo | Ficam fora do total de clientes ativos | F13 (EC-39) |
| UC-16 | Contrato Suspenso | Continua gerando alertas | DF-54 (EC-41) |
| UC-16 | Redistribuir para analista sem vínculo com o cliente | Ele não aparece na lista | DF-35 (EC-42) |
| UC-16 | Mudar o prazo para apagar o atraso | Fica registrado quem mudou, quando, e os prazos anterior e novo | DF-16 (EC-43) |
| UC-16 | Registros inativos | Ficam fora dos números padrão | CA-18.2 (EC-107) |
| UC-17 | Cliente fora dos vínculos | Não aparece na busca, e o link direto nega o acesso | RN-01 (EC-52, EC-53) |
| UC-17 | Consulta pelo celular | Telas de consulta com boa leitura e navegação, como diretriz | DF-31 (EC-85) |
| UC-18 | Apresentação aos fornecedores do cliente ou PDF entregue a ele | Nunca mostra valor do contrato, observações internas, comentários, justificativa da criticidade nem dados de especialistas | DF-52 (EC-45, EC-86, EC-109, EC-138) |
| UC-18 | Cliente com vários contratos | Filtro por contrato, que vale também para a maturidade | DF-52, RN-25 (EC-46, EC-110) |
| UC-18 | Cliente fora dos vínculos | Não gera a visão nem o PDF | CA-14.4 (EC-84, EC-108) |
| UC-18 | Cliente ainda sem dados | Estados vazios, definidos depois do protótipo | DT-03 (EC-48) |
| UC-18 | Cliente com muitos escopos | PDF em até 10 segundos, como diretriz | RNF-08 (EC-111) |
| UC-18 | Cliente pede o indicador de maturidade | Aparece no bloco de maturidade, com a avaliação inicial e a atual | F20, CA-20.6 (EC-139) |
| UC-19 | Encerrar ou cancelar com itens abertos, inclusive etapa Em andamento | Bloqueia e lista quais são | RN-18, DF-59 (EC-49) |
| UC-19 | Registro criado por engano, sem nada ligado | Exclusão definitiva pelo Administrador, com confirmação, justificativa e log | DF-33 (EC-50) |
| UC-19 | Reabrir | Só o Administrador, que escolhe o status de volta e justifica; vigência e alertas voltam | RN-17, RN-22 (EC-51) |
| UC-19 | Inativar cliente com avaliação de maturidade Em elaboração | Bloqueia e lista | RN-18 |
| UC-20 | Envio automatizado | Descartado | CA-19.4 (EC-123) |
| UC-20 | Sem o consentimento LGPD | Não envia | CA-19.2, RNF-05 (EC-124) |
| UC-20 | CNPJ inválido ou de empresa já cadastrada | Inválido: recusa no formulário. Já cadastrado: não cria cliente, guarda o pedido nas observações e envia os dados à Central | DF-56, DF-76 (EC-126) |
| UC-21 | Sem o aceite do aviso ou do consentimento | Não envia | CA-19.2 (EC-113) |
| UC-21 | Envio automatizado | Descartado | CA-19.4 (EC-114) |
| UC-21 | Quer mandar o currículo em arquivo | Só por link; os arquivos do especialista são anexados pelo Administrador | DF-27, DF-65 (EC-115) |
| UC-21 | Envia de novo para atualizar os dados | Entra como candidatura nova, marcada; não sobrescreve | DF-50 (EC-116) |
| UC-22 | Concluir sem o nível de todas as dimensões, a maturidade geral ou a prontidão | Não conclui | CA-20.2 |
| UC-22 | Equipe tenta concluir ou reabrir | Só o Administrador | CA-20.5, DF-79 |
| UC-22 | Mudar uma avaliação Concluída | Não muda; continua recebendo planos e documentos ligados | RN-23 |
| UC-22 | Cliente sem contrato assinado | A avaliação fica sem contrato de referência; o plano de desenvolvimento entra num contrato em Proposta | DF-48, DF-80 |
| UC-22 | Contrato de referência de outro cliente | Não aparece na lista | CA-20.3 |
| UC-22 | Duas avaliações concluídas na mesma data | Vale a ordem de criação para saber qual é a inicial e qual é a atual | RN-25 |
| UC-22 | Média copiada não bate com o nível informado | O sistema aceita; não converte nem confere | RN-25 |
| UC-22 | Média fora de 1,00 a 5,00 | Recusa | CA-20.8 |
| UC-22 | Dimensão criada ou inativada depois | A avaliação existente mantém as dimensões dela; na comparação, a que falta aparece como Não avaliada | F20, DF-38 |

---

## 8. Métricas de sucesso

As métricas M-01 a M-07 foram propostas na v1, a partir das dores relatadas pela Cleo, e ela confirmou que fazem sentido [FORM PD-25]. As metas da M-04 e da M-05 são as sugeridas no formulário, que ela aceitou (DF-77). A M-07 foi marcada "faz sentido com ajuste", sem detalhe, e fica como está (decisão de 10/11/2026). A M-08 e a M-09 vêm das medidas que ela sugeriu e são acompanhadas como indicadores, sem meta no MVP; as outras sugestões dela dependem de módulos fora do MVP (seção 11).

| ID | Métrica | Como medir | Meta proposta | Origem |
|---|---|---|---|---|
| M-01 | Cobertura da carteira | Clientes e contratos ativos cadastrados ÷ total da carteira | 100% em até 30 dias após a entrega | [ATA §2] operação manual |
| M-02 | Vencimento sem surpresa | Contratos que chegam a "Vencido" sem nenhuma ação registrada na janela de alerta | 0 por trimestre | [MVP §6], [R0709] |
| M-03 | Central como canal único | Demandas registradas na Central ÷ demandas recebidas (amostragem nas reuniões) | 100% | [MVP §12] |
| M-04 | Tempo de triagem | Mediana, em dias úteis (segunda a sexta), entre abertura e "Em atendimento" | Mediana de até 1 dia útil | [MVP §12], [FORM PD-25] |
| M-05 | Atividades em atraso | Atividades atrasadas ÷ atividades abertas | Até 10%, com redução contínua | [MVP §11], [FORM PD-25] |
| M-06 | Reunião sem apresentação à parte | Reuniões de performance conduzidas pela Visão Executiva ou pelo PDF ÷ total de reuniões | 100% | [R0709] |
| M-07 | Adoção da equipe | Usuários ativos que acessam pelo menos 3 dias por semana | 100% da equipe | [R0709] resistência a sistemas |
| M-08 | Evolução da maturidade | Clientes reavaliados cuja maturidade geral atual está acima da inicial ÷ clientes reavaliados, sem contar avaliações Inconclusivas (RN-25) | Sem meta no MVP: acompanhada como indicador | [FORM PD-25], [R0709] |
| M-09 | Entregas no prazo | Atividades concluídas até o prazo ÷ atividades concluídas no período (DF-43) | Sem meta no MVP: acompanhada como indicador | [FORM PD-25] |

**Critério de aceite do projeto** (diferente das métricas do produto): todos os critérios de aceite deste documento validados um a um na Etapa 4 [PROP, CTR].

---

## 9. Requisitos não funcionais

Os requisitos marcados como **Diretriz** não constam da proposta. Eles orientam o desenvolvimento, mas não são critérios de aceite do contrato. São considerados durante todo o desenvolvimento e na homologação, sem parâmetros técnicos rígidos além do MVP (DF-20).

| ID | Requisito | Fonte |
|---|---|---|
| RNF-01 | **Autenticação.** E-mail e senha, senhas armazenadas com hash, recuperação por e-mail, sessão que expira após inatividade. | [MVP §28] DF-04 |
| RNF-02 | **Autorização no servidor.** Perfil e vínculo aplicados no acesso aos dados, não só na interface. | [MVP §20, §28] |
| RNF-03 | **HTTPS** em todo o tráfego. | [MVP §28] |
| RNF-04 | **Backup.** Rotina pelo menos diária, com retenção mínima de 30 dias, cópia em armazenamento seguro e independente do ambiente principal, procedimento de restauração testado antes da entrega e testes periódicos de recuperação. O plano inicial previsto para o banco não inclui backup automático [PROP Anexo I]; a arquitetura resolve na DA-01 e na DA-07. A frequência dos testes e quem os faz depois da entrega estão a alinhar (14.3). | [MVP §28, ATA §3, FORM2] DF-18 |
| RNF-05 | **LGPD.** Dados pessoais mínimos (contatos de clientes, dados de especialistas), consentimento nos formulários do site, acesso restrito por perfil, possibilidade de excluir dados de candidatos recusados a pedido e prazo de guarda dos dados dos formulários (DF-19). | [MVP §28] DF-19 |
| RNF-06 | **Confidencialidade do Método ELO.** Conteúdo metodológico não exposto fora da plataforma e não reutilizado. | [PROP Anexo II] |
| RNF-07 | **Rastreabilidade** de criação e alteração relevante, com valor anterior e novo (F17). | [MVP §27], DF-16 |
| RNF-08 | **Diretriz de desempenho.** Listas e telas principais abrem em até 3 segundos e o PDF é gerado em até 10 segundos, no volume previsto (seção 2.3). | DF-20 |
| RNF-09 | **Dispositivos.** Web, desktop como uso principal. Projeção da Visão Executiva em 1920×1080. Aplicativo móvel fora do MVP. Diretriz: as telas de consulta (dashboard, cliente, contrato, escopo, demanda e Visão Executiva) oferecem boa leitura e navegação no navegador do celular; cadastros e tabelas são pensados para desktop (DF-31). | [R0709, MVP §31] |
| RNF-10 | **Diretriz de navegadores.** Versões atuais de Chrome, Edge, Firefox e Safari. | DF-20 |
| RNF-11 | **Localização.** Português do Brasil, datas dd/mm/aaaa, moeda R$, fuso America/Sao_Paulo. | DF-20 |
| RNF-12 | **Custo de infraestrutura.** Cenário inicial da proposta em torno de R$ 105 por mês, com caminho de crescimento documentado. A arquitetura adota cerca de R$ 235 por mês, com o banco no plano pago por causa do backup (DA-01). A cópia de 30 dias da DF-18 soma o custo de um armazenamento externo, com valor definido na escolha do provedor (DA-07). A ELO assume esses custos. | [PROP Anexo I, ATA §5] |
| RNF-13 | **Autonomia tecnológica.** Contas de hospedagem, banco e e-mail criadas em nome da ELO desde o início do projeto. O repositório fica no GitHub de Jonathan Silva (Result) durante a prototipação e é transferido para a conta da ELO com a aprovação do protótipo (decisão de 10/11/2026). Documentação suficiente para outro fornecedor manter o sistema. Domínio, DNS, código-fonte, hospedagem e acessos administrativos ficam sob controle da ELO, e as responsabilidades de configuração, publicação, manutenção e segurança estão na seção 8 da arquitetura (DF-83). | [MVP §2, PROP Anexo II, ATA §5, CTR cl. 10] |
| RNF-14 | **Usabilidade.** Operação aprendida em uma sessão de capacitação; formulários curtos; o cliente não preenche nada na plataforma, além do formulário de diagnóstico do site. | [R0709, PROP Etapa 4] |
| RNF-15 | **E-mail transacional.** Enviado a partir do domínio da ELO, elogovernance.com.br, pelo serviço de e-mail previsto na proposta. O remetente padrão é atendimento@elogovernance.com.br, e o Administrador pode definir outros endereços do domínio conforme a finalidade (DF-21). | [MVP §13, PROP Anexo I] DF-21, DF-72 |
| RNF-16 | **Diretriz de acessibilidade.** Contraste legível e navegação por teclado nas telas principais, tendo a WCAG 2.1 AA como referência. | DF-20 |
| RNF-17 | **Publicação.** A plataforma é publicada num subdomínio de elogovernance.com.br, com o nome definido pela ELO; a Cleo considerou boa a sugestão app.elogovernance.com.br [FORM2]. O Osvaldo cria os registros de DNS no início da Etapa 3 (DF-83). | [ATA §5, PROP Etapa 3, OSV] |

---

## 10. Mapa de telas

Derivado dos casos de uso. É a lista de telas do protótipo da Etapa 2 e das rotas da arquitetura (seção 3.2 de `docs/arquitetura.md`).

| Área | Telas | UC |
|---|---|---|
| Acesso | Login · Recuperar senha · Definir senha (convite) | UC-01 |
| Início | Dashboard operacional com alertas | UC-16 |
| Clientes | Lista · Cadastro/edição · Página do cliente (contratos, escopos, demandas, documentos, avaliações de maturidade, Visão Executiva) | UC-05, UC-17 |
| Maturidade | Cadastro/edição da avaliação · Página da avaliação (níveis por dimensão, parecer, documentos, planos de desenvolvimento) | UC-22 |
| Contratos | Lista · Cadastro/edição · Página do contrato (vigência, escopos, documentos) | UC-06 |
| Escopos | Lista · Cadastro/edição · Página do escopo (criticidade e histórico, Jornada, planos e atividades, especialistas, documentos, demandas) | UC-07, UC-08, UC-14 |
| Planos e atividades | Página do plano com atividades · Minhas atividades | UC-09, UC-10 |
| Central ELO | Fila de demandas · Nova demanda · Página da demanda (triagem, atendimento, comentários, contato com especialista, anexos, solução e retorno ao cliente) | UC-11 a UC-13 |
| Especialistas | Lista (com filtro de candidaturas) · Cadastro/edição · Página do especialista | UC-04, UC-14 |
| Documentos | Lista · Inclusão · Página do documento | UC-15 |
| Visão Executiva | Visão por cliente, legível em projeção, com edição dos textos · Gerar PDF | UC-18 |
| Configurações (Admin) | Usuários e vínculos · Listas oficiais · Parâmetros (prazos dos alertas, remetentes, referências de prazo e início da operação) | UC-02, UC-03 |
| Site | Formulário de diagnóstico · Formulário de especialista · Confirmação · Página institucional redesenhada | UC-20, UC-21, F19 |

O padrão visual do protótipo usa a marca da ELO: o logo e as fontes do branding que a Cleo enviou em 18/11/2026, com Playfair Display nos títulos e Montserrat nos textos, os números em JetBrains Mono e a paleta azul-marinho e dourado do padrão visual. A paleta do branding vale só para o logo (decisão de Jonathan Silva, v1.21). A página institucional redesenhada fica para a parte final do desenvolvimento, com imagens da plataforma pronta (F19). As páginas de registro têm um painel de histórico, só para leitura (F17).

---

## 11. Fora do escopo do MVP

Do MVP [MVP §31] e da ata [ATA §3]: portal do cliente, portal do especialista, aplicativo móvel, integrações com SAP, SAP Ariba, SharePoint e Power BI, BI avançado, inteligência artificial, automações complexas, assinatura eletrônica, GED avançado, workflow documental, marketplace, pagamentos a especialistas, agenda, integração com WhatsApp, cálculo automático completo da criticidade, modelos preditivos, automação integral do Método ELO, notificações externas avançadas, controle sofisticado de versões e OCR.

Evoluções já citadas: múltiplos alertas configuráveis (no MVP, só o prazo de cada alerta é parâmetro, DF-81), aviso de vencimento por WhatsApp, automação de renovação, cálculo de reajuste, workflow de aditivos, e-mail de vencimento [MVP §6]; e-mails por mudança de status, reclassificação, proximidade do prazo, demanda vencida, encerramento e comunicação automática ao cliente [MVP §13].

Acesso do cliente ao próprio painel: fora do contrato Sebraetec, proposta à parte [KO, ATA §3].

Reformulação completa do site: fora [PROP]. O redesenho da página institucional entra por decisão da Result (F19, v1.2), como extra além do escopo contratado (Apêndice F).

Movido para fora na v1.2: acompanhamento de validade de documentos e alerta [MVP §6]. A proposta prevê alerta de vencimento só para contratos.

Fora na v1.9, a partir das respostas da Cleo:
- O questionário do diagnóstico na plataforma: perguntas, evidência e nota por item, cálculo das médias e da cobertura, requisitos essenciais e assinatura de ciência. O instrumento continua fora e é anexado à avaliação (DF-78).
- Configuração de regras, etapas da Jornada, status e fluxos de trabalho por cliente ou contrato, e modelos de plano de ação. A própria Cleo pediu começar pelas parametrizações essenciais (DF-81).
- Matriz de obrigações contratuais com indicador de cumprimento, e controle da documentação dos fornecedores em conformidade, sugeridos por ela como medidas de sucesso [FORM PD-25].
- Cadastro do contrato da ELO com o cliente (DF-66).

Registrado para evolução na v1.14, a partir da validação da Cleo [FORM2]:
- Cadastro de empresas em abertura ou regularização, sem CNPJ válido. O MVP mantém a validação dos cadastros convencionais (DF-05).
- Automação da avaliação de maturidade. A estrutura da F20 permite essa evolução sem reconstrução, e o instrumento continua protegido e sob controle da ELO (DF-78).

Movidos para fora na v1.1, por não constarem da proposta:
- Indicadores estruturados de não conformidades e fornecedores auditados, citados em 07/09. Podem ser descritos em texto em "Principais resultados". A maturidade inicial e atual, citada na mesma reunião, entrou na v1.9 (F20).
- Prazo automático da demanda por criticidade (SLA). É automação fora do MVP [MVP §31]; o prazo é informado na triagem. A referência de prazo por criticidade, só como orientação, entrou na v1.14 (DF-22).
- Importação automática de dados existentes. O cadastro inicial é feito pela equipe ELO na própria plataforma.
- Tela central de auditoria [MVP §27]. O histórico com valor anterior e novo entrou na v1.14, na página de cada registro, e fica na versão mais enxuta: sem filtro, busca, exportação ou destaque das diferenças (DF-16).

---

## 12. Glossário

| Termo | Definição |
|---|---|
| ELO / ELO HUB | A consultoria ELO HUB Governança Inteligente e a sua plataforma |
| Cliente | Empresa que contrata a ELO para gerir os seus contratos. Na visão da Cleo, normalmente um fornecedor de um grande contratante [R0709] |
| Contratante | Grande empresa que contrata o cliente da ELO, como Petrobras, Porto do Açu ou FMC Logística. Lista oficial (DF-69) |
| Contrato ou proposta | Contrato, firmado ou pretendido, entre o cliente da ELO e o contratante, que a ELO ajuda a gerir e fiscalizar. O contrato da ELO com o cliente não é cadastrado (DF-66) |
| Avaliação de maturidade | Resultado do diagnóstico de maturidade e prontidão do cliente, numa data: nível por dimensão, maturidade geral e prontidão (F20) |
| Dimensão de maturidade | Área avaliada no diagnóstico, como Gestão comercial e contratual. Lista oficial (Apêndice C). Não é o mesmo que as camadas do Framework ELO |
| Prontidão | Parecer sobre a capacidade do cliente de assumir um contrato específico: Pronto, Pronto com condições, Não pronto no momento ou Inconclusivo [EX] |
| Executor | Quem executa uma atividade quando não é o responsável da ELO, informado só pelo nome (DF-71) |
| Escopo Contratado | Parte do contrato tratada como unidade operacional, com criticidade, Jornada e planos próprios |
| Criticidade | Nível de atenção do escopo ou da demanda: Baixa, Moderada, Alta, Crítica |
| Jornada ELO | Sequência de etapas do trabalho: Diagnosticar, Estruturar, Implementar, Monitorar, Evoluir |
| Framework ELO | Camadas que sustentam o método: Governance, Performance, Intelligence e Ecosystem Layer. Conceitual no MVP |
| Central ELO | Estrutura interna de registro, triagem, direcionamento e acompanhamento de demandas |
| Demanda | Solicitação ou necessidade registrada na Central, vinda do cliente, da equipe, de um especialista ou de uma reunião |
| Demanda institucional | Demanda administrativa ou institucional da própria ELO, registrada no cadastro da ELO como cliente (DF-40) |
| Especialista | Profissional do ecossistema ELO acionado para escopos e demandas |
| Evidência | Documento que comprova a execução de uma etapa, plano, atividade ou demanda, ou que sustenta uma avaliação de maturidade |
| Visão Executiva | Visão gerencial resumida de um cliente, para reuniões e relatório PDF |
| Parâmetro | Valor que o Administrador altera na tela de configurações sem mudar o sistema, como os prazos dos alertas (DF-81) |
| Início oficial da operação | Marco que o Administrador registra depois de conferir a carga inicial, a partir do qual saem as notificações de demanda e aparecem os alertas (DF-46) |
| Vínculo | Relação entre um usuário Equipe e os clientes que ele acompanha, mantida pelo Administrador, que define o que ele vê |

---

## 13. Definições

Decisões nossas para fechar a v1. Em 08/11/2026 a Cleo validou as 72 definições que não vinham das respostas dela (DF-01 a DF-65, DF-69 e DF-78 a DF-83) [FORM2], e o resultado item a item está na seção 14.3. Onde ela pediu ajuste, o texto abaixo já traz o ajuste. DF-35 a DF-57 vêm das decisões dos edge cases (D-01 a D-24), mapeados nos fluxos dos jobs no FigJam. DF-58 a DF-64 vêm das decisões do ciclo de vida das entidades (D-25 a D-31, seção 6.1). DF-65 vem da D-32, levantada na modelagem de dados da arquitetura. DF-66 a DF-77 registram as respostas da Cleo ao formulário (04/11/2026), já validadas por ela, e o que a Result fixou para aplicá-las. DF-78 a DF-81 vêm das decisões da Result sobre essas respostas e os documentos de exemplo (D-34 a D-37), como a DF-69 (D-33). DF-82 vem do hardening da v1.10 (D-38). DF-83 registra a resposta do Osvaldo sobre o site (PD-22). DF-01 a DF-22 são da primeira versão, decididas pela Result a partir da Definição Funcional do MVP, e cada uma traz a seção de origem.

| ID | Definição |
|---|---|
| DF-01 | Listas oficiais (serviços, contratantes, categorias, especialidades, segmentos e dimensões de maturidade) ficam editáveis pelo Administrador numa tela de configuração. Justificativa: princípio de ausência de dependência obrigatória do desenvolvedor, citado na proposta (Etapa 4). (Decisão da Result, v1.0, a partir do [MVP §2].) |
| DF-02 | A Equipe consulta os especialistas, com especialidades, qualificações e informações profissionais, para poder direcioná-los nas demandas. Na consulta, os escopos e demandas de cada especialista seguem o vínculo com o cliente (RN-01). (Decisão da Result, v1.0, a partir do [MVP §3.2, §12]: a Equipe opera a Central, e a demanda tem especialista vinculado; ajustada na v1.14 [FORM2].) |
| DF-03 | A Equipe pode ver a Visão Executiva e gerar o PDF dos clientes vinculados. Gerar o PDF não é a exportação de listas, que é só do Administrador (DF-75). (Decisão da Result, v1.0, a partir do [MVP §3.2, §22, §23]; ajustada na v1.10.) |
| DF-04 | Usuários são criados por convite do Administrador. Existe recuperação de senha. A sessão expira depois de 4 horas sem uso (arquitetura, DA-05) e, como diretriz, a tela avisa antes de expirar, para evitar perda do que não foi salvo. (Decisão da Result, v1.0, a partir do [MVP §28]; tempo da sessão fixado na v1.12; aviso incluído na v1.14 [FORM2].) |
| DF-05 | Razão Social, CNPJ e Status são obrigatórios no cliente. O CNPJ é validado. Empresas em abertura ou regularização ficam para avaliação futura (seção 11). (Decisão da Result, v1.0, a partir dos campos mínimos do [MVP §4]; ressalva registrada na v1.14 [FORM2].) |
| DF-06 | A página do cliente é o ponto central de navegação dos dados dele. (Decisão da Result, v1.0, a partir do fluxo do [MVP §1, §33].) |
| DF-07 | Proposta e contrato são o mesmo registro. O código é único por cliente (DF-47). Datas de vigência são obrigatórias a partir de Ativo; o término, exceto em Prazo indeterminado (DF-68). A transição de Proposta para Contrato fica no histórico, com o status e as datas (DF-16), e os documentos da formalização ficam ligados ao registro. (Decisão da Result, v1.0, a partir do [MVP §5, §18]; ajustada na v1.5, na v1.9 e na v1.14 [FORM2].) |
| DF-08 | A data efetiva de conclusão é exigida ao concluir um escopo. (Decisão da Result, v1.0, a partir do [MVP §7].) |
| DF-09 | Toda classificação de criticidade exige justificativa. (Decisão da Result, v1.0, a partir do [MVP §8].) |
| DF-10 | Prazo e prioridade são obrigatórios na atividade, porque o atraso e os alertas dependem do prazo. (Decisão da Result, v1.0, a partir do [MVP §11, §24].) |
| DF-11 | Número da demanda no formato ELO-AAAA-NNNN, sequencial por ano. (Decisão da Result, v1.0: o [MVP §12] pede o número da demanda, e o formato é nosso.) |
| DF-12 | Na demanda, só o cliente é obrigatório. Contrato e escopo são opcionais, mas precisam pertencer ao cliente. (Decisão da Result, v1.0, a partir do [MVP §12].) |
| DF-13 | Documento superado aponta para o que o substituiu. (Decisão da Result, v1.0, a partir do [MVP §17].) |
| DF-14 | Os indicadores do dashboard abrem listas filtradas e refletem o estado atual. (Decisão da Result, v1.0, a partir do [MVP §21].) |
| DF-15 | Alertas aparecem no dashboard e como destaque nas listas. Não há central de notificações. Cada alerta mostra a criticidade do item, quando ela existe, e leva ao registro relacionado. (Decisão da Result, v1.0, a partir do [MVP §24], que pede alertas internos; ajustada na v1.14 [FORM2].) |
| DF-16 | Alterações relevantes, registradas automaticamente com o valor anterior, o novo, o usuário, a data e a hora: status (todas as entidades), criticidade, responsável, prazo, datas e tipo de vigência, vínculos, contrato do escopo (DF-45) e textos da Visão Executiva (DF-73, DF-82). O histórico aparece na página do registro, como uma lista simples só de leitura, para quem pode ver o registro, e nenhum usuário o edita ou apaga pela plataforma (F17). É a versão mais enxuta do pedido da Cleo: sem filtro, busca, exportação ou destaque das diferenças. O valor anterior e o novo são um extra além do escopo contratado (Apêndice F). (Decisão da Result, v1.0, a partir do [MVP §27]; reduzida na v1.1, ampliada nas versões seguintes, alterada na v1.14, a pedido da Cleo [FORM2], e definida como versão enxuta na v1.17, por Jonathan Silva.) |
| DF-17 | Status finais só podem ser reabertos pelo Administrador, com justificativa, e cada reabertura fica registrada com usuário, data e hora (RN-22). (Decisão da Result, v1.0, a partir do [MVP §3.1, §26]; ajustada na v1.14 [FORM2].) |
| DF-18 | Backup diário com retenção mínima de 30 dias, em armazenamento seguro e independente do ambiente principal, com testes periódicos de recuperação (RNF-04, arquitetura DA-07). A ELO assume o custo. A frequência dos testes e quem os faz depois da entrega estão a alinhar (14.3). (Decisão da Result, v1.0, a partir do [MVP §28] e da [ATA §3]; era de 7 dias até a v1.13 e mudou a pedido da Cleo [FORM2].) |
| DF-19 | Candidaturas recusadas podem ser excluídas a pedido do titular dos dados, por procedimento operacional, sem tela própria. O procedimento registra a solicitação, a identificação do titular, a data e o resultado, e respeita as hipóteses legais de retenção da LGPD. Os dados dos formulários do site ficam guardados enquanto houver relação com a ELO e por até 2 anos depois do último contato; depois disso, o mesmo procedimento os exclui (Apêndice E). (Decisão da Result, v1.0, a partir do [MVP §28]; ajustada na v1.14 [FORM2]; prazo de guarda incluído na v1.16.) |
| DF-20 | Metas de desempenho, navegadores, localização e acessibilidade conforme a seção 9. São consideradas durante todo o desenvolvimento e na homologação, sem parâmetros técnicos rígidos além do MVP. (Decisão da Result, v1.0; virou diretriz na v1.1; reforçada na v1.14 [FORM2].) |
| DF-21 | Os e-mails saem de um endereço no domínio da ELO. O padrão é atendimento@elogovernance.com.br, e o Administrador pode definir outros endereços institucionais do domínio conforme a finalidade (F10). (Decisão da Result, v1.0, a partir do [MVP §13]; o endereço veio da Cleo na v1.9, DF-72; ajustada na v1.14 [FORM2].) |
| DF-22 | O prazo da demanda é informado manualmente na triagem. O Administrador pode cadastrar uma referência de prazo por criticidade, que aparece só como orientação; a plataforma não preenche o prazo. Os valores são definidos pela ELO e começam vazios (Apêndice C). (Decisão da Result, v1.1, que deixou o prazo automático por criticidade fora do MVP; referência incluída na v1.14 [FORM2].) |
| DF-23 | Vínculo da Equipe por cliente: o Administrador vincula o analista a clientes, e ele vê tudo desses clientes. O "Responsável ELO" indica responsabilidade e não define acesso. Clientes fora dos vínculos não aparecem para o analista. (Decisão da Result, v1.3, antiga PD-08.) |
| DF-24 | Nos clientes vinculados, a Equipe atualiza o andamento das etapas da Jornada (status, datas, observações e documentos) e os dados dos documentos (nome, categoria, vínculos, observações). Cadastro e edição do escopo, criticidade, marcação de etapas como "Não aplicável", status de documentos e inativação ficam com o Administrador; a exceção é marcar Superado ao enviar o substituto (DF-44). As atualizações do dia a dia ficam no histórico (DF-16). (Decisão da Result, v1.3, antiga PD-09; ajustada na v1.14 [FORM2].) |
| DF-25 | O vencimento da vigência não altera o status do contrato: ele segue Ativo, com vigência "Vencido", até o Administrador encerrar ou prorrogar. A prorrogação é manual: anexar o aditivo e atualizar a data de término; na renovação automática, só atualizar a data (DF-68). Ativo é a situação do cadastro e não autoriza executar serviço depois do vencimento. Contratos vencidos ficam destacados no dashboard e nas listas e entram nos alertas (F04, F15). (Decisão da Result, v1.3, antiga PD-10; ajustada na v1.14 [FORM2].) |
| DF-26 | Sem cascata: um registro só é encerrado, cancelado ou inativado depois que os itens abertos ligados a ele forem tratados; o sistema bloqueia a ação e lista esses itens, com tipo, status, responsável e link para cada um (RN-18). (Decisão da Result, v1.3, antiga PD-11; ajustada na v1.14 [FORM2].) |
| DF-27 | Especialista: obrigatórios nome, especialidade, e-mail e telefone; opcionais data de nascimento, subespecialidade, empresa, cidade/UF e link do currículo ou LinkedIn. Sem CPF/CNPJ e sem envio de arquivos pelo site. Arquivos do especialista são anexados pela equipe na categoria "Documento do Especialista". (Decisão da Result, v1.3, antiga PD-17, seguindo a ata de 30/10; a data de nascimento deixou de ser obrigatória na v1.14, a pedido da Cleo [FORM2].) |
| DF-28 | A etapa atual da Jornada é calculada pelo sistema (RN-08) e não é editável. O cálculo considera as etapas concluídas, em andamento e Não aplicáveis, o progresso aparece junto dela, e as movimentações ficam no histórico (DF-16). (Decisão da Result, v1.3, antiga PD-12; ajustada na v1.14 [FORM2].) |
| DF-29 | Demanda "Resolvida" = solução registrada pela equipe. "Encerrada" = retorno dado ao cliente e registrado na demanda, e demanda arquivada, ou fechamento sem solução (duplicada, desistência) com justificativa. Encerra o responsável pelo atendimento ou o Administrador (RN-12). (Decisão da Result, v1.3, antiga PD-15; ajustada na v1.14 [FORM2].) |
| DF-30 | O especialista não recebe o e-mail de nova demanda. O analista o aciona pelo canal dele, com o recorte de informação adequado, e o contato fica registrado na demanda, com o especialista, a data e o responsável (F09). Aviso ao especialista fica para o portal do especialista, em evolução futura. (Decisão da Result, v1.3, antiga PD-16; ajustada na v1.14 [FORM2].) |
| DF-31 | Desktop primeiro. As telas de consulta (RNF-09), como clientes, contratos, indicadores e demandas, oferecem boa leitura e navegação no navegador do celular, como diretriz verificada na homologação, sem entrar nos critérios de aceite. Nem todas as funções precisam estar no celular nesta versão. (Decisão da Result, v1.3, antiga PD-27; reforçada na v1.14 [FORM2].) |
| DF-32 | Um escopo pode ter vários especialistas vinculados. Uma demanda também, conforme a complexidade, e com mais de um é preciso indicar o principal. (Decisão da Result, v1.3, antiga PD-28; até a v1.13 a demanda tinha no máximo um, e mudou a pedido da Cleo [FORM2].) |
| DF-33 | O Administrador pode excluir definitivamente um registro sem nada ligado a ele (itens filhos, documentos, demandas ou comentários). A exclusão exige confirmação e justificativa e fica no log técnico. Registros com histórico não são apagados: só são inativados ou fechados pelos status finais (RN-13, RN-24). (Decisão da Result, v1.3, antiga PD-30; ajustada na v1.14 [FORM2].) |
| DF-34 | O alerta de vencimento acende 30 dias antes do término da vigência, como o MVP define. Desde a v1.9, os 30 dias são um parâmetro que o Administrador altera (DF-81). Contratos próximos do vencimento e vencidos ficam destacados no dashboard e nas listas (F04). Vários alertas por contrato continuam para evolução [MVP §6]. (Decisão da Result, v1.3, antiga PD-31, ajustada na v1.9 e na v1.14 [FORM2].) |
| DF-35 | Os campos de responsável só aceitam Administradores e usuários Equipe vinculados ao cliente do registro (RN-19). As trocas de responsável ficam no histórico (DF-16), e a redistribuição segue a DF-36. (Decisão da Result, v1.5, D-01 dos edge cases; ajustada na v1.14 [FORM2].) |
| DF-36 | Um usuário não é inativado, nem perde o vínculo com um cliente, enquanto for responsável por itens abertos. O sistema bloqueia e lista os itens, como na RN-18, e o Administrador os redistribui ali mesmo para outro responsável com vínculo. (Decisão da Result, v1.5, D-02 dos edge cases; ajustada na v1.14 [FORM2].) |
| DF-37 | O último Administrador ativo não pode ser inativado nem passar para o perfil Equipe. (Decisão da Result, v1.5, D-03 dos edge cases.) |
| DF-38 | Item de lista oficial já usado em registros é inativado: sai das novas escolhas e continua nos registros. Só é excluído se nunca foi usado. (Decisão da Result, v1.5, D-04 dos edge cases.) |
| DF-39 | O usuário Equipe registra demanda para qualquer cliente Ativo, escolhendo só pelo nome, mesmo fora dos seus vínculos. A triagem fica com um Administrador ou um analista vinculado, e quem registrou não passa a ver o cliente. (Decisão da Result, v1.5, D-05 dos edge cases.) |
| DF-40 | A demanda de origem "Interna" também tem cliente obrigatório: é a demanda levantada pela ELO sobre um cliente. As demandas administrativas ou institucionais da própria ELO usam a origem "Institucional" e ficam no cadastro da ELO como cliente. Esse cadastro serve só para esse uso, fica fora do total de clientes ativos, e o acesso segue o vínculo com ele (RN-01). (Decisão da Result, v1.5, D-06 dos edge cases; demanda institucional definida na v1.15, a pedido da Cleo [FORM2].) |
| DF-41 | Em "Aguardando retorno" o prazo da demanda continua valendo, e o alerta de demanda vencida continua. Quem atende ajusta o prazo combinado, e a mudança fica registrada (DF-16). (Decisão da Result, v1.5, D-07 dos edge cases.) |
| DF-42 | Se o cliente discorda da solução, a demanda Resolvida volta para Em atendimento, com comentário obrigatório. Encerrada só o Administrador reabre (RN-17). (Decisão da Result, v1.5, D-08 dos edge cases.) |
| DF-43 | A atividade registra a data de conclusão automaticamente ao ser concluída, para mostrar se a entrega foi no prazo. (Decisão da Result, v1.5, D-09 dos edge cases.) |
| DF-44 | O usuário Equipe marca um documento como Superado só ao incluir o documento que o substitui. As demais mudanças de status continuam com o Administrador. Resolve o conflito entre UC-15 e CA-12.6. (Decisão da Result, v1.5, D-10 dos edge cases.) |
| DF-45 | O Administrador move um escopo para outro contrato do mesmo cliente, levando tudo o que está ligado a ele (planos, atividades, Jornada, documentos e demandas). A mudança fica registrada. (Decisão da Result, v1.5, D-11 dos edge cases.) |
| DF-46 | Cadastro inicial: a equipe cadastra só contratos ativos e demandas abertas. Até o Administrador registrar o início oficial da operação, depois de conferir a carteira, as notificações de demanda não saem e os alertas ficam ocultos. Depois disso, funcionam normalmente, com a situação real dos contratos e das demandas. Convites e recuperação de senha funcionam desde o início. (Decisão da Result, v1.5, D-12 dos edge cases; até a v1.13 não havia esse controle, e ele entrou a pedido da Cleo [FORM2].) |
| DF-47 | O código do contrato é único por cliente, e não no sistema todo: clientes diferentes podem ter contratos com o mesmo código, como num consórcio. (Decisão da Result, v1.5, D-14 dos edge cases.) |
| DF-48 | Escopos e planos de ação podem ser criados num contrato em Proposta ou Em contratação, para registrar o diagnóstico e a proposta antes da assinatura. Eles aparecem identificados como planejamento, separados dos serviços já formalizados. (Decisão da Result, v1.5, D-15 dos edge cases; ajustada na v1.14 [FORM2].) |
| DF-49 | Bordas da Jornada: pelo menos uma etapa fica aplicável; etapa Em andamento, Concluída ou com documento não vira Não aplicável; só o Administrador reabre etapa Concluída. (Decisão da Result, v1.5, D-16 dos edge cases.) |
| DF-50 | Candidatura do site com e-mail já cadastrado entra como candidatura nova, marcada "e-mail já cadastrado". O site nunca altera um cadastro existente. A Equipe consulta as candidaturas anteriores com o mesmo e-mail. (Decisão da Result, v1.5, D-17 dos edge cases; ajustada na v1.14 [FORM2].) |
| DF-51 | Um especialista com vínculos em escopos ou demandas abertos pode ser inativado. Os vínculos continuam, aparecem sinalizados para troca e geram alerta para o responsável até a troca, e o histórico é preservado. (Decisão da Result, v1.5, D-18 dos edge cases; ajustada na v1.14 [FORM2].) |
| DF-52 | A Visão Executiva e o PDF nunca mostram valor do contrato, observações internas (dos cadastros e da avaliação de maturidade), comentários de demandas, justificativa da criticidade nem dados de especialistas, porque podem ir para o cliente e para os fornecedores dele. O executor da atividade aparece, porque é escrito para isso (DF-71). Podem ser filtrados por contrato. (Decisão da Result, v1.5, D-19 dos edge cases.) |
| DF-53 | Um prazo ou término vira atraso ou vencimento a partir da 0h do dia seguinte, no horário de Brasília (RN-20). (Decisão da Result, v1.5, D-20 dos edge cases.) |
| DF-54 | Contrato Suspenso segue com status da vigência e alertas iguais aos de um contrato Ativo e tem identificação visual própria no dashboard e nas listas. (Decisão da Result, v1.5, D-21 dos edge cases; ajustada na v1.14 [FORM2].) |
| DF-55 | Datas depois do término da vigência ou do prazo do plano geram um aviso claro na tela, que o usuário confirma para salvar, sem bloqueio (RN-21). (Decisão da Result, v1.5, D-22 dos edge cases; ajustada na v1.14 [FORM2].) |
| DF-56 | O pedido de diagnóstico cria o cliente como Prospect (DF-76). CNPJ já cadastrado não gera cliente novo: os dados do pedido ficam nas observações do cliente e vão à Central para análise e direcionamento. CNPJ inválido é recusado no formulário. O solicitante recebe confirmação na tela. (Decisão da Result, v1.5, D-23 dos edge cases; condição resolvida na v1.9; ajustada na v1.14 [FORM2].) |
| DF-57 | Um ciclo da Jornada por escopo. Um novo ciclo, depois de Evoluir, é um novo escopo, que pode apontar para o do ciclo anterior, para consultar o histórico e comparar resultados. (Decisão da Result, v1.5, D-24 dos edge cases; ajustada na v1.14 [FORM2].) |
| DF-58 | Contrato Cancelado é o que não chegou a vigorar: sai de Proposta ou Em contratação. Encerrado é o que vigorou e terminou, no prazo ou antes, inclusive por rescisão. (Decisão da Result, v1.7, D-25 do ciclo de vida.) |
| DF-59 | Escopo não é concluído nem cancelado com etapa da Jornada Em andamento: o sistema bloqueia e lista, como na RN-18. Etapas Não iniciadas podem ficar como estão, porque a Jornada pode terminar antes da última etapa (RN-08). (Decisão da Result, v1.7, D-26 do ciclo de vida.) |
| DF-60 | Registro em status final não recebe filhos novos (escopo, plano, atividade), e as etapas da Jornada de escopo em status final não mudam. Documentos e demandas continuam podendo ser ligados a ele (RN-23). (Decisão da Result, v1.7, D-27 do ciclo de vida.) |
| DF-61 | Enquanto a demanda não tem responsável pelo atendimento, o responsável pela triagem também pode encerrá-la, com justificativa no campo Solução (duplicada, desistência). (Decisão da Result, v1.7, D-28 do ciclo de vida.) |
| DF-62 | Inativo é status em usuário, cliente e especialista, e sinal à parte em documento e item de lista oficial. Contrato, escopo, plano, atividade, demanda e avaliação de maturidade não são inativados: fecham pelos status finais (RN-24). (Decisão da Result, v1.7, D-29 do ciclo de vida; avaliação incluída na v1.9.) |
| DF-63 | Marcar documento como Superado exige indicar o documento substituto, como a RN-15 já previa. O CA-12.4 foi ajustado para isso. (Decisão da Result, v1.7, D-30 do ciclo de vida.) |
| DF-64 | Entre status abertos, o Administrador corrige o status livremente, cumprindo as exigências do destino. Ao reabrir um status final, escolhe o status de destino. Reaberturas e correções fora das transições da seção 6.1 exigem justificativa, registrada com o status anterior e o novo, usuário, data e hora. A Equipe faz só as transições da seção 6.1 (RN-22). (Decisão da Result, v1.7, D-31 do ciclo de vida; ajustada na v1.14 [FORM2].) |
| DF-65 | Em Documento do Especialista, o especialista é obrigatório e o cliente é opcional. Sem cliente, só o Administrador inclui e altera o documento, e os dois perfis consultam e baixam, como consultam especialistas (DF-02). Com cliente, vale o vínculo (RN-01). Mantém um módulo de documentos só, com as mesmas categorias, status e rastreabilidade. (Decisão da Result, v1.8, D-32 da arquitetura.) |
| DF-66 | O contrato cadastrado é o contrato ou a proposta do cliente com o grande contratante, que a ELO ajuda a gerir e fiscalizar. Vigência, valor, alerta de vencimento e Visão Executiva são desse contrato. O contrato da ELO com o cliente não é cadastrado no MVP. Os status Proposta e Em contratação servem às propostas que o cliente faz ao contratante, como as da DSI Network à FMC Logística [EX]. (Resposta da Cleo, v1.9, PD-32.) |
| DF-67 | Um contrato pode ter vários serviços contratados, da lista oficial. (Resposta da Cleo, v1.9, PD-29.) |
| DF-68 | Existem contratos por prazo indeterminado e contratos com renovação automática. O contrato ganha o campo Tipo de vigência: Prazo determinado (padrão), Prazo indeterminado ou Renovação automática. Prazo indeterminado: sem término, Vigente, sem dias restantes e sem alerta. Renovação automática: término obrigatório, alerta antes de cada fim de prazo, e o Administrador atualiza a data a cada renovação, sem aditivo. Renovação automática feita pela plataforma fica para evolução. (Resposta da Cleo, v1.9, PD-33; o campo é decisão da Result.) |
| DF-69 | O contrato tem o campo Contratante, obrigatório, escolhido numa lista oficial que o Administrador mantém. Com a PD-32, o contratante passa a ser um dado central: um mesmo contratante aparece em vários clientes, e a lista permite filtrar a carteira por ele. A lista não aceita nomes duplicados, e inativar um contratante preserva os contratos já cadastrados (DF-38). (Decisão da Result, v1.9, D-33; ajustada na v1.14 [FORM2].) |
| DF-70 | Os valores iniciais das listas de serviços, categorias da Central, especialidades, segmentos e dimensões de maturidade estão no Apêndice C. A lista de serviços traz os serviços que o cliente presta ao contratante, e não os serviços da ELO. Todas continuam editáveis (DF-01). (Resposta da Cleo, v1.9, PD-01, PD-02 e PD-23; dimensões tiradas do instrumento dela [EX].) |
| DF-71 | Um usuário da ELO é o responsável pela atividade e recebe os alertas. A atividade pode informar também o executor, pessoa do cliente ou especialista, só pelo nome, sem acesso à plataforma. O executor aparece na Visão Executiva. (Resposta da Cleo, v1.9, PD-13.) |
| DF-72 | Parâmetros iniciais: atividade "próxima do prazo" 5 dias antes (PD-03); cópia das novas demandas para atendimento@elogovernance.com.br, com os e-mails da plataforma saindo do domínio elogovernance.com.br (PD-07); arquivos em PDF, Word, Excel, imagens (.jpg, .png), PowerPoint e e-mails salvos (.msg, .eml), com até 10 MB cada (PD-04). (Resposta da Cleo, v1.9.) |
| DF-73 | "Principais resultados" e "Observações executivas" são dois textos por cliente, sempre atualizados, com a data e o autor da última atualização. O Administrador e a Equipe vinculada escrevem. (Resposta da Cleo, v1.9, PD-19.) |
| DF-74 | O PDF da Visão Executiva traz todos os blocos do MVP: escopos e situação atual, criticidade, etapa da Jornada, planos de ação, atividades concluídas e pendentes, demandas abertas e resolvidas, entregas realizadas, próximos prazos, pendências, principais resultados, observações executivas e próximos passos, mais a maturidade (F20). O cabeçalho traz o nome do cliente, a data de emissão e a data da última atualização dos textos. (Resposta da Cleo, v1.9, PD-06.) |
| DF-75 | Só o Administrador exporta, nas listas de clientes, contratos, atividades e demandas, em CSV, respeitando os filtros. (Resposta da Cleo, v1.9, PD-05.) |
| DF-76 | O formulário de diagnóstico pede nome, empresa, CNPJ, cargo, e-mail, telefone ou WhatsApp, cidade e estado, segmento, principais contratantes atendidos e mensagem. Ao enviar, cria o cliente Prospect e avisa a caixa da Central por e-mail. Obrigatórios: nome, empresa, CNPJ, e-mail e telefone (decisão da Result). A empresa vira a razão social; nome, cargo, telefone e e-mail viram o contato principal; segmento, cidade e estado vão para os campos do cliente; contratantes atendidos e mensagem vão para as observações e para o e-mail. (Resposta da Cleo, v1.9, PD-21.) |
| DF-77 | Metas aceitas pela Cleo: até 1 dia útil entre a chegada da demanda e o início do atendimento (M-04) e até 10% de atividades atrasadas, com redução contínua (M-05). Ela sugeriu também medir a evolução da maturidade e o cumprimento de prazos e entregas, que viraram a M-08 e a M-09. (Resposta da Cleo, v1.9, PD-25.) |
| DF-78 | A avaliação de maturidade entra no MVP numa versão enxuta (F20): a plataforma guarda o resultado (nível por dimensão, média opcional, maturidade geral, prontidão e síntese) e mostra a avaliação inicial e a atual. O questionário, as notas por pergunta, o cálculo e os requisitos essenciais ficam no instrumento da ELO, anexado como documento. Assim a entrega cabe no prazo, o método não é automatizado [MVP §8, §31] e o conteúdo metodológico não fica exposto (RNF-06). (Decisão da Result, v1.9, D-34; confirmada como decisão final e extra além do escopo contratado na v1.17, por Jonathan Silva.) |
| DF-79 | A Equipe vinculada cria e edita avaliações Em elaboração. Só o Administrador conclui e reabre, porque o parecer de prontidão vai para o cliente e pode chegar ao contratante, como a criticidade, que também é do Administrador (DF-24). (Decisão da Result, v1.9, D-35.) |
| DF-80 | O plano de desenvolvimento usa os planos de ação que já existem, num escopo do cliente, com um vínculo opcional à avaliação. Sem contrato assinado, a oportunidade entra como contrato em Proposta, que já aceita escopos e planos (DF-48). Não há lista própria de ações dentro da avaliação. (Decisão da Result, v1.9, D-36.) |
| DF-81 | Parametrização pedida pela Cleo no fim do formulário: entram no MVP as listas oficiais (DF-01) e os prazos dos alertas como parâmetros do Administrador (dias de "próxima do prazo" e dias do alerta de vencimento). Na v1.14 entram também os remetentes por finalidade (DF-21), as referências de prazo por criticidade (DF-22) e o início oficial da operação (DF-46). Perfis com segregação por cliente e administração central pela ELO já estão na RN-01. Regras, etapas, status e fluxos configuráveis por cliente ou contrato, e modelos de plano de ação, ficam para evolução, como ela mesma sugeriu (seção 11). (Decisão da Result, v1.9, D-37.) |
| DF-82 | Cada bloco da Visão Executiva e do PDF tem a origem da tabela de F14. "Próximos passos", bloco do PDF no MVP [MVP §23] que nenhum registro alimenta, é um terceiro texto por cliente, com a mesma regra dos outros dois (DF-73). Entregas realizadas e próximos prazos usam uma janela de 30 dias. A tabela é proposta para o protótipo, e a DT-04 detalha o layout. Os três textos preservam o histórico de alterações (DF-16). (Decisão da Result, v1.10, D-38 do hardening; ajustada na v1.14 [FORM2].) |
| DF-83 | O site institucional continua onde está: publicado no ChatGPT Sites, da OpenAI, na infraestrutura da Cloudflare, feito em Next.js, React e Vinext, com o código num projeto da OpenAI a que o Osvaldo tem acesso. Domínio e DNS ficam no Registro.br [OSV]. A plataforma não depende da hospedagem do site: roda na própria infraestrutura (arquitetura, seção 8), num subdomínio de elogovernance.com.br, com o nome definido pela ELO (RNF-17); o Osvaldo sugeriu app.elogovernance.com.br e propôs manter o site na hospedagem atual, com a plataforma num ambiente separado, integrada ao domínio. A Result pede a ele que crie no DNS os registros do subdomínio e do e-mail. No redesenho da página (CA-19.5), a Result entrega a página pronta e o Osvaldo a publica no projeto do site; a Result não pede acesso a esse projeto. O redesenho entra na parte final do desenvolvimento e é alinhado com ele no início da Etapa 3. A Cleo considerou boa a opção app.elogovernance.com.br e pediu que domínio, DNS, código-fonte, hospedagem e acessos administrativos fiquem sob controle da ELO, com as responsabilidades de configuração, publicação, manutenção e segurança definidas (arquitetura, seção 8). (Resposta do Osvaldo, 04/11/2026, PD-22; ressalva da Cleo na v1.14 [FORM2].) |

---

## 14. Pendências com a Cleo

A Cleo respondeu o formulário em 04/11/2026 [FORM]. Das 18 pendências, ela fechou 17, que viraram definições ou dados da seção 2.3, na ordem do formulário abaixo. A plataforma do site (PD-22), que ela não sabia, foi respondida pelo Osvaldo no mesmo dia [OSV].

**Formulário:** [Plataforma ELO · Decisões para fechar a documentação](https://docs.google.com/forms/d/e/1FAIpQLSelb1uCRpbZAiLSg2iRDRg1jnY6SgR9ZAPf2pUnXgjXX31qcA/viewform) · criado em 31/10/2026 · prazo combinado: 02/11/2026 [ATA §6] · respondido em 04/11/2026.

**Situação na v1.11:** as 18 pendências fechadas.

| Nº no form | ID | Pergunta | Resposta | Onde entrou |
|---|---|---|---|---|
| 1 | PD-32 | Quem são as partes do contrato cadastrado | O contrato do cliente com o grande contratante | DF-66, F03, glossário |
| 2 | PD-29 | Mais de um serviço por contrato | Vários serviços no mesmo contrato | DF-67, F03 |
| 3 | PD-33 | Contrato sem data de término | Existem os dois casos: prazo indeterminado e renovação automática | DF-68, F03, F04, RN-03, RN-04 |
| 4 | PD-02 | Lista oficial de serviços | 20 serviços que o cliente presta ao contratante, com a lista aberta a inclusões | DF-70, Apêndice C |
| 5 | PD-01 | Categorias da Central | Mantém as sugeridas (não marcou "Outros assuntos") e inclui KPIs e SLAs, documentação e mobilização de fornecedores e auditoria e avaliação de fornecedores | DF-70, Apêndice C |
| 6 | PD-13 | Responsável de fora da ELO | Alguém da ELO responde, e se informa quem executa | DF-71, F08 |
| 7 | PD-03 | Dias de "próxima do prazo" | 5 dias | DF-72, RN-10 |
| 8 | PD-19 | Principais resultados e observações executivas | Por cliente, sempre atualizados, escritos pelo Administrador e pela Equipe | DF-73, F14 |
| 9 | PD-06 | Blocos do PDF | Todos os 12, mais data de emissão, nome do cliente e data da última atualização | DF-74, F14 |
| 10 | PD-05 | Exportação para Excel | Só o Administrador | DF-75, F16 |
| 11 | PD-07 | E-mail da Central | atendimento@elogovernance.com.br, domínio elogovernance.com.br | DF-72, F10, RNF-15 |
| 12 | PD-04 | Formatos e tamanho de arquivo | PDF, Word, Excel, imagens, PowerPoint e e-mails, até 10 MB | DF-72, F12 |
| 13 | PD-21 | Formulário de diagnóstico | Os 10 campos sugeridos; a empresa entra como Prospect e a Central é avisada | DF-76, F19 |
| 14 | PD-22 | Site atual | elogovernance.com.br, administrado pelo Osvaldo. A plataforma ela não sabia; o Osvaldo respondeu em 04/11: ChatGPT Sites, da OpenAI, na Cloudflare, em Next.js, React e Vinext, com domínio e DNS no Registro.br [OSV] | DF-83, F19 |
| 15 | PD-23 | Especialidades e segmentos | As 7 especialidades sugeridas; os 6 segmentos sugeridos mais Offshore e Serviços Marítimos, Infraestrutura, Energia, Mineração e Tecnologia | DF-70, Apêndice C |
| 16 | PD-24 | Tamanho da operação | 2 clientes, 0 contratos ativos, 2 usuários e cerca de 5 demandas por mês; em 12 meses, 10 clientes, 10 contratos e 6 usuários | Seção 2.3 |
| 17 | PD-25 | Métricas de sucesso | Todas fazem sentido (M-07 com ajuste, sem detalhe); metas sugeridas aceitas; novas medidas sugeridas | DF-77, seção 8 |
| 18 | PD-26 | Dados existentes | Em parte em planilhas, documentos e arquivos, sem base única; cadastro inicial pela equipe | Seção 2.3, DF-46 |

**Comentário final da Cleo.** Ela pediu uma estrutura de parametrização administrativa, para a equipe configurar regras, categorias, indicadores, etapas, alertas, status e fluxos conforme cada cliente e contrato, começando pelas parametrizações essenciais e deixando o mais complexo para depois. Também pediu perfis de acesso com segregação por cliente e administração central pela ELO. Tratamento na DF-81.

### 14.1 Documentos de exemplo recebidos

O envio de arquivos pelo formulário falhou, e a Cleo mandou os documentos à parte em 04/11/2026. Estão na pasta `descoberta` e são tratados como confidenciais [EX].

| Documento | O que é | Ajudou a fechar |
|---|---|---|
| Teste de Maturidade e Prontidão do Fornecedor | Instrumento padrão de diagnóstico da ELO, em branco: 8 dimensões, 24 perguntas, escala de 1 a 5 com evidência, requisitos essenciais, consolidação, parecer de prontidão e plano de desenvolvimento | F20, Apêndice C |
| Formulário de Avaliação de Maturidade da DSI Network | O mesmo instrumento preenchido pela Cleo em 06/10/2026, em versão preliminar | F20, DF-80 |
| Apresentação de Resultados do Diagnóstico da DSI Network | Relatório executivo entregue ao cliente | F20, layout do PDF (DT-04) |
| Propostas da DSI Network à FMC Logística (Tactical RMM e GLPI) | Propostas do cliente ao contratante | PD-32, PD-29, campos de F03 |
| Atestado de capacidade técnica da FMC Logística para a DSI Network | Documento do Cliente | F12 |
| Portfólio da DSI Network, sem preços | Documento do Cliente | F12 |

Não vieram planilhas atuais nem modelos de atas e planos de ação.

### 14.2 O que falta a Cleo validar

Os itens abaixo fecham a Etapa 1. Os já resolvidos estão marcados, e os demais dependem da Cleo. As definições (item 1) foram respondidas em 08/11/2026 num formulário próprio [FORM2], e o resultado está na 14.3.

**Formulário das definições:** [Plataforma ELO · Validação das definições do PRD v1.13](https://docs.google.com/forms/d/e/1FAIpQLSfJkFwJaafmHdkNXMmgDiuF8rZmZznurPWdRYxTc9SoVdBxjA/viewform) · criado em 04/11/2026 · enviado em 05/11/2026 · respondido em 08/11/2026. A aprovação vale quando ela a escreve no grupo oficial, citando as versões do PRD e da arquitetura [ATA §5].

| # | O que validar | Onde está | O que ela faz |
|---|---|---|---|
| 1 | Definições decididas pela Result: DF-01 a DF-65, DF-69 e DF-78 a DF-83 (72 itens) | Seção 13, 14.3 e formulário de definições | **Respondido em 08/11/2026.** Falta alinhar um ponto (14.3) |
| 2 | Ajuste da M-07, que ela marcou "faz sentido com ajuste" sem dizer qual | Seção 8 | **Fechado em 10/11/2026:** fica como está |
| 3 | Categoria "Outros assuntos" na Central | Apêndice C | **Fechado em 10/11/2026:** mantida |
| 4 | Aviso e consentimento dos formulários do site | Apêndice E | **Fechado em 10/11/2026:** versão 1, com prazo padrão de guarda. Se ela quiser, passa pelo jurídico antes de os formulários irem ao ar |
| 5 | Itens além da proposta: avaliação de maturidade (F20), redesenho da página do site (F19) e histórico com valor anterior e novo (DF-16) | Apêndices B e F | **Fechado em 10/11/2026:** decisão de Jonathan Silva (Result). São extras além do escopo contratado, sem custo adicional, e não dependem de aceite. Ela é informada junto com o pedido de pré-aprovação |
| 6 | Custo da infraestrutura: banco no plano pago, cerca de R$ 235 por mês no total, mais o armazenamento externo do backup de 30 dias | RNF-12, arquitetura DA-01 e DA-07 | **Fechado em 09/11/2026:** a ELO assume o custo |
| 7 | Arquivos da marca da ELO: logo em vetor, cores e fontes | CA-14.3, CA-19.5, seção 10 | **Recebido em 18/11/2026:** o branding e o logo em PNG, que a Result vetorizou. A paleta do branding vale só para o logo |
| 8 | Aprovação da documentação: este PRD e a arquitetura | Grupo oficial | **Pré-aprovado em 16/11/2026** no grupo, com o PRD v1.18 e a arquitetura v1.13. A aprovação final vem junto com a do protótipo, em 04/12 |

### 14.3 Resultado da validação das definições

A Cleo respondeu o formulário [FORM2] em 08/11/2026, às 16:52 e às 18:10. As duas respostas não se contradizem. A das 18:10 resume cada ressalva e é a base da contagem; a das 16:52 traz o detalhe usado para aplicar os ajustes.

| Resultado | Quantas | Definições |
|---|---|---|
| Aprovadas sem ressalva | 22 | DF-01, DF-06, DF-08, DF-09, DF-11 a DF-14, DF-37, DF-41 a DF-44, DF-47, DF-49, DF-53, DF-58, DF-59, DF-61, DF-63, DF-65, DF-79 |
| Aprovadas, com ressalva que o PRD já atendia | 14 | DF-03, DF-10, DF-20, DF-23, DF-31, DF-38, DF-39, DF-45, DF-52, DF-60, DF-62, DF-78, DF-80, DF-81 |
| Ajustadas conforme a ressalva | 34 | DF-02, DF-04, DF-07, DF-15 a DF-17, DF-19, DF-21, DF-22, DF-24 a DF-30, DF-32 a DF-36, DF-40, DF-46, DF-48, DF-50, DF-51, DF-54 a DF-57, DF-64, DF-69, DF-82, DF-83 |
| Registrada para evolução | 1 | DF-05 |
| Com ponto a alinhar | 1 | DF-18 |
| **Total** | **72** | |

**Ponto a alinhar**

| Definição | O que ela pediu | Como está neste PRD | O que falta |
|---|---|---|---|
| DF-18 | Retenção mínima de 30 dias, armazenamento seguro e independente e testes periódicos de recuperação | Os 30 dias e a cópia independente já estão na RNF-04 e na DA-07 da arquitetura, e a ELO assume o custo | Definir a frequência dos testes de recuperação e quem os faz depois da entrega |

**Ressalvas, item a item**

| DF | Ressalva da Cleo | Tratamento | Onde |
|---|---|---|---|
| DF-02 | Consultar especialidades, qualificações e informações profissionais, respeitando permissões e confidencialidade | Ajustada. Na página do especialista, escopos e demandas seguem o vínculo com o cliente | DF-02, CA-11.4 |
| DF-03 | PDF sem expor informações internas ou restritas | Já atendida pelas regras de acesso e pelo que nunca aparece | CA-14.4, CA-14.5, DF-52 |
| DF-04 | Recuperação de senha simples e segura; avisar antes de expirar a sessão, quando possível | Ajustada. Aviso antes de expirar, como diretriz | F01, DF-04 |
| DF-05 | Avaliar no futuro empresas em abertura ou regularização | Registrada para evolução. O MVP mantém a validação | Seção 11 |
| DF-07 | Preservar o histórico da transição de Proposta para Contrato | Ajustada, pelo histórico da DF-16 | DF-07, CA-17.3 |
| DF-10 | Prioridade flexível, conforme urgência e relevância | Já atendida: quem cria ou atualiza a atividade escolhe a prioridade | F08 |
| DF-15 | Classificar alertas por criticidade, com acesso ao registro | Ajustada. O acesso ao registro já existia; entram a criticidade e a ordenação | F15, CA-15.1, CA-15.5 |
| DF-16 | Guardar valor anterior e novo; histórico automático, sem edição ou exclusão | Ajustada. Reverte a redução da v1.1, na versão mais enxuta (v1.17) | F17, CA-17.2, CA-17.3, RN-22 |
| DF-17 | Justificativa em cada reabertura | Ajustada | RN-17, RN-22, CA-17.4 |
| DF-18 | Retenção de 30 dias, armazenamento independente e testes periódicos | Ajustada, com ponto a alinhar | RNF-04, arquitetura DA-07 |
| DF-19 | Registrar solicitação, titular, data e resultado, respeitando a LGPD | Ajustada no procedimento operacional | DF-19, seção 7.1 |
| DF-20 | Diretrizes consideradas no desenvolvimento e na homologação, sem parâmetros rígidos | Já atendida: continuam diretrizes | Seção 9, DF-20 |
| DF-21 | atendimento@elogovernance.com.br como padrão e outros endereços conforme a finalidade | Ajustada. Novo parâmetro de remetente | F10, CA-10.4, Apêndice C |
| DF-22 | Referências de prazo por criticidade, só como orientação | Ajustada. Parâmetro sem valores iniciais: a ELO define | F09, CA-09.14, Apêndice C |
| DF-23 | Vínculo respeita perfil e permissões; o Administrador atualiza os vínculos | Já atendida | RN-01, seção 4.3 |
| DF-24 | Autonomia, facilidade de uso e histórico das atualizações | Ajustada, pelo histórico da DF-16 | DF-24, DF-16 |
| DF-25 | Destacar contratos vencidos; Ativo não autoriza executar depois do vencimento | Ajustada. Novo alerta de contrato vencido | F03, F04, F15, CA-04.8 |
| DF-26 | Mostrar pendências com tipo, status e responsável, e dar acesso a cada registro | Ajustada | DF-26, CA-18.3 |
| DF-27 | Data de nascimento não obrigatória | Ajustada | F11, DF-27, Apêndice E |
| DF-28 | Considerar todos os status, atualizar o progresso e preservar o histórico | Ajustada. Novo indicador de progresso | RN-08, CA-06.10 |
| DF-29 | Exigir o registro do retorno ao cliente ou justificativa | Ajustada. Novo campo Retorno ao cliente | F09, RN-12, CA-09.4 |
| DF-30 | Registrar contato, data, responsável e demanda, com confidencialidade | Ajustada. Novo tipo de comentário | F09, CA-09.13 |
| DF-31 | Boa experiência de consulta no celular | Já atendida como diretriz, verificada na homologação | RNF-09, DF-31 |
| DF-32 | Mais de um especialista por demanda, com um principal | Ajustada | F09, DF-32, CA-09.12 |
| DF-33 | Confirmação e justificativa; registros com histórico não são apagados | Ajustada | RN-13, CA-18.4 |
| DF-34 | Destacar contratos próximos do vencimento e vencidos | Ajustada | F04, CA-04.8 |
| DF-35 | Facilitar a redistribuição e preservar as atribuições anteriores | Ajustada, pela DF-16 e pela DF-36 | DF-35, CA-01.9 |
| DF-36 | Visualizar e redistribuir facilmente os itens abertos | Ajustada | F01, CA-01.9 |
| DF-38 | Consultar e reativar itens inativos | Já atendida; o critério agora diz isso | Seção 6.1, CA-18.5 |
| DF-39 | Registrar demanda não dá acesso aos dados do cliente | Já atendida | RN-01, CA-09.9 |
| DF-40 | Diferenciar demandas internas de clientes das institucionais da ELO | Ajustada. Origem "Institucional", no cadastro da ELO como cliente, que existe só para esse uso | F02, F09, DF-40, CA-09.15, CA-13.4 |
| DF-45 | Preservar dados, documentos, planos, atividades, demandas e histórico da transferência | Já atendida | CA-05.6, DF-16 |
| DF-46 | Sem disparos de e-mails e alertas durante a carga inicial | Ajustada. Novo parâmetro de início oficial da operação | F10, F15, CA-10.5, CA-15.7 |
| DF-48 | Diferenciar planejamento de execução já formalizada | Ajustada | F05, CA-05.9 |
| DF-50 | Identificar e-mail já cadastrado e consultar as candidaturas | Ajustada | F11, CA-11.6 |
| DF-51 | Destacar os vínculos a substituir e facilitar o acompanhamento | Ajustada. Novo alerta para o responsável | F15, CA-15.6 |
| DF-52 | Mostrar o que é relevante ao cliente sem expor dados internos | Já atendida | CA-14.5, CA-14.6 |
| DF-54 | Diferenciar visualmente contrato suspenso | Ajustada | F04, CA-04.9 |
| DF-55 | Aviso claro, com confirmação e sem bloqueio | Ajustada | RN-21, CA-05.8, CA-08.7 |
| DF-56 | Preservar o pedido de CNPJ já cadastrado, encaminhar à Central e confirmar o envio | Ajustada | F19, CA-19.3 |
| DF-57 | Manter referência ao ciclo anterior | Ajustada. Novo campo no escopo | F05, CA-05.10 |
| DF-60 | Vincular documentos e demandas sem alterar o status final | Já atendida | RN-23 |
| DF-62 | Preservar e consultar registros encerrados, especialmente avaliações | Já atendida | RN-24, CA-18.2, F20 |
| DF-64 | Status anterior e novo, usuário, data, hora e justificativa | Ajustada | RN-22, CA-17.4 |
| DF-69 | Manter a lista, evitar duplicidades e preservar vínculos | Ajustada. Nome único na lista | DF-69, CA-18.6 |
| DF-78 | Preservar resultados e proteger o instrumento e a metodologia | Já atendida | F20, RN-25, RNF-06 |
| DF-80 | Vincular planos à avaliação que os originou | Já atendida | F07, CA-20.7 |
| DF-81 | Expansão futura sem dependência excessiva, dentro do escopo | Já atendida: listas e prazos são parâmetros, e o restante fica para evolução | DF-81, seção 11 |
| DF-82 | Atualizar os três textos, preservando o histórico | Ajustada, pela DF-16 | F14, DF-82 |
| DF-83 | Domínio, DNS, código, hospedagem e acessos sob controle da ELO; responsabilidades definidas | Ajustada. Tabela de responsabilidades na arquitetura | RNF-13, DF-83, arquitetura seção 8 |

**Comentário final da Cleo.** Ela reforçou cinco princípios: governança e rastreabilidade, autonomia da ELO, segurança e confidencialidade, flexibilidade para crescer e proteção da metodologia. Pediu foco no escopo acordado para o MVP, sem complexidade desnecessária. Pediu também esta versão revisada do PRD, deixando claro o que foi aprovado, o que foi incorporado e o que precisa de alinhamento, com os ajustes refletidos nos critérios de aceite. Esta seção e os critérios novos respondem a esse pedido.

---

## 15. Detalhamentos

| ID | Detalhamento | Situação |
|---|---|---|
| DT-01 | Fluxos alternativos e de exceção de todos os casos de uso | Feito na v1.12: seção 7.1 |
| DT-03 | Mensagens de validação e estados vazios | Depois da validação do protótipo, por ser especificação de interface |
| DT-04 | Layout e campos do PDF da Visão Executiva | No protótipo. Os blocos estão na DF-74, a origem de cada um em F14 e a apresentação da DSI Network serve de referência visual [EX] |
| DT-05 | Textos legais dos formulários do site | Feito na v1.12: Apêndice E. Versão 1 definida em 10/11/2026 (14.2, item 4) |
| DT-06 | Critérios de aceite das regras em formato de cenário | Feito na v1.12: Apêndice D |

A DT-02 (máquina de estados) foi feita na v1.7, na seção 6.1.

---

## Apêndice A. Aderência à proposta: nada fica de fora

Cada item da proposta de serviço, que integra o contrato pela cláusula 16ª, e onde ele está neste PRD. Itens de processo do projeto, que não são requisitos do produto, apontam para `descoberta/Critérios de aceite.md`.

| Item da proposta | Onde está |
|---|---|
| **Etapa 1** · Modelagem de dados e encadeamento Cliente → … → Resultados | Seção 1 (ciclo) e RN-02. O modelo de dados sai do documento de arquitetura |
| Regras de negócio de vigência | RN-03, RN-04, RN-05, F04 |
| Regras de criticidade | RN-07, F05 |
| Regras de inativação | RN-13, RN-17, RN-18, RN-24, seção 6.1, F18, DF-36, DF-38, DF-51, DF-62 |
| Regras de rastreabilidade | F17, RNF-07 |
| Perfis de acesso do Administrador ELO e da Equipe ELO | Seção 4.3, RN-01 |
| Mapa de telas | Seção 10 |
| Critérios de aceite de cada funcionalidade | CAs de F01 a F20, cenários das regras (Apêndice D) e fluxos alternativos (seção 7.1) |
| Decisões de kickoff (categorias, serviços, arquivos, dados do especialista, endereço das notificações e demais do MVP §34) | DF-70 (categorias e serviços), DF-72 (arquivos, e-mail da Central e prazo), F11 (ata, decisão 7), DF-75 (exportação), DF-74 (PDF) e Apêndice C |
| Plano de ação com cronograma; definição dos responsáveis | Fora do PRD (processo): Critérios de aceite 1.17 e 1.4 |
| **Etapa 2** · Telas de clientes, contratos e propostas, Escopo, planos e atividades, Central ELO, área documental, dashboard e Visão Executiva | Seção 10 |
| Padrão visual e biblioteca de componentes | Fora do PRD: sai do protótipo (Etapa 2) |
| **Etapa 3** · Cadastro de clientes | F02 |
| Contratos e propostas com acompanhamento de vigência e alerta interno de vencimento | F03, F04 |
| Escopo Contratado com status, prioridade e criticidade | F05 |
| Jornada ELO aplicada ao escopo | F06 |
| Planos de ação e atividades com identificação automática de atraso | F07, F08, RN-09 |
| Central ELO com registro, triagem, direcionamento, acompanhamento e notificação por e-mail | F09, F10 |
| Cadastro de especialistas | F11 |
| Organização documental com categorias, status e vínculo a escopos, atividades e demandas | F12 |
| Dashboard operacional | F13, F15 |
| Visão Executiva do Cliente com relatório resumido em PDF | F14 |
| Autenticação · controle por perfis · segregação lógica · HTTPS · backup · rastreabilidade básica | F01, RNF-01 · 4.3, RNF-02 · RN-01 · RNF-03 · RNF-04 · F17 |
| Publicação em ambiente acessível pela internet | RNF-09, RNF-17 |
| Código em repositório de titularidade da ELO | RNF-13 |
| Entregas incrementais e registro das aprovações | Fora do PRD (processo): Critérios de aceite 3.1 e 3.20 |
| **Etapa 4** · Testes, ajustes de aceitação, validação dos CAs, capacitação, material de apoio, transferência de ativos | RNF-13, RNF-14 e Critérios de aceite 4.1 a 4.9 |
| **Anexo I** · Infraestrutura (hospedagem, banco, e-mail transacional, SSL, domínio) e custo mensal | RNF-03, RNF-12, RNF-15, RNF-17 |
| **Anexo II** · Propriedade intelectual da ELO | RNF-13 |
| Método ELO confidencial | RNF-06 |
| Repositório e contas em nome da ELO desde o início | RNF-13. O repositório vai para a conta da ELO com a aprovação do protótipo |
| Funcionalidades fora do escopo | Seção 11 |
| Site: integração aos formulários de diagnóstico e de especialistas; reformulação completa fora | F19, seção 11 |

## Apêndice B. Itens do PRD sem menção explícita na proposta

Tudo o que o PRD traz além do texto literal da proposta, com a classificação. **Detalhe:** detalha um item previsto, sem criar escopo novo. **Diretriz:** orienta, mas não é critério de aceite. **Decisão:** pode representar escopo novo e precisa ser fechada pela Result antes de ir para a Cleo.

| Item | Onde | Classe | Justificativa |
|---|---|---|---|
| Convite de usuário, recuperação de senha e expiração de sessão | F01, DF-04 | Detalhe | Parte de "autenticação" [PROP Etapa 3] |
| Listas oficiais editáveis pelo Administrador | DF-01, UC-03 | Detalhe | Princípio de ausência de dependência obrigatória do desenvolvedor, citado na própria proposta (Etapa 4) [MVP §2] |
| Pesquisa e filtros das listas | F16 | Detalhe | MVP §25, dentro das telas de cada módulo |
| Exportação para Excel/CSV | F16, DF-75 | Detalhe | Decisão de kickoff do MVP §34, confirmada pela Cleo só para o Administrador |
| Alertas de escopo crítico, demanda crítica, demanda vencida e atividade próxima do prazo | F15 | Detalhe | MVP §21 e §24. Aparecem dentro do dashboard, sem módulo próprio (DF-15) |
| Página do cliente como centro de navegação e lista "Minhas atividades" | DF-06, CA-08.4 | Detalhe | Organização das telas que a proposta lista |
| Proteção contra envio automatizado nos formulários do site | CA-19.4 | Detalhe | Requisito de segurança para formulário público [PROP Etapa 3] |
| Documento superado aponta para o substituto | DF-13 | Detalhe | MVP §17. Não é controle de versões, que está fora [MVP §31] |
| Frequência e retenção do backup | RNF-04, DF-18 | Detalhe | A proposta exige "rotina de backup" sem fixar frequência. Os 30 dias e a cópia independente vêm da Cleo [FORM2] e somam custo de armazenamento (DA-07) |
| Desempenho, navegadores e acessibilidade | RNF-08, RNF-10, RNF-16 | Diretriz | Não são critérios de aceite do contrato |
| Métricas de sucesso | Seção 8 | Diretriz | Medem o produto, não o aceite do projeto |
| Validade de documentos com alerta | Seção 11 | **Fora (v1.2)** | Decisão da Result: o MVP §6 cita documentos com validade "quando aplicável", mas a proposta prevê acompanhamento de vigência e alerta só para contratos (Etapa 3) |
| Redesenho da página do site institucional | F19, CA-19.5 | **Incluído (v1.2). Extra além do escopo contratado** | Decisão da Result para atender a ata de 30/10. Entre a ata e a proposta, o que vale é o redesenho (Jonathan Silva, 10/11/2026). Vai além do texto da proposta, que cobre só a integração dos formulários |
| Regras de borda dos edge cases: responsável com vínculo, prazos no horário de Brasília, avisos de datas, mover escopo, filtro por contrato e conteúdo vedado na Visão Executiva | RN-19 a RN-21, DF-35 a DF-57 | Detalhe | Fecham o comportamento de funcionalidades previstas na proposta, sem criar módulo ou tela nova (v1.5) |
| Ciclo de vida das entidades: status, transições e quem pode executar cada uma | Seção 6.1, RN-22 a RN-24, DF-58 a DF-64 | Detalhe | Organiza os status que o MVP já prevê, sem criar status novo (v1.7) |
| **Avaliação de maturidade, versão enxuta** | F20, RN-25, DF-78 a DF-80, UC-22 | **Incluído (v1.9). Extra além do escopo contratado** | Decisão da Result, e a decisão é final (Jonathan Silva, 10/11/2026): o diagnóstico de maturidade é o centro do trabalho da ELO [FORM PD-32, EX], e a maturidade inicial e atual foi pedida em 07/09 [R0709]. Não consta da proposta e cria tela e tabela novas. Cabe na regra de controle de escopo [MVP §32] porque acompanha os resultados do cliente. Enxuta para caber no prazo: guarda só o resultado, sem questionário nem cálculo |
| Campos Contratante e Tipo de vigência no contrato | F03, DF-68, DF-69 | Detalhe | Consequência das respostas à PD-32 e à PD-33, dentro do cadastro de contratos previsto |
| Executor da atividade | F08, DF-71 | Detalhe | Resposta da Cleo à PD-13; um campo de texto |
| Textos da Visão Executiva por cliente, com Próximos passos | F14, DF-73, DF-82 | Detalhe | MVP §22 já prevê os dois textos; a PD-19 definiu onde ficam |
| Prazos dos alertas como parâmetros | DF-81 | Detalhe | Atende o pedido de parametrização da Cleo com dois valores que já existiam, sem alertas novos |
| **Histórico com valor anterior e novo** | F17, CA-17.3, DF-16 | **Incluído (v1.14). Extra além do escopo contratado** | Pedido da Cleo [FORM2], atendido na versão mais enxuta possível por decisão de Jonathan Silva (Result), em 10/11/2026. A proposta cobre a "rastreabilidade básica de criação e alteração de registros", e por isso o valor anterior tinha saído na v1.1. Não cria módulo: é uma lista só de leitura na página de cada registro |
| Ajustes das ressalvas da validação: mais de um especialista por demanda, contato com o especialista, retorno ao cliente, demandas institucionais da ELO, justificativas, redistribuição de itens, alertas de contrato vencido e de especialista inativo, identificações visuais, progresso da Jornada, ciclo anterior, histórico de candidaturas, remetentes, referências de prazo e início da operação | Seção 14.3 | Detalhe | Fecham o comportamento de funcionalidades previstas na proposta, sem criar módulo ou tela nova (v1.14) |

## Apêndice C. Listas oficiais e parâmetros iniciais

Valores com que a plataforma entra no ar. As listas são editáveis pelo Administrador (DF-01) [FORM].

**Serviços** (DF-70, PD-02). Os serviços que o cliente presta ao contratante, ou seja, o objeto do contrato gerido na plataforma: Manutenção Industrial · Manutenção Mecânica · Manutenção Elétrica e Instrumentação · Engenharia · Inspeção e Integridade de Ativos · Construção e Montagem Industrial · Operação e Apoio Operacional · Logística e Transporte · Movimentação de Cargas · Serviços Portuários e Marítimos · Serviços Offshore · Limpeza e Conservação · Gestão Ambiental · Segurança, Saúde e Meio Ambiente (SSMA) · Tecnologia da Informação · Consultoria e Assessoria Técnica · Gestão de Projetos · Fornecimento de Mão de Obra Especializada · Caldeiraria e Soldagem · Facilities.

**Contratantes** (DF-69). Os citados nas fontes: Petrobras · Porto do Açu · FMC Logística [R0709, EX]. Os demais entram no cadastro dos contratos.

**Categorias da Central ELO** (DF-70, PD-01): Dúvida contratual · Revisão de cláusula · Pedido de documento · Prazos e obrigações do contrato · Financeiro (medição, faturamento, reajuste) · Suprimentos e compras · Riscos e conformidade · ESG e sustentabilidade · Gestão e desenvolvimento de fornecedores · Indicadores de desempenho (KPIs e SLAs) · Documentação e mobilização de fornecedores · Auditoria e avaliação de fornecedores · Outros assuntos. A Cleo não marcou "Outros assuntos" no formulário, mas pediu para manter as sugeridas; a categoria fica como escape para o que não se encaixa (mantida em 10/11/2026).

**Especialidades** (DF-70, PD-23): Jurídico (contratos, cláusulas e compliance) · Gestão de contratos · Financeiro · Suprimentos e compras · Gestão de riscos · ESG e sustentabilidade · Gestão e desenvolvimento de fornecedores.

**Segmentos dos clientes** (DF-70, PD-23): Óleo e gás · Portuário e logística · Indústria · Construção e montagem · Manutenção e serviços industriais · Serviços gerais · Offshore e Serviços Marítimos · Infraestrutura · Energia · Mineração · Tecnologia.

**Dimensões de maturidade** (DF-70, F20). As 8 do Teste de Maturidade e Prontidão da ELO [EX]: Regularidade e documentação · Capacidade técnica · Capacidade operacional · Gestão e qualidade · Saúde, segurança e ambiente · Sustentação financeira · Gestão comercial e contratual · Integridade e informação.

Os níveis das dimensões, da maturidade geral e da prontidão são fixos e estão em F20.

**Categorias de documento:** as de F12 [MVP §15].

**Cadastro da ELO como cliente** (DF-40). ELO HUB Governança Inteligente LTDA, CNPJ 68.308.773/0001-73, com status Ativo, só para as demandas institucionais da própria ELO.

**Parâmetros**

| Parâmetro | Valor inicial | Quem altera | Fonte |
|---|---|---|---|
| Dias de antecedência de "próxima do prazo" | 5 | Administrador, na tela de configurações | DF-72, DF-81 |
| Dias de antecedência do alerta de vencimento | 30 | Administrador, na tela de configurações | DF-34, DF-81 |
| Remetente de cada finalidade | atendimento@elogovernance.com.br | Administrador, na tela de configurações, entre endereços do domínio | DF-21 |
| Referência de prazo por criticidade | Vazia: a ELO define os valores | Administrador, na tela de configurações | DF-22 |
| Início oficial da operação | Não registrado | Administrador, na tela de configurações | DF-46 |
| E-mail da Central ELO | atendimento@elogovernance.com.br | Configuração técnica | DF-72 |
| Formatos de arquivo aceitos | PDF, Word, Excel, PowerPoint, .jpg, .png, .msg, .eml | Configuração técnica | DF-72 |
| Tamanho máximo por arquivo | 10 MB | Configuração técnica | DF-72 |

---

## Apêndice D. Cenários das regras

As regras da seção 6 em formato de cenário (dado, quando, então). Junto com os critérios de aceite das funcionalidades, são o roteiro dos testes da Etapa 4 [PROP Etapa 4]. O código CN-04.2 é o segundo cenário da RN-04. Nos cenários com data, hoje é 10/03/2027, os parâmetros têm os valores iniciais do Apêndice C (30 dias para o alerta de vencimento e 5 dias para "próxima do prazo"), o início oficial da operação já foi registrado, salvo quando o cenário diz o contrário, e a usuária Ana é da Equipe, vinculada só ao cliente A. (DT-06, feita na v1.12.)

| ID | Dado | Quando | Então |
|---|---|---|---|
| CN-01.1 | Ana, vinculada só ao cliente A | Ela busca o cliente B pelo nome ou abre o link direto de um contrato de B | B não aparece na busca, e o link mostra acesso negado |
| CN-01.2 | Ana, vinculada só ao cliente A | Ela abre o dashboard, a lista de demandas ou a Visão Executiva | Só aparecem dados de A |
| CN-01.3 | Ana, vinculada só ao cliente A, e o cliente B Ativo | Ela registra uma demanda para B, escolhendo B pelo nome | A demanda é gravada e Ana vê o número, mas B continua fora das buscas e das listas dela |
| CN-01.4 | O cliente C, Inativo | Ana registra uma demanda | C não aparece na lista de clientes para registro |
| CN-02.1 | O escopo E, do contrato C, do cliente A | Um plano é criado em E | O plano fica com o cliente A, sem opção de escolher outro |
| CN-02.2 | Uma avaliação de maturidade do cliente A | O usuário escolhe o contrato de referência | Só aparecem contratos de A |
| CN-02.3 | O escopo E, com planos e uma demanda, no contrato C1 do cliente A | O Administrador move E para o contrato C2, também de A | Planos, atividades e demanda continuam ligados a E, agora em C2, e a mudança fica no registro de alterações |
| CN-02.4 | O escopo E, no contrato C1 do cliente A | O Administrador tenta mover E para um contrato do cliente B | Os contratos de B não aparecem para escolha |
| CN-03.1 | Contrato com vigência por prazo determinado, sem data de término | Ele vai para Ativo | Recusa, com mensagem |
| CN-03.2 | Contrato por prazo indeterminado, com início em 01/02/2027 e sem término | Ele vai para Ativo | Aceita |
| CN-03.3 | Contrato com início em 01/03/2027 | O término informado é 28/02/2027 | Recusa, com mensagem |
| CN-04.1 | Contrato Ativo com término em 09/03/2027 | A vigência é consultada | Vigência Vencido, e o status do contrato continua Ativo |
| CN-04.2 | Contratos Ativos com término em 09/04/2027 e em 10/04/2027 | A vigência é consultada | O primeiro, a 30 dias, está Próximo do vencimento; o segundo, a 31, está Vigente |
| CN-04.3 | Contrato Ativo com término em 10/03/2027, hoje | A vigência é consultada | Próximo do vencimento, e não Vencido; vira Vencido em 11/03 |
| CN-04.4 | Contrato Suspenso com término em 20/03/2027 | A vigência é consultada | Próximo do vencimento, com alerta |
| CN-04.5 | Contrato Ativo por prazo indeterminado | A vigência é consultada | Vigente, sem dias restantes |
| CN-04.6 | Um contrato em Proposta e um Encerrado | A vigência é consultada | O primeiro não tem status de vigência; o segundo está Encerrado |
| CN-05.1 | Contrato Ativo com término em 09/04/2027 | Um usuário com acesso abre o dashboard | O alerta de vencimento aparece |
| CN-05.2 | Contrato Ativo com término em 19/04/2027, a 40 dias | O Administrador muda o alerta de vencimento para 45 dias | O contrato passa a ter alerta |
| CN-05.3 | Contrato Ativo por prazo indeterminado | A qualquer momento | Nunca gera alerta de vencimento |
| CN-05.4 | Contrato Ativo com término em 09/03/2027 | Um usuário com acesso abre o dashboard | O alerta de contrato vencido aparece, e o contrato continua Ativo |
| CN-06.1 | Cliente cadastrado com um CNPJ | Outro cliente é salvo com o mesmo CNPJ | Recusa |
| CN-06.2 | Um CNPJ com o dígito verificador errado | O cliente é salvo | Recusa, com mensagem |
| CN-06.3 | Cliente com dois contratos | Os contratos são consultados | Cada contrato tem o seu código, e o CNPJ é o do cliente |
| CN-07.1 | Um escopo | O Administrador define a criticidade Alta sem justificativa | Não salva |
| CN-07.2 | Escopo com criticidade Alta | O Administrador muda para Crítica, com justificativa | Salva, e fica registrado quem mudou, quando, e os níveis anterior e novo |
| CN-07.3 | Ana, num escopo do cliente A | Ela abre o escopo | Ela vê a criticidade, mas não consegue mudá-la |
| CN-08.1 | Um escopo recém-criado | O escopo é aberto | As 5 etapas estão em Não iniciada, e a etapa atual é "Não iniciada" |
| CN-08.2 | Diagnosticar Concluída, Estruturar Em andamento e Implementar Concluída | A etapa atual é calculada | A etapa atual é Estruturar |
| CN-08.3 | Diagnosticar e Estruturar como Não aplicável | Implementar vai para Em andamento | Aceita, e a etapa atual é Implementar |
| CN-08.4 | Quatro etapas Não aplicável | A última etapa aplicável é marcada como Não aplicável | Recusa |
| CN-08.5 | Etapa com um documento ligado | Ela é marcada como Não aplicável | Recusa |
| CN-08.6 | Uma etapa Concluída | Ana tenta reabrir; depois o Administrador reabre | Ana não consegue; o Administrador consegue |
| CN-09.1 | Atividade Em andamento com prazo em 09/03/2027 | O indicador é calculado | Atrasada |
| CN-09.2 | Atividade Em andamento com prazo em 10/03/2027 | O indicador é calculado em 10/03 e em 11/03 | Em 10/03 não está atrasada; em 11/03 está |
| CN-09.3 | Atividades com prazo em 09/03/2027, uma Concluída e uma Cancelada | O indicador é calculado | Nenhuma está atrasada |
| CN-09.4 | Atividade nova com prazo em 05/03/2027 | Ela é salva | Nasce Atrasada |
| CN-10.1 | Atividades abertas com prazo em 10/03, 15/03 e 16/03/2027 | O indicador é calculado | As duas primeiras estão próximas do prazo; a de 16/03 não |
| CN-10.2 | Atividade aberta com prazo em 16/03/2027 | O Administrador muda "próxima do prazo" para 7 dias | Ela passa a estar próxima do prazo |
| CN-11.1 | Demanda com triagem para Ana e sem responsável pelo atendimento | A demanda é registrada | Ana e a caixa da Central recebem o e-mail de F10 |
| CN-11.2 | O serviço de e-mail fora do ar | Uma demanda é registrada | A demanda fica gravada, com número, e a falha vai para o log técnico |
| CN-11.3 | A última demanda de 2026 é ELO-2026-0042 | A primeira demanda de 2027 é registrada | Recebe o número ELO-2027-0001 |
| CN-11.4 | Demanda já registrada | Um especialista é vinculado a ela na triagem | O especialista não recebe e-mail; o analista o aciona (DF-30) |
| CN-11.5 | O início oficial da operação ainda não foi registrado | Uma demanda é registrada | A demanda fica gravada, com número, e nenhum e-mail sai |
| CN-12.1 | Demanda Em atendimento | Ela vai para Resolvida sem o campo Solução | Recusa |
| CN-12.2 | Demanda Resolvida | Ela é encerrada, com o retorno ao cliente registrado | Fica Encerrada, com a data de encerramento gravada |
| CN-12.3 | Demanda Em triagem duplicada, sem responsável pelo atendimento | O responsável pela triagem a encerra, com a justificativa no campo Solução | Aceita |
| CN-12.4 | Demanda Resolvida | Ana a volta para Em atendimento sem comentário; depois, com comentário | A primeira tentativa é recusada; a segunda é aceita |
| CN-12.5 | Demanda Encerrada | Ana tenta reabrir | Não consegue; só o Administrador reabre |
| CN-12.6 | Demanda Resolvida | Ela é encerrada sem o retorno ao cliente | Recusa |
| CN-13.1 | Ana, num documento do cliente A | Ela procura a opção de excluir | A opção não existe para ela |
| CN-13.2 | Contrato criado por engano, sem nada ligado | O Administrador confirma e justifica a exclusão | O contrato some e a exclusão fica no log técnico, com usuário, data e justificativa |
| CN-13.3 | Contrato com um documento ligado | O Administrador abre o contrato | A opção de excluir não aparece |
| CN-13.4 | Serviço da lista oficial usado em contratos | O Administrador o inativa | O serviço some das novas escolhas e continua nos contratos que o usam |
| CN-13.5 | Contrato criado por engano, sem nada ligado | O Administrador tenta excluir sem justificativa | Não exclui |
| CN-14.1 | Um especialista Em análise e um Inativo | Um escopo ou uma demanda vai receber um especialista | Nenhum dos dois aparece para vínculo |
| CN-14.2 | Especialista vinculado a uma demanda aberta | O Administrador o inativa | Aceita, o vínculo na demanda aparece sinalizado para troca, e o responsável recebe um alerta até a troca |
| CN-14.3 | Demanda com dois especialistas Ativos | Ela é salva sem indicar o principal; depois, indicando | A primeira tentativa é recusada; a segunda é aceita |
| CN-15.1 | Um documento Vigente | Ele é marcado como Superado sem indicar o substituto | Recusa |
| CN-15.2 | Documento Superado | Ele é aberto | Continua consultável, com o link para o documento que o substituiu |
| CN-16.1 | Documento do cliente B | Ana tenta abrir o link de download | Acesso negado |
| CN-16.2 | Documento do Especialista sem cliente | Ana abre e baixa o documento, depois tenta alterá-lo | Ela consegue abrir e baixar, mas não alterar |
| CN-17.1 | Um plano Concluído | Ana tenta reabrir; depois o Administrador reabre, com justificativa | Ana não consegue; o Administrador reabre e escolhe o status de volta, e o histórico guarda a justificativa e os status anterior e novo |
| CN-17.2 | Uma avaliação de maturidade Concluída | Ana tenta editar um nível | Não consegue |
| CN-17.3 | Um plano Concluído | O Administrador tenta reabrir sem justificativa | Recusa |
| CN-18.1 | Contrato com um escopo Em andamento e uma demanda Em atendimento | O Administrador tenta encerrar o contrato | Bloqueia e lista os dois itens, com tipo, status, responsável e link para cada um |
| CN-18.2 | Escopo com uma etapa da Jornada Em andamento | O Administrador tenta concluir o escopo | Bloqueia e lista a etapa |
| CN-18.3 | Cliente com uma avaliação de maturidade Em elaboração | O Administrador tenta inativar o cliente | Bloqueia e lista a avaliação |
| CN-18.4 | Ana, responsável por uma atividade aberta do cliente A | O Administrador tenta inativar Ana ou tirar o vínculo dela com A | Bloqueia e lista a atividade |
| CN-19.1 | Bruno, da Equipe, sem vínculo com o cliente A | Alguém escolhe o responsável de uma atividade de A | Bruno não aparece; os Administradores e Ana aparecem |
| CN-19.2 | Uma avaliação de maturidade do cliente A | Alguém escolhe o avaliador | Só aparecem Administradores e usuários vinculados a A |
| CN-20.1 | Atividade com prazo em 10/03/2027 | O indicador é calculado às 22h de 10/03, no horário de Brasília, quando já é 11/03 em UTC | Não está atrasada; o atraso começa à 0h de 11/03, no horário de Brasília |
| CN-21.1 | Plano com prazo em 31/03/2027 | Uma atividade dele é salva com prazo em 15/04/2027 | Mostra o aviso; confirmado, salva |
| CN-21.2 | Um contrato com término em 30/06/2027 e um por prazo indeterminado | Um escopo de cada um é salvo com conclusão prevista em 31/07/2027 | Os dois salvam; só o primeiro mostra o aviso e pede confirmação |
| CN-22.1 | Demanda Em atendimento | O Administrador a volta para Em triagem, com justificativa | Aceita, desde que cumpra as exigências de Em triagem |
| CN-22.2 | Atividade Concluída com data de conclusão gravada | O Administrador a reabre para Em andamento, com justificativa | Aceita, e a data de conclusão é apagada |
| CN-23.1 | Contrato Encerrado | Alguém tenta criar um escopo nele; depois liga um aditivo e uma demanda | O escopo é recusado; o aditivo e a demanda são aceitos |
| CN-23.2 | Avaliação de maturidade Concluída | Um plano de ação e um documento são ligados a ela | Aceita, e os níveis continuam iguais |
| CN-23.3 | Escopo Concluído | Alguém tenta mudar uma etapa da Jornada dele | Recusa |
| CN-24.1 | Cliente Inativo | A lista padrão de clientes é aberta, depois filtrada por Inativo | Ele não aparece na lista padrão e aparece no filtro, com o histórico consultável |
| CN-24.2 | Um contrato Ativo | O Administrador procura a opção de inativar | Ela não existe; o contrato fecha por Encerrado ou Cancelado |
| CN-25.1 | Cliente com avaliações Concluídas em 10/01/2027 e 10/07/2027 | A página do cliente é aberta | A inicial é a de janeiro, e a atual, a de julho |
| CN-25.2 | Cliente com uma só avaliação Concluída | A página do cliente é aberta | Ela aparece como inicial e como atual |
| CN-25.3 | Duas avaliações Concluídas com a mesma data | A página do cliente é aberta | A inicial é a criada primeiro |
| CN-25.4 | Uma avaliação Concluída e uma Em elaboração mais recente | A página do cliente é aberta | A Em elaboração não conta: a Concluída é a inicial e a atual |
| CN-25.5 | Avaliações com o contrato C1 e com o C2 de referência | A Visão Executiva é filtrada por C1 | Contam só as avaliações com C1 |
| CN-25.6 | Uma dimensão com média 2,10 | O avaliador informa o nível Avançada | O sistema aceita, sem converter nem conferir |
| CN-25.7 | Dimensão que existe na avaliação inicial e não existe na atual | A comparação é mostrada | Ela aparece como Não avaliada na atual |

---

## Apêndice E. Textos dos formulários do site

Texto da Result, escrito a partir da ata [ATA §5] e dos requisitos de LGPD do PRD (RNF-05, DF-19). Os textos ficaram definidos em 10/11/2026 como versão 1, e a Cleo pode passar pelo jurídico dela antes de os formulários irem ao ar. Cada texto tem uma versão, gravada com a data e a hora do aceite (CA-19.2). Uma mudança de texto gera uma versão nova, e os aceites antigos continuam ligados à versão que a pessoa aceitou. (DT-05, feita na v1.12.)

**E.1 Cadastro de especialista**

Aviso, com caixa de marcação obrigatória (versão 1):

> Entendo que este cadastro não garante contratação nem demanda. Ele serve apenas como banco de candidaturas da ELO HUB Governança Inteligente, que pode entrar em contato quando surgir uma oportunidade compatível com o meu perfil.

Consentimento, com caixa de marcação obrigatória (versão 1):

> Autorizo a ELO HUB Governança Inteligente LTDA, CNPJ 68.308.773/0001-73, a usar os dados que informei neste formulário (nome, data de nascimento, quando informada, e-mail, telefone, cidade e estado, especialidade, empresa e link do currículo) para avaliar a minha candidatura e entrar em contato comigo sobre oportunidades. Meus dados ficam guardados enquanto houver relação com a ELO e por até 2 anos depois do último contato, salvo obrigação legal de mantê-los por mais tempo. Posso pedir a consulta, a correção ou a exclusão dos meus dados a qualquer momento pelo e-mail atendimento@elogovernance.com.br.

Confirmação na tela, depois do envio:

> Recebemos a sua candidatura. Ela fica no banco de especialistas da ELO, e entraremos em contato se surgir uma oportunidade compatível com o seu perfil.

**E.2 Solicitação de diagnóstico**

Consentimento, com caixa de marcação obrigatória (versão 1):

> Autorizo a ELO HUB Governança Inteligente LTDA, CNPJ 68.308.773/0001-73, a usar os dados que informei neste formulário para responder ao meu pedido de diagnóstico e entrar em contato comigo sobre os serviços da ELO. Meus dados ficam guardados enquanto houver relação com a ELO e por até 2 anos depois do último contato, salvo obrigação legal de mantê-los por mais tempo. Posso pedir a consulta, a correção ou a exclusão dos meus dados a qualquer momento pelo e-mail atendimento@elogovernance.com.br.

Confirmação na tela, depois do envio:

> Recebemos o seu pedido de diagnóstico. A equipe da ELO vai entrar em contato pelo e-mail ou telefone que você informou.

---

## Apêndice F. Aderência ao escopo

**Índice de aderência ao escopo: 108%.** 100% é exatamente o escopo contratado. Abaixo de 100%, falta algo da proposta; acima, o PRD vai além dela. (Métrica da Result, v1.13; recalculada na v1.15.)

**Como é calculado.** Índice = cobertura + excedente.
- **Cobertura:** itens de produto da proposta atendidos no PRD ÷ itens de produto da proposta. São os itens do Apêndice A, sem os 3 de processo do projeto (plano de ação, padrão visual e registro das aprovações). Hoje: 30 de 30, ou 100%.
- **Excedente:** critérios de aceite de itens além da proposta ÷ critérios de aceite do escopo contratado. O critério de aceite é a unidade porque é o que se entrega e se testa na Etapa 4. Hoje: 10 ÷ 126, ou 7,9%. Os itens da classe Detalhe do Apêndice B não contam, porque só fecham o comportamento do que a proposta já prevê.

**Extras além do escopo contratado.** Os três itens abaixo são decisão de Jonathan Silva (Result), registrada em 10/11/2026. Entram sem custo adicional e não dependem de aceite da Cleo.

| Extra além do escopo contratado | Critérios de aceite | Decisão |
|---|---|---|
| Avaliação de maturidade, versão enxuta (F20) | 8 (CA-20.1 a CA-20.8) | Decisão da Result na v1.9, e a decisão é final |
| Redesenho da página do site institucional (F19) | 1 (CA-19.5) | Decisão da Result na v1.2. A ata de 30/10 registra a atualização do site, e a proposta cobre só a integração dos formulários [ATA §3, PROP]. O que vale é o redesenho |
| Histórico com valor anterior e novo (DF-16) | 1 (CA-17.3) | Pedido da Cleo na v1.14 [FORM2], atendido na versão mais enxuta possível. A proposta cobre a rastreabilidade básica |
| **Total** | **10 de 136** | |

Sem a F20, o índice seria de 101,6%; sem os três itens, de 100%. Os outros 19 critérios de aceite novos da v1.14 e da v1.15 são da classe Detalhe e não contam no índice, mas somam trabalho na Etapa 3. O que saiu do MVP e a proposta não cobria, como a validade de documentos e o questionário do diagnóstico, não reduz a cobertura, porque a base é a proposta. A métrica é recalculada a cada versão do PRD.
