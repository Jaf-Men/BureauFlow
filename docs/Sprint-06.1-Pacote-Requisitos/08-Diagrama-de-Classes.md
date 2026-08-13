# Diagrama de Classes do Dominio

```mermaid
classDiagram
    class User {
      +id: string
      +name: string
      +email: string
      +document: string
      +rolePrimary: Role
      +roles: Role[]
      +emailVerified: boolean
      +createdAt: datetime
    }

    class Address {
      +id: string
      +ownerType: OwnerType
      +ownerId: string
      +type: AddressType
      +zipCode: string
      +street: string
      +number: string
      +complement: string
      +district: string
      +city: string
      +state: string
      +country: string
      +main: boolean
      +active: boolean
      +createdAt: datetime
      +updatedAt: datetime
    }

    class Contact {
      +id: string
      +ownerType: OwnerType
      +ownerId: string
      +type: ContactType
      +value: string
      +main: boolean
      +active: boolean
      +createdAt: datetime
      +updatedAt: datetime
    }

    class Organization {
      +id: string
      +name: string
      +document: string
      +type: OrganizationType
      +createdAt: datetime
    }

    class OrganizationMembership {
      +id: string
      +organizationId: string
      +userId: string
      +relation: MembershipRelation
      +linkedAt: datetime
    }

    class Process {
      +id: string
      +code: string
      +name: string
      +status: ProcessStatus
      +organizationId: string
      +createdByUserId: string
      +createdAt: datetime
      +updatedAt: datetime
    }

    class ProcessParticipant {
      +id: string
      +processId: string
      +userId: string
      +organizationId: string
      +role: ProcessParticipantRole
      +representationType: LegalRepresentationType
      +active: boolean
      +enteredAt: datetime
      +exitedAt: datetime
      +replacedByParticipantId: string
      +replacementReason: string
    }

    class AuthService {
      +register(input)
      +login(email,password)
      +me(userId)
      +addRole(userId, role)
    }

    class ProcessService {
      +create(userId,input)
      +list(userId)
      +detail(userId, processId)
      +addParticipant(userId, processId, input)
      +replaceLegalRepresentative(userId, processId, input)
    }

    class StoreService {
      +createUser(input)
      +addRoleToUser(userId, role)
      +createOrganization(input)
      +createAddress(input)
      +createContact(input)
      +createProcess(input)
      +addProcessParticipant(input)
      +upsertActiveLegalRepresentative(input)
      +resolveAutoRepresentation(processId, representativeUserId)
    }

    User "1" --> "0..*" Address : owns
    User "1" --> "0..*" Contact : owns
    Organization "1" --> "0..*" Address : owns
    Organization "1" --> "0..*" Contact : owns
    User "1" --> "0..*" OrganizationMembership : memberships
    Organization "1" --> "0..*" OrganizationMembership : members
    Organization "1" --> "0..*" Process : owns
    User "1" --> "0..*" Process : creates
    Process "1" --> "0..*" ProcessParticipant : participants
    User "1" --> "0..*" ProcessParticipant : participates

    AuthService ..> StoreService : uses
    ProcessService ..> StoreService : uses
```

## Observacoes de regra
1. ProcessParticipant com role LEGAL_REPRESENTATIVE possui no maximo 1 ativo por processo.
2. ProcessService valida autorizacao e papel antes de associar participante critico.
3. StoreService concentra regras de consistencia de participacao e auto-representacao.
