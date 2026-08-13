# Sprint 06.1 - Pacote de Requisitos

## Objetivo
Consolidar o dominio de pessoas, organizacoes, papeis, processos e participacoes do BureauFlow, removendo rigidez de modelagem e garantindo regras criticas no backend.

## Escopo coberto
- Epicos e capacidade de produto.
- User stories completas.
- Requisitos funcionais (RF).
- Regras de negocio (RN).
- Consolidacao da implementacao atual.
- MER (modelo entidade relacionamento).
- BPMN dos fluxos principais.
- Diagrama de classes do dominio.

## Principios de modelagem
1. Pessoa e identidade sao conceitos base.
2. Papel nao e identidade.
3. Vinculo com organizacao nao bloqueia atuacao em outros contextos quando autorizado.
4. Processo concentra papeis contextuais dos participantes.
5. Regras criticas sao validadas no backend.

## Termos do dominio
- Pessoa: entidade com identidade unica (ex.: CPF) e multiplos papeis.
- Organizacao: escritorio ou empresa que possui membros e processos.
- Papel: capacidade de atuacao no sistema (cliente, advogado, representante legal, etc.).
- Participante de processo: pessoa vinculada a um processo com papel contextual.
- Representante legal ativo: no maximo um por processo.
- Auto-representante legal: quando cliente e representante possuem o mesmo CPF e a pessoa possui papel de representante legal.

## Estado atual resumido
- Frontend com fluxos de cadastro, onboarding e modulos de processo/documentos/assinaturas/BureauIA/auditoria.
- Backend NestJS com regras centrais em service e store em memoria.
- Schema Prisma atualizado para refletir o novo dominio conceitual.
- Teste automatizado de dominio criado para validar regras criticas centrais.
