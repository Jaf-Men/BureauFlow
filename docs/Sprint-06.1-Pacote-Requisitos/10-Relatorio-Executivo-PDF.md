# BureauFlow - Sprint 06.1

## Relatorio Executivo Consolidado

Versao: 1.0  
Data: 2026-08-13  
Escopo: Refinamento de dominio, papeis, entidades, relacionamentos e regras criticas

---

## 1. Sumario Executivo
A Sprint 06.1 consolidou o dominio do BureauFlow para suportar crescimento sem remodelagem estrutural de curto prazo. O foco foi separar identidade de pessoa, papeis, vinculos organizacionais e participacao em processo, com regras criticas validadas no backend.

Resultados principais:
1. Multipapeis por pessoa sem duplicacao de identidade.
2. Enderecos e contatos estruturados para evolucao.
3. Participacao flexivel em processos por papel contextual.
4. Regra de um representante legal ativo por processo com historico de substituicao.
5. Regra de auto-representacao automatica por CPF no backend.
6. Pacote completo de requisitos e rastreabilidade funcional.

---

## 2. Objetivo da Sprint
Garantir que o sistema nao fique engessado por modelagens fixas de perfil unico e vinculo unico, permitindo:
1. Pessoas com multiplos papeis.
2. Autonomos operando sem obrigacao de organizacao.
3. Organizacoes com membros e representantes internos ou externos.
4. Integridade juridica no processo por regras de dominio.

---

## 3. Escopo Funcional Consolidado
### 3.1 Identidade e papeis
1. Cadastro de perfis principais com base em pessoa.
2. Inclusao de papeis adicionais para usuario existente.
3. Preservacao de identidade unica em fluxos de convite e associacao.

### 3.2 Organizacoes e vinculos
1. Vinculo associativo de pessoa com organizacao.
2. Possibilidade de membro interno e atuacao externa quando permitido.

### 3.3 Processos e participantes
1. Estrutura de participante por papel contextual.
2. Regras de validacao de papel para participacoes criticas.
3. Controle de representante legal unico ativo por processo.
4. Registro historico de substituicao.

### 3.4 Enderecos e contatos
1. Estrutura tipada para endereco residencial, profissional e comercial.
2. Estrutura tipada para contato email, phone, mobile e whatsapp.
3. Marcacao de principal e ativo.

### 3.5 Autorrepresentacao
1. Deteccao automatica no backend quando CPF cliente = CPF representante.
2. Classificacao como AUTO_REPRESENTANTE_LEGAL quando houver papel de representante legal.

---

## 4. Regras Criticas de Negocio
1. Pessoa, papel, vinculo organizacional e participacao de processo sao conceitos distintos.
2. Uma pessoa pode acumular papeis.
3. Representante legal de processo pode ser interno ou externo.
4. Um processo possui no maximo um representante legal ativo por vez.
5. Substituicao de representante preserva historico.
6. Autorrepresentacao e inferida por CPF no backend.
7. Validacao critica e obrigatoria no backend, nao apenas no frontend.

---

## 5. Implementacao Tecnica Consolidada
### 5.1 Backend
1. Reforco de dominio em services e store com regras centrais.
2. Endpoints para papeis adicionais e processos/participantes.
3. Ajustes de convite sem perda de papeis existentes.

### 5.2 Frontend
1. Ajuste de nomenclatura da persona:
Representante legal (despachante) autonomo.
2. Preservacao da nomenclatura:
Escritorio de Advocacia.
3. Ajustes de payload para dados estruturados de endereco.

### 5.3 Banco e schema
1. Schema conceitual Prisma atualizado para refletir dominio alvo.
2. Migration SQL preparada para aplicacao em ambiente com PostgreSQL ativo.

---

## 6. Qualidade e Validacao
1. Build backend validado.
2. Build frontend validado.
3. Teste de dominio criado e executado para regras centrais.

---

## 7. Riscos Tecnicos Atuais
1. Runtime atual ainda usa persistencia em memoria para parte das rotas.
2. Migration depende de PostgreSQL ativo no host para aplicacao automatizada.
3. Integracao completa frontend-processos com novos endpoints ainda pode evoluir.
4. Suite de testes de integracao HTTP e negativos ampla ainda deve ser expandida.

---

## 8. Recomendacoes Imediatas
1. Subir PostgreSQL local e aplicar migration oficial.
2. Executar validacao de integridade de banco pos-migracao.
3. Expandir testes de integracao e testes negativos de autorizacao.
4. Conectar modulo de processos do frontend aos novos endpoints de dominio.
5. Exibir classificacao AUTO_REPRESENTANTE_LEGAL na tela de processo.

---

## 9. Referencias do pacote
1. 00-Visao-Geral.md
2. 01-Epicos.md
3. 02-User-Stories.md
4. 03-Requisitos-Funcionais.md
5. 04-Regras-de-Negocio.md
6. 05-Consolidacao-Implementacao.md
7. 06-MER.md
8. 07-BPMN.md
9. 08-Diagrama-de-Classes.md
10. 09-Matriz-Rastreabilidade.md

---

## 10. Conclusao
A Sprint 06.1 deixou o BureauFlow preparado para evolucao orientada a dominio, com base mais robusta para usuarios reais e cenarios multiplos de atuacao, reduzindo risco de retrabalho estrutural nas proximas fases do MVP.
