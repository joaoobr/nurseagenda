

# NurseAgenda — Plano Atualizado (Supabase Externo)

## Mudança Principal
Toda a infraestrutura backend será feita via **Supabase externo** (projeto criado pelo usuário em supabase.com). Nenhum recurso do Lovable Cloud será utilizado — sem banco de dados, autenticação, edge functions ou storage do Lovable Cloud.

## Arquitetura

```text
┌─────────────────────┐       ┌──────────────────────────┐
│   React App (PWA)   │──────▶│   Supabase Externo       │
│   Vite + Tailwind   │       │   - Auth (email/senha)   │
│   react-i18next     │       │   - PostgreSQL + RLS     │
│   Recharts          │       │   - Edge Functions       │
│   Capacitor (mobile)│       │   - Storage (avatars)    │
└─────────────────────┘       └──────────────────────────┘
```

## O que muda em relação ao plano anterior

| Aspecto | Antes | Agora |
|---------|-------|-------|
| Backend | Lovable Cloud | Supabase externo (supabase.com) |
| Auth | Lovable Cloud Auth | Supabase Auth direto |
| DB | Lovable Cloud DB | PostgreSQL do Supabase externo |
| Edge Functions | Lovable Cloud | Supabase Edge Functions (deploy via CLI) |
| Storage | Lovable Cloud | Supabase Storage |
| Secrets | Lovable runtime secrets | Variáveis no Supabase + `.env` local |

## Pré-requisitos (ação do usuário)
1. Criar um projeto no [supabase.com](https://supabase.com)
2. Conectar o projeto Supabase ao Lovable via o conector Supabase (Settings → Integrations)
3. As chaves `SUPABASE_URL` e `SUPABASE_ANON_KEY` (públicas) serão armazenadas no código

## Implementação — Fase 1 (MVP)

### Etapa 1: Setup base + i18n
- Instalar `@supabase/supabase-js`, `react-i18next`, `i18next`, `i18next-browser-languagedetector`
- Criar cliente Supabase com URL e anon key
- Estrutura i18n com 6 idiomas (PT-BR, EN, ES, FR, IT, PT-PT) — arquivos JSON em `src/locales/`
- Layout mobile-first com bottom navigation

### Etapa 2: Autenticação
- Páginas de Login e Cadastro usando Supabase Auth (email/senha)
- Proteção de rotas (componente `ProtectedRoute`)
- Tabela `profiles` no Supabase com RLS (nome, especialidade, registro profissional, idioma preferido)
- Tabela `user_roles` separada para controle de papéis (admin, user)

### Etapa 3: Agenda de Plantões
- Tabela `shifts` com RLS por `user_id`
- Calendário visual (dia/semana/mês)
- CRUD de plantões com cores por tipo de turno

### Etapa 4: Pacientes e Evolução
- Tabelas: `patients`, `nursing_notes`, `vital_signs` — todas com RLS
- Fichas de pacientes com dados completos
- Registro de evolução com sinais vitais
- Gráficos de sinais vitais com Recharts

### Etapa 5: Medicações e Calculadora
- Tabela `medications` com RLS
- Checklist de medicações com status
- Push notifications via Web Push API (navegador)
- Calculadora de dosagem (mg/kg, gotas/min, ml/h)

### Etapa 6: Checklists e Boas Práticas
- Tabela `checklists` e `checklist_items` com RLS
- Templates de procedimentos
- Seção de dicas e protocolos

## Banco de Dados (todas as tabelas no Supabase externo)
Todas as tabelas terão RLS habilitado com políticas baseadas em `auth.uid()` para isolamento multi-tenant completo.

## Próximo Passo
O usuário deve **conectar seu projeto Supabase externo** ao Lovable. Depois disso, começaremos pela Etapa 1 (setup + i18n) e Etapa 2 (autenticação).

