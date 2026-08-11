# SP-05 - Planejamento de Sprint (Modulo Processos)

Objetivo da sprint
- Entregar o modulo Processos com foco em cadastro, acompanhamento por fase, controle de prazo e atribuicao de responsavel.

Escopo
- Dentro do escopo: Processos.
- Fora do escopo: Financeiro e IA (permanecem em backlog).

Status
- Planejada (sem implementacao backend iniciada neste documento).

---

## Epico da sprint

EP-PROC-01 - Gestao de Processos
- Objetivo: estruturar ciclo completo de processos/casos com fases, prazos e responsabilidades.

### Features da sprint

FT-PROC-01 - Cadastro e consulta de processo
- US-PROC-001
  - Historia: Como advogado, eu quero cadastrar um processo com metadados basicos, para centralizar acompanhamento do caso.
  - Criterios de Aceitacao:
    - Dado usuario autenticado, quando cadastrar processo com campos obrigatorios, entao processo deve ser criado com identificador unico.
    - Dado processo criado, quando consultar lista e detalhe, entao dados devem retornar de forma consistente.

FT-PROC-02 - Fluxo por fase do processo
- US-PROC-002
  - Historia: Como equipe juridica, eu quero mover o processo por fases, para refletir o andamento real do caso.
  - Criterios de Aceitacao:
    - Dado processo existente, quando alterar fase, entao nova fase deve ser persistida e historico de mudanca registrado.
    - Dado consulta de timeline, quando listar eventos do processo, entao deve exibir fase anterior, fase atual, usuario e timestamp.

FT-PROC-03 - Prazo e alerta de vencimento
- US-PROC-003
  - Historia: Como advogado, eu quero definir prazo do processo e visualizar vencimento, para evitar perda de prazo.
  - Criterios de Aceitacao:
    - Dado processo com prazo definido, quando prazo for excedido, entao status deve refletir vencimento.
    - Dado painel de processos, quando filtrar por prazo, entao deve separar em no prazo e vencido.

FT-PROC-04 - Responsavel e distribuicao
- US-PROC-004
  - Historia: Como gestor de escritorio, eu quero atribuir responsavel ao processo, para distribuir carga de trabalho.
  - Criterios de Aceitacao:
    - Dado processo existente, quando definir responsavel, entao atribuicao deve ficar visivel no detalhe.
    - Dado troca de responsavel, quando salvar alteracao, entao historico deve registrar autor e timestamp.

---

## Dependencias

- Autenticacao JWT disponivel no backend (ja existente).
- Modelo de armazenamento inicial em memoria seguindo padrao atual (StoreService).
- Definicao de contrato de API para processos (detalhado no plano tecnico).

## Riscos e limites

- Risco: diferenca entre mock frontend e contrato backend inicial.
- Mitigacao: validar cada endpoint com criterios de aceitacao antes de consumo no frontend.
- Limite de sprint: nao incluir faturamento, repasse ou IA neste ciclo.

## Resultado esperado no fim da SP-05

- Historias US-PROC-001 a US-PROC-004 prontas para codificacao e testes no backend.
- Contratos de endpoint e DTO definidos no plano tecnico.
- Matriz de rastreabilidade atualizada para QA e homologacao.
