# BureauFlow - Product Delivery Methodology

Objetivo
- Padronizar a evolucao do produto com estrutura de requisitos pronta para implementacao no VS Code.
- Reduzir retrabalho entre design, frontend e backend.
- Garantir validacao de cada entrega antes de avancar para a proxima sprint.

## Hierarquia de planejamento

1. Sprint
- Define o modulo principal entregue em um ciclo curto.
- Exemplo: Sprint 3 - Gestao Documental Inteligente.

2. Epico
- Agrupa uma capacidade ampla de negocio.
- Exemplos: Documentos, Assinaturas, IA, Financeiro, Processos.

3. Feature
- Entrega funcional dentro do epico.
- Exemplo: Dashboard Documental.

4. Historia de Usuario
- Comportamento esperado do ponto de vista do usuario.
- Formato recomendado: "Como [perfil], eu quero [acao], para [beneficio]".

5. Criterios de Aceitacao
- Condicoes objetivas para validar a historia antes de seguir.
- Preferencia por formato Given/When/Then.

## Template oficial por historia

Use o bloco abaixo para cada historia:

- ID: US-XXX
- Epico: EP-XXX
- Feature: FT-XXX
- Historia: Como [perfil], eu quero [acao], para [beneficio].
- Prioridade: Alta | Media | Baixa
- Dependencias: [ids ou "nenhuma"]
- Criterios de Aceitacao:
  - Dado [contexto], quando [acao], entao [resultado esperado].
  - Dado [contexto], quando [acao], entao [resultado esperado].
- Evidencia de validacao:
  - Tela/fluxo
  - Regra de negocio
  - Estado de erro
  - Responsividade
  - Observabilidade (logs/auditoria, se aplicavel)

## Definicoes de qualidade

Definition of Ready (DoR)
- Historia com perfil, acao, beneficio e escopo claro.
- Criterios de aceitacao objetivos e testaveis.
- Dependencias mapeadas.
- Risco tecnico principal identificado.

Definition of Done (DoD)
- Criterios de aceitacao atendidos.
- Estados principais e de erro cobertos.
- Comportamento responsivo validado.
- Telemetria/auditoria definida quando houver impacto juridico.
- Documentacao atualizada em docs/.

## Fluxo operacional no VS Code

1. Planejamento da sprint
- Definir modulo da sprint.
- Quebrar em epicos, features e historias.

2. Implementacao
- Executar por feature, seguindo prioridades e dependencias.

3. Validacao
- Rodar checklist de criterios de aceitacao por historia.
- Registrar pendencias e decisoes.

4. Fechamento
- Consolidar status: Implementado, Parcial, Ausente.
- Atualizar backlog e proxima sprint.

## Regras de versionamento de requisitos

- Cada historia deve possuir ID unico e persistente.
- Nao apagar historias antigas; marcar como substituida quando necessario.
- Alteracoes relevantes devem registrar "Motivo da decisao".

## Convencoes de IDs

- Sprint: SP-XX
- Epico: EP-<dominio>-NN (ex.: EP-DOC-01)
- Feature: FT-<dominio>-NN
- Historia: US-<dominio>-NNN

## Backlog e baseline

- Baseline consolidada das sprints anteriores e atuais:
  - docs/Product-Backlog-Sprints-0-4.md
- Documento legado de checklist:
  - docs/Sprint-3-Checklist-e-Sprint-4.md
