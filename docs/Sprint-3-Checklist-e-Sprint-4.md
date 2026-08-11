# Documento legado de checklist

Referencia atual de produto:
- docs/Product-Methodology.md
- docs/Product-Backlog-Sprints-0-4.md

Este arquivo foi mantido como historico das validacoes por checklist.

# Checklist Formal - Sprint 3 (Gestao Documental Inteligente)

Status:
- Implementado
- Parcial
- Ausente

## 1) Dashboard Documental
- Pagina Documentos: Implementado
- Cards superiores (pendentes, aguardando cliente, em analise, aprovados, rejeitados, expirados): Implementado
- Tabela com colunas solicitadas: Implementado
- Filtros (todos, pendentes, urgentes, assinados, arquivados): Implementado

## 2) Nova Solicitacao
- Botao Nova Solicitacao e modal Solicitar Documento: Implementado
- Campos (titulo, categoria, descricao, obrigatorio, prazo, destinatarios, mensagem, modelo, enviar por): Implementado

## 3) Categorias
- Categorias prontas solicitadas: Implementado
- Categoria personalizada (Outros): Implementado

## 4) Checklist Inteligente
- Botao Usar Modelo: Implementado
- Biblioteca de modelos (Trabalhista, Inventario, Usucapiao, Licitacao, Imovel, Empresa, Consumidor, Familia): Implementado
- Preenchimento automatico de base de checklist: Implementado

## 5) Tela Cliente
- Portal simplificado: Implementado
- Acoes por documento (Upload, Visualizar, Substituir, Excluir antes da aprovacao): Implementado
- Status previstos (Pendente, Recebido, Em analise, Aprovado, Necessita novo envio): Implementado

## 6) Aprovacao
- Acoes do advogado (Aprovar, Solicitar novo envio, Rejeitar): Implementado
- Adicionar comentario: Implementado
- Comentario visivel ao cliente: Implementado (comentarios centralizados por documento)

## 7) Historico
- Timeline com eventos solicitados: Implementado
- Usuario, data, hora em cada evento: Implementado

## 8) Componentes
- Upload Drag and Drop: Implementado
- Preview PDF: Implementado
- Preview Imagem: Implementado
- Visualizador: Implementado
- Badge Status: Implementado
- Timeline: Implementado
- Checklist: Implementado
- Comentarios: Implementado
- Toast: Implementado
- Empty State: Implementado
- Loading: Implementado
- Erro: Implementado

## 9) Estados
- Sem documentos: Implementado
- Upload em andamento: Implementado
- Erro upload: Implementado
- Arquivo muito grande: Implementado
- Formato invalido: Implementado
- Prazo expirado: Implementado
- Documento aprovado: Implementado
- Documento recusado: Implementado
- Nova versao solicitada: Implementado

## 10) Responsividade
- Desktop: Implementado
- Tablet: Implementado
- Mobile com cards no lugar da tabela: Implementado

## 11) Acessibilidade
- Focus visivel em controles principais: Implementado
- Estrutura semantica e rotulos principais: Implementado
- Mensagens de status (toast aria-live): Implementado
- Contraste e teclado: Parcial (adequado no prototipo, sem auditoria automatizada formal WCAG)

## 12) Entregaveis
- Document Dashboard: Implementado
- New Request: Implementado
- Portal Cliente: Implementado
- Timeline: Implementado
- Upload: Implementado
- Approval: Implementado
- Components: Implementado
- Prototype completo: Implementado (fluxo navegavel no prototipo)

---

# Sprint 3.1 - Auditoria Transparente e Cadeia de Evidencias

Objetivo:
- Tornar a integridade documental automatica e invisivel na superficie, com profundidade tecnica sob demanda.

Status Sprint 3.1:
- Registro automatico de cadeia de evidencias no upload e alteracoes: Implementado
- Card discreto "Integridade do Documento" na tela de detalhe: Implementado
- Drawer "Integridade e Auditoria" com secoes tecnicas: Implementado
- Coluna de integridade na tabela principal sem exposicao de hash: Implementado
- Badge com tooltip explicativo em cards/lista: Implementado
- Portal cliente simplificado sem termos criptograficos: Implementado
- Area administrativa "Auditoria" com dashboard, tabela e filtros: Implementado

Observacao de UX:
- Complexidade progressiva aplicada em 3 niveis: usuario, profissional e administrador/auditor.

---

# Sprint 4 - Assinaturas Eletronicas

Objetivo:
- Iniciar e concluir fluxo de assinatura sem sair do BureauFlow.

Entregas implementadas:
- Novo menu/rota Assinaturas integrado ao app.
- Dashboard com cards:
  - Aguardando assinatura
  - Em andamento
  - Concluidas
  - Expiradas
  - Canceladas
- Acao Nova Assinatura com modal:
  - Selecionar documento
  - Selecionar assinantes
  - Definir ordem
  - Adicionar testemunhas
  - Prazo
  - Lembretes automaticos
  - Mensagem personalizada
  - Tipos de assinatura (simples, avancada, rubrica, todas paginas, inicial)
  - Campos do assinante (nome, cpf, email, whatsapp, ordem, obrigatorio, posicao)
- Timeline de assinatura:
  - Documento criado
  - Convites enviados
  - Assinante abriu
  - Assinou
  - Recusou
  - Expirou
  - Concluido
- Portal Cliente (passos):
  - Visualizar
  - Aceitar termos
  - Assinar
  - Confirmar
  - Download PDF
- Componentes representados no modulo:
  - Canvas PDF (mock)
  - Viewer
  - Timeline
  - Assinantes
  - Comentarios
  - Certificado final
  - Download

Arquivos de referencia:
- src/app/DocumentManagementModule.tsx
- src/app/ElectronicSignaturesModule.tsx
- src/app/App.tsx

---

# Sprint 4.1 - Regras de Negocio de Assinatura

Objetivo:
- Tornar o fluxo de assinatura mais fiel ao comportamento real de operacao.

Status da Sprint 4.1:
- Ordem bloqueante por assinante: Implementado
- Recusa com motivo obrigatorio: Implementado
- Expiracao automatica por prazo: Implementado
- Certificado final por fluxo concluido: Implementado

Detalhes implementados:
- Assinantes agora possuem estado individual (pendente, abriu, assinado, recusado).
- Acao "Registrar assinatura do passo atual" respeita ordem sequencial e assina apenas o proximo assinante.
- Quando todos os assinantes obrigatorios concluem, o fluxo muda para "concluida" e recebe certificado final.
- Acao "Recusar assinatura do passo atual" exige motivo, registra evento e cancela o fluxo.
- Acao "Verificar expiracao automatica" marca como "expirada" fluxos em aberto com prazo vencido e registra timeline.

Arquivos impactados nesta etapa:
- src/app/ElectronicSignaturesModule.tsx
- docs/Sprint-3-Checklist-e-Sprint-4.md

---

# Sprint 4.3 - Carimbo Temporal e Dossie de Evidencias

Objetivo:
- Consolidar cadeia de evidencias com carimbo temporal e exportacao de dossie tecnico-juridico.

Status Sprint 4.3:
- Carimbo temporal confiavel por fluxo: Implementado
- Cadeia de evidencias com hash anterior e hash atual: Implementado
- Exportacao de dossie JSON: Implementado
- Exportacao de dossie imprimivel (HTML pronto para PDF): Implementado

Detalhes implementados:
- Nova secao "Cadeia de evidencias e carimbo temporal" no modulo Assinaturas.
- Acao "Aplicar carimbo temporal" grava provedor, protocolo e data UTC.
- Cadeia de evidencias agrega:
  - algoritmo (SHA-256)
  - hash anterior
  - hash atual
  - volume de eventos de timeline e auditoria
- Acao "Exportar dossie JSON" gera pacote com fluxo, assinantes, timeline, auditoria e base legal.
- Acao "Exportar dossie PDF" gera versao HTML pronta para salvar/imprimir em PDF.

Observacao de escopo:
- O carimbo temporal nesta etapa e de demonstracao em prototipo.
- Em producao, recomenda-se integracao com autoridade de carimbo temporal e assinatura de logs no backend.

Arquivos impactados nesta etapa:
- src/app/ElectronicSignaturesModule.tsx
- docs/Sprint-3-Checklist-e-Sprint-4.md

---

# Sprint 4.2 - Validade Juridica, Auditoria e Selagem Tecnica

Objetivo:
- Reforcar o prototipo com mecanismos tecnicos alinhados a validade juridica da assinatura eletronica no Brasil.

Base legal destacada no produto:
- MP 2.200-2/2001
- Lei 14.063/2020

Status Sprint 4.2:
- Trilha de auditoria por fluxo: Implementado
- Registro de IP, geolocalizacao, timestamp, e-mail e user-agent: Implementado
- Hash SHA-256 do documento por versao: Implementado
- Versionamento e selagem do documento no fechamento: Implementado
- Exibicao do nivel de assinatura no fluxo: Implementado

Detalhes implementados:
- Novo bloco "Validade juridica e nivel de assinatura" na area de Portal Cliente.
- Mapeamento de tipo de assinatura para nivel juridico (simples, avancada, qualificada).
- Nova secao "Trilha de auditoria" com eventos tecnicos do fluxo selecionado.
- A cada acao critica (criacao, envio, assinatura, recusa, expiracao, selagem) o sistema registra auditoria.
- Ao assinar, o sistema recalcula hash com SHA-256 e incrementa versao do documento.
- Ao concluir fluxo, emite certificado final com hash e versao correspondente.

Observacao de escopo:
- Nesta etapa o prototipo usa contexto tecnico simulado de cliente (IP/geolocalizacao) para demonstracao visual.
- Para producao, os dados devem ser capturados e assinados em backend com carimbo de tempo confiavel e armazenamento imutavel.

Arquivos impactados nesta etapa:
- src/app/ElectronicSignaturesModule.tsx
- docs/Sprint-3-Checklist-e-Sprint-4.md
