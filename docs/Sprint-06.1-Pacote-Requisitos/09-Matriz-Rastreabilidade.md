# Matriz de Rastreabilidade

## Epico para requisitos e implementacao

| Epico | RFs principais | Componentes implementados |
|---|---|---|
| EP-01 Identidade e Acesso | RF-01, RF-18, RF-19 | AuthController/AuthService |
| EP-02 Pessoas, Papeis e Organizacoes | RF-02, RF-03, RF-04, RF-05, RF-06 | StoreService, AuthService |
| EP-03 Enderecos e Contatos | RF-14, RF-15 | StoreService, AuthService, schema Prisma |
| EP-04 Processos Flexiveis | RF-08, RF-09 | ProcessController/ProcessService |
| EP-05 Representante Legal | RF-10, RF-11, RF-12 | ProcessService + StoreService |
| EP-06 Auto-representacao | RF-13 | StoreService.resolveAutoRepresentation |
| EP-07 Convites e Colaboracao | RF-16, RF-17 | InvitationService |
| EP-08 Governanca tecnica | RF-20, RF-21, RF-22 | Documentacao + validacoes backend |

## Regras de negocio para implementacao

| RN | Ponto de implementacao |
|---|---|
| RN-02 Multipapeis | addRoleToUser/listRolesByUser/userHasRole |
| RN-07 Representante unico ativo | findActiveLegalRepresentative/upsertActiveLegalRepresentative |
| RN-08 Historico de substituicao | deactivateParticipant + replacedByParticipantId |
| RN-09 Autorrepresentacao | resolveAutoRepresentation |
| RN-10 Validacao backend | ProcessService e AuthService |
| RN-11/RN-12/RN-13 Enderecos | validacoes no register + entidades Address |
| RN-15 Autorizacao por contexto | assertAccess no ProcessService |

## Cobertura de teste atual
- Teste de dominio cobre regras centrais de multipapeis e representante.
- Suite de integracao HTTP completa permanece como proximo incremento.
