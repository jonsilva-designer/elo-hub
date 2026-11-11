# Plataforma ELO

Sistema interno da ELO para clientes, contratos, escopos, planos de ação, Central ELO, especialistas, documentos e Visão Executiva do Cliente.

Desenvolvido pela Result Consultoria e Inovação. As regras de negócio estão no PRD e as decisões técnicas, na arquitetura. Os dois documentos são entregues à ELO fora deste repositório.

## Fase atual: protótipo

Nesta fase, as telas usam só dados fictícios e o login é simulado, com troca de perfil na tela. Na fase de desenvolvimento, os dados passam a vir do Supabase, sem mudança nas telas.

## Como rodar

Requer Node.js 20 ou mais recente.

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Estrutura

```
app/             rotas da plataforma
components/      biblioteca de componentes de interface
lib/dados/       única porta de acesso aos dados pelas telas
lib/dados/mock/  dados fictícios do protótipo, removidos na fase de desenvolvimento
```

## Tecnologia

Next.js 16 (App Router), React 19, TypeScript e Tailwind CSS 4.
