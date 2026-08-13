# MER - Modelo Entidade Relacionamento

## Visao conceitual
O modelo privilegia identidade unica da pessoa, papeis acumulativos e participacao contextual em processo.

```mermaid
erDiagram
    USER ||--o{ USER_ROLE : has
    USER ||--o{ ADDRESS : owns
    USER ||--o{ CONTACT : owns
    ORGANIZATION ||--o{ ADDRESS : owns
    ORGANIZATION ||--o{ CONTACT : owns
    USER ||--o{ ORGANIZATION_MEMBERSHIP : belongs
    ORGANIZATION ||--o{ ORGANIZATION_MEMBERSHIP : has
    ORGANIZATION ||--o{ PROCESS : owns
    USER ||--o{ PROCESS : creates
    PROCESS ||--o{ PROCESS_PARTICIPANT : has
    USER ||--o{ PROCESS_PARTICIPANT : participates

    USER {
      string id PK
      string name
      string email UK
      string document
      string role_primary
      boolean email_verified
      datetime created_at
    }

    USER_ROLE {
      string id PK
      string user_id FK
      string role_code
      datetime created_at
    }

    ORGANIZATION {
      string id PK
      string name
      string document UK
      string organization_type
      datetime created_at
    }

    ORGANIZATION_MEMBERSHIP {
      string id PK
      string organization_id FK
      string user_id FK
      string relation
      datetime linked_at
    }

    ADDRESS {
      string id PK
      string owner_type
      string owner_id
      string address_type
      string zip_code
      string street
      string number
      string complement
      string district
      string city
      string state
      string country
      boolean main
      boolean active
      datetime created_at
      datetime updated_at
    }

    CONTACT {
      string id PK
      string owner_type
      string owner_id
      string contact_type
      string value
      boolean main
      boolean active
      datetime created_at
      datetime updated_at
    }

    PROCESS {
      string id PK
      string code UK
      string name
      string status
      string organization_id FK
      string created_by_user_id FK
      datetime created_at
      datetime updated_at
    }

    PROCESS_PARTICIPANT {
      string id PK
      string process_id FK
      string user_id FK
      string participant_role
      string representation_type
      boolean active
      datetime entered_at
      datetime exited_at
      string replaced_by_participant_id
      string replacement_reason
    }
```

## Restricoes de negocio mapeadas
1. Processo possui no maximo um PROCESS_PARTICIPANT ativo com participant_role = LEGAL_REPRESENTATIVE.
2. Uma pessoa pode ter N papeis.
3. Uma pessoa pode participar de N processos.
4. Uma organizacao pode ter N processos e N membros.
