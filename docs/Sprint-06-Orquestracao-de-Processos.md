# Sprint 06 - Orquestracao de Processos

## Objetivo
Consolidar o Processo como objeto central da experiencia BureauFlow, conectando modulos ja existentes (Documentos, Assinaturas, BureauIA e Auditoria) sem recriar funcionalidades.

## Escopo Implementado
- Menu principal consolidado com: Visao geral, Processos, Clientes, Documentos, Assinaturas, BureauIA, Auditoria.
- Pagina Processos com:
  - cards de resumo;
  - busca, filtros, ordenacao;
  - paginacao simulada;
  - selecao;
  - menu contextual.
- Fluxo Novo Processo em 5 etapas:
  - Informacoes
  - Cliente
  - Partes
  - Checklist inicial
  - Revisao
- Edicao de processo implementada (nao simulada).
- Duplicacao e arquivamento implementados no menu contextual.
- Pagina central do processo com:
  - status;
  - proxima acao;
  - timeline;
  - abas de contexto.
- Abas do processo:
  - Visao geral
  - Partes
  - Documentos
  - Assinaturas
  - Tarefas
  - Prazos
  - BureauIA
  - Auditoria
- Tarefas e Prazos com operacoes locais (mock): criar, editar status, concluir, atribuir, definir prazo.

## Reuso de Modulos Existentes
- Documentos: `src/app/DocumentManagementModule.tsx`
- Assinaturas: `src/app/ElectronicSignaturesModule.tsx`
- BureauIA: `src/app/BureauIAModule.tsx`
- Auditoria: visao consolidada em `src/app/AuditCenterModule.tsx` e atalho para fluxo de auditoria existente.

## Arquitetura de Features
Estrutura criada para futura integracao API:
- `src/features/processes`
- `src/features/documents`
- `src/features/signatures`
- `src/features/tasks`
- `src/features/deadlines`
- `src/features/ai`
- `src/features/audit`

## Tipagem e Mock
Modelos tipados criados para contrato funcional:
- Process
- Client
- Party
- Document
- Signature
- Task
- Deadline
- TimelineEvent
- AIInsight
- AuditEvent

Dados mockados centralizados em `src/features/processes/mockData.ts`.

## Ciclo de Status
Fluxo configurado:
- Rascunho
- Em preparacao
- Aguardando informacoes
- Em andamento
- Aguardando assinatura
- Em analise
- Concluido
- Arquivado

Transicoes controladas por regras simples em `src/features/processes/status.ts`.

## Empty States
Cobertura implementada para:
- nenhum processo
- nenhuma parte
- nenhum documento
- nenhuma assinatura
- nenhuma tarefa
- nenhum prazo
- nenhum evento

## Responsividade
- Desktop: tabela completa.
- Mobile: cards para lista de processos.
- Detalhe do processo navegavel em dispositivos menores.

## Acessibilidade
- foco visivel nos controles;
- labels em campos;
- uso de texto em conjunto com cor para status;
- navegacao por teclado nos controles principais.

## Limites Deliberados da Sprint
Nao implementado (conforme escopo):
- banco de dados na feature de processos;
- APIs externas;
- notificacoes externas;
- integracao juridica real.

## Validacao Tecnica
- Sem erros de TypeScript/editor nos arquivos alterados da Sprint 06.
- Configuracao de `backend/tsconfig.json` ajustada para compatibilidade com TypeScript 5.8 local (`ignoreDeprecations: "5.0"`).

## Atualizacao pos-Sprint 06 (estado atual)
- Onboarding refinado com CTA de continuidade no painel e entrada direta por opcoes de trabalho.
- Dashboard principal consolidado com sidebar colapsavel e menu operacional unico.
- Persistencia de sessao e tela ativa no front-end para continuidade apos refresh.
- Error boundary no app para reduzir risco de tela branca silenciosa.
- Ajustes de rede local:
  - front-end em host aberto (`0.0.0.0`) no script `start-dev.bat`;
  - back-end com CORS flexivel em desenvolvimento e escuta por host configuravel.

## Arquivos Criados
- `src/features/processes/ProcessesModule.tsx`
- `src/features/processes/types.ts`
- `src/features/processes/status.ts`
- `src/features/processes/mockData.ts`
- `src/features/documents/index.ts`
- `src/features/signatures/index.ts`
- `src/features/tasks/index.ts`
- `src/features/deadlines/index.ts`
- `src/features/ai/index.ts`
- `src/features/audit/index.ts`
- `src/app/AuditCenterModule.tsx`
- `docs/Sprint-06-Orquestracao-de-Processos.md`

## Arquivos Modificados
- `src/app/App.tsx`
- `.gitignore`
- `backend/tsconfig.json`

## Proximos Passos (pos-Sprint 06)
- conectar `features/processes` com endpoints reais na Sprint seguinte;
- persistir tarefas e prazos por processo;
- testes automatizados de navegacao e transicoes de status.
