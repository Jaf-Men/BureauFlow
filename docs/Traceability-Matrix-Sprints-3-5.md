# Matriz de Rastreabilidade - Sprints 3 a 5

Objetivo
- Relacionar cada Historia de Usuario com endpoint backend e casos de teste.

Colunas
- Historia
- Endpoint
- Testes minimos
- Status

---

## Sprint 3 - Documentos

US-DOC-001
- Endpoint: GET /documents
- Testes minimos:
  - TST-DOC-001: listar dashboard com totais por status.
  - TST-DOC-002: aplicar filtros e validar retorno.
- Status: Planejada

US-DOC-002
- Endpoint: POST /documents/requests
- Testes minimos:
  - TST-DOC-003: criar solicitacao com payload valido.
  - TST-DOC-004: bloquear criacao com campos obrigatorios ausentes.
- Status: Planejada

US-DOC-003
- Endpoint: GET /documents/categories
- Testes minimos:
  - TST-DOC-005: retornar categorias predefinidas e permitir customizada.
- Status: Planejada

US-DOC-004
- Endpoint: GET /documents/templates
- Testes minimos:
  - TST-DOC-006: listar modelos por dominio juridico.
- Status: Planejada

US-DOC-005
- Endpoint: POST /documents/:id/files
- Testes minimos:
  - TST-DOC-007: upload de arquivo valido.
  - TST-DOC-008: rejeitar formato invalido.
- Status: Planejada

US-DOC-006
- Endpoint: POST /documents/:id/review
- Testes minimos:
  - TST-DOC-009: aprovar documento.
  - TST-DOC-010: recusar documento com comentario.
- Status: Planejada

US-DOC-007
- Endpoint: GET /documents/:id/timeline
- Testes minimos:
  - TST-DOC-011: retornar eventos com usuario e timestamp.
- Status: Planejada

US-DOC-008
- Endpoint: GET /documents
- Testes minimos:
  - TST-DOC-012: refletir estado esperado na listagem apos eventos.
- Status: Planejada

US-DOC-009
- Endpoint: GET /documents
- Testes minimos:
  - TST-DOC-013: validar comportamento de filtros em cenarios mobile/desktop no consumo da API.
- Status: Planejada

---

## Sprint 4 - Assinaturas

US-SIG-001
- Endpoint: GET /signatures
- Testes minimos:
  - TST-SIG-001: retornar fluxo e totais do dashboard.
- Status: Planejada

US-SIG-002
- Endpoint: POST /signatures
- Testes minimos:
  - TST-SIG-002: criar fluxo com signers e tipo valido.
  - TST-SIG-003: rejeitar fluxo sem signer.
- Status: Planejada

US-SIG-003
- Endpoint: POST /signatures/:id/portal/step
- Testes minimos:
  - TST-SIG-004: atualizar passo do portal cliente.
- Status: Planejada

US-SIG-004
- Endpoint: POST /signatures/:id/position
- Testes minimos:
  - TST-SIG-005: persistir posicao de assinatura no canvas.
- Status: Planejada

US-SIG-005
- Endpoint: POST /signatures/:id/sign e POST /signatures/:id/refuse
- Testes minimos:
  - TST-SIG-006: assinar apenas proximo da ordem.
  - TST-SIG-007: recusar com motivo obrigatorio.
- Status: Planejada

US-SIG-006
- Endpoint: POST /signatures/expire-overdue e GET /signatures/:id/certificate
- Testes minimos:
  - TST-SIG-008: expirar fluxos vencidos.
  - TST-SIG-009: emitir certificado ao concluir.
- Status: Planejada

US-SIG-007
- Endpoint: GET /signatures/:id/audit
- Testes minimos:
  - TST-SIG-010: retornar ip, geolocalizacao, timestamp, email e user-agent.
- Status: Planejada

US-SIG-008
- Endpoint: GET /signatures/:id/legal-level
- Testes minimos:
  - TST-SIG-011: mapear tipo para nivel juridico.
- Status: Planejada

US-SIG-009
- Endpoint: POST /signatures/:id/timestamp
- Testes minimos:
  - TST-SIG-012: gerar protocolo e cadeia de evidencias.
- Status: Planejada

US-SIG-010
- Endpoint: GET /signatures/:id/dossier
- Testes minimos:
  - TST-SIG-013: exportar dossie JSON completo.
  - TST-SIG-014: exportar dossie imprimivel.
- Status: Planejada

---

## Sprint 5 - Processos

US-PROC-001
- Endpoint: POST /cases e GET /cases
- Testes minimos:
  - TST-PROC-001: criar processo com campos obrigatorios.
  - TST-PROC-002: listar processos e recuperar item criado.
- Status: Planejada

US-PROC-002
- Endpoint: PATCH /cases/:id/phase e GET /cases/:id/timeline
- Testes minimos:
  - TST-PROC-003: atualizar fase e registrar evento.
  - TST-PROC-004: consultar timeline com autor e timestamp.
- Status: Planejada

US-PROC-003
- Endpoint: PATCH /cases/:id/deadline
- Testes minimos:
  - TST-PROC-005: atualizar prazo e status no_prazo/vencido.
- Status: Planejada

US-PROC-004
- Endpoint: PATCH /cases/:id/owner
- Testes minimos:
  - TST-PROC-006: atribuir/trocar responsavel e registrar historico.
- Status: Planejada

---

## Criterio de uso da matriz

- Nenhuma implementacao backend deve iniciar sem vinculo explicito com Historia e teste minimo.
- Toda entrega concluida precisa atualizar status da linha correspondente.
