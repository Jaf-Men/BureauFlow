# Backend Plan - Sprints 3 a 5 (Endpoint e DTO)

Objetivo
- Converter backlog funcional em tarefas tecnicas de backend por endpoint e DTO.
- Escopo estrito: historias de Documentos (SP-03), Assinaturas (SP-04) e Processos (SP-05 planejada).

Convencoes
- Prefixo de tarefa: BE-
- Relacao com historia: US-*
- Status: Planejada | Em andamento | Concluida

---

## SP-03 - Documentos

BE-DOC-001
- Historia: US-DOC-001
- Endpoint: GET /documents
- DTO entrada: ListDocumentsQueryDto
  - status?: string
  - filter?: string
  - urgency?: string
  - page?: number
  - limit?: number
- DTO saida: ListDocumentsResponseDto
  - items: DocumentSummaryDto[]
  - totals: DocumentDashboardTotalsDto
- Tarefa: implementar listagem com filtros do dashboard documental.
- Status: Planejada

BE-DOC-002
- Historia: US-DOC-002
- Endpoint: POST /documents/requests
- DTO entrada: CreateDocumentRequestDto
  - title: string
  - category: string
  - description?: string
  - required: boolean
  - dueDate?: string
  - recipients: string[]
  - message?: string
  - templateId?: string
  - sendBy: string[]
- DTO saida: CreateDocumentRequestResponseDto
  - id: string
  - status: string
- Tarefa: criar solicitacao de documento.
- Status: Planejada

BE-DOC-003
- Historia: US-DOC-003
- Endpoint: GET /documents/categories
- DTO entrada: none
- DTO saida: DocumentCategoryListDto
  - predefined: string[]
  - allowCustom: boolean
- Tarefa: expor categorias disponiveis.
- Status: Planejada

BE-DOC-004
- Historia: US-DOC-004
- Endpoint: GET /documents/templates
- DTO entrada: none
- DTO saida: DocumentTemplateListDto
  - items: DocumentTemplateDto[]
- Tarefa: listar modelos de checklist por dominio.
- Status: Planejada

BE-DOC-005
- Historia: US-DOC-005
- Endpoint: POST /documents/:id/files
- DTO entrada: UploadDocumentFileDto
  - file: binary
  - filename: string
- DTO saida: UploadDocumentFileResponseDto
  - fileId: string
  - status: string
- Tarefa: receber upload do cliente no documento solicitado.
- Status: Planejada

BE-DOC-006
- Historia: US-DOC-006
- Endpoint: POST /documents/:id/review
- DTO entrada: ReviewDocumentDto
  - action: aprovado | rejeitado | novo_envio
  - comment?: string
- DTO saida: ReviewDocumentResponseDto
  - documentId: string
  - status: string
- Tarefa: registrar aprovacao/recusa/novo envio com comentario.
- Status: Planejada

BE-DOC-007
- Historia: US-DOC-007
- Endpoint: GET /documents/:id/timeline
- DTO entrada: none
- DTO saida: DocumentTimelineResponseDto
  - events: TimelineEventDto[]
- Tarefa: expor historico documental com usuario e timestamp.
- Status: Planejada

---

## SP-04 - Assinaturas

BE-SIG-001
- Historia: US-SIG-001
- Endpoint: GET /signatures
- DTO entrada: ListSignatureFlowsQueryDto
  - status?: string
  - page?: number
  - limit?: number
- DTO saida: ListSignatureFlowsResponseDto
  - items: SignatureFlowSummaryDto[]
  - totals: SignatureDashboardTotalsDto
- Tarefa: listar fluxos de assinatura para dashboard.
- Status: Planejada

BE-SIG-002
- Historia: US-SIG-002
- Endpoint: POST /signatures
- DTO entrada: CreateSignatureFlowDto
  - document: string
  - dueDate: string
  - remindersEnabled: boolean
  - signatureType: simples | avancada | rubrica | todas_paginas | inicial
  - witnesses?: string[]
  - message?: string
  - signers: SignatureSignerInputDto[]
- DTO saida: CreateSignatureFlowResponseDto
  - id: string
  - status: string
- Tarefa: criar fluxo de assinatura.
- Status: Planejada

BE-SIG-003
- Historia: US-SIG-003
- Endpoint: POST /signatures/:id/portal/step
- DTO entrada: UpdatePortalStepDto
  - step: visualizar | aceitar_termos | assinar | confirmar | download
- DTO saida: UpdatePortalStepResponseDto
  - flowId: string
  - currentStep: string
- Tarefa: persistir progresso do portal cliente.
- Status: Planejada

BE-SIG-004
- Historia: US-SIG-004
- Endpoint: POST /signatures/:id/position
- DTO entrada: UpdateSignaturePositionDto
  - signerId: string
  - page?: number
  - x: number
  - y: number
- DTO saida: UpdateSignaturePositionResponseDto
  - signerId: string
  - positionLabel: string
- Tarefa: persistir posicao da assinatura no canvas.
- Status: Planejada

BE-SIG-005
- Historia: US-SIG-005
- Endpoint: POST /signatures/:id/sign
- DTO entrada: SignCurrentStepDto
  - signerId: string
- DTO saida: SignCurrentStepResponseDto
  - flowId: string
  - flowStatus: string
  - signedAt: string
- Tarefa: registrar assinatura do proximo assinante conforme ordem bloqueante.
- Status: Planejada

BE-SIG-006
- Historia: US-SIG-005
- Endpoint: POST /signatures/:id/refuse
- DTO entrada: RefuseCurrentStepDto
  - signerId: string
  - reason: string
- DTO saida: RefuseCurrentStepResponseDto
  - flowId: string
  - flowStatus: cancelada
- Tarefa: registrar recusa com motivo obrigatorio e cancelar fluxo.
- Status: Planejada

BE-SIG-007
- Historia: US-SIG-006
- Endpoint: POST /signatures/expire-overdue
- DTO entrada: none
- DTO saida: ExpireOverdueFlowsResponseDto
  - updatedFlowIds: string[]
- Tarefa: aplicar expiracao automatica em fluxos vencidos.
- Status: Planejada

BE-SIG-008
- Historia: US-SIG-006
- Endpoint: GET /signatures/:id/certificate
- DTO entrada: none
- DTO saida: SignatureCertificateDto
  - id: string
  - issuedAt: string
  - hash: string
  - version: number
  - summary: string
- Tarefa: consultar certificado final emitido.
- Status: Planejada

BE-SIG-009
- Historia: US-SIG-007
- Endpoint: GET /signatures/:id/audit
- DTO entrada: none
- DTO saida: SignatureAuditTrailResponseDto
  - records: SignatureAuditRecordDto[]
- Tarefa: expor trilha de auditoria tecnica da assinatura.
- Status: Planejada

BE-SIG-010
- Historia: US-SIG-008
- Endpoint: GET /signatures/:id/legal-level
- DTO entrada: none
- DTO saida: SignatureLegalLevelDto
  - signatureType: string
  - legalLevel: simples | avancada | qualificada
- Tarefa: exibir nivel juridico aplicado ao fluxo.
- Status: Planejada

BE-SIG-011
- Historia: US-SIG-009
- Endpoint: POST /signatures/:id/timestamp
- DTO entrada: ApplyTrustedTimestampDto
  - provider?: string
- DTO saida: ApplyTrustedTimestampResponseDto
  - protocol: string
  - issuedAtUtc: string
  - evidenceChain: SignatureEvidenceChainDto
- Tarefa: aplicar carimbo temporal e atualizar cadeia de evidencias.
- Status: Planejada

BE-SIG-012
- Historia: US-SIG-010
- Endpoint: GET /signatures/:id/dossier
- DTO entrada: DossierFormatQueryDto
  - format: json | printable
- DTO saida: SignatureDossierDto
  - flow: object
  - signers: object[]
  - timeline: object[]
  - audit: object[]
  - legalBasis: object
- Tarefa: exportar dossie tecnico-juridico.
- Status: Planejada

---

## SP-05 - Processos

BE-PROC-001
- Historia: US-PROC-001
- Endpoint: POST /cases
- DTO entrada: CreateCaseDto
  - title: string
  - court?: string
  - number?: string
  - clientName?: string
  - description?: string
- DTO saida: CreateCaseResponseDto
  - id: string
  - status: string
- Tarefa: criar processo.
- Status: Planejada

BE-PROC-002
- Historia: US-PROC-001
- Endpoint: GET /cases
- DTO entrada: ListCasesQueryDto
  - phase?: string
  - deadlineStatus?: no_prazo | vencido
  - ownerId?: string
- DTO saida: ListCasesResponseDto
  - items: CaseSummaryDto[]
- Tarefa: listar processos com filtros.
- Status: Planejada

BE-PROC-003
- Historia: US-PROC-002
- Endpoint: PATCH /cases/:id/phase
- DTO entrada: UpdateCasePhaseDto
  - phase: string
- DTO saida: UpdateCasePhaseResponseDto
  - id: string
  - phase: string
  - updatedAt: string
- Tarefa: atualizar fase do processo e gerar evento.
- Status: Planejada

BE-PROC-004
- Historia: US-PROC-002
- Endpoint: GET /cases/:id/timeline
- DTO entrada: none
- DTO saida: CaseTimelineResponseDto
  - events: CaseTimelineEventDto[]
- Tarefa: consultar timeline de mudancas do processo.
- Status: Planejada

BE-PROC-005
- Historia: US-PROC-003
- Endpoint: PATCH /cases/:id/deadline
- DTO entrada: UpdateCaseDeadlineDto
  - deadline: string
- DTO saida: UpdateCaseDeadlineResponseDto
  - id: string
  - deadline: string
  - deadlineStatus: no_prazo | vencido
- Tarefa: atualizar prazo e status de vencimento.
- Status: Planejada

BE-PROC-006
- Historia: US-PROC-004
- Endpoint: PATCH /cases/:id/owner
- DTO entrada: UpdateCaseOwnerDto
  - ownerId: string
- DTO saida: UpdateCaseOwnerResponseDto
  - id: string
  - ownerId: string
  - updatedAt: string
- Tarefa: atribuir/trocar responsavel e registrar historico.
- Status: Planejada

---

## Observacoes de escopo

- Este plano nao executa codificacao backend; ele define o pacote tecnico pronto para execucao no VS Code.
- Endpoints de SP-03 a SP-05 seguem estritamente historias e criterios de aceitacao do backlog atual.
