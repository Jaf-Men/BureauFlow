# BureauFlow - Product Backlog Consolidado (Sprints 0 a 4)

Status padrao
- Implementado
- Parcial
- Ausente

---

## SP-00 a SP-02 - Fundacao de Acesso e Convites

Modulo entregue
- Cadastro, verificacao de e-mail, autenticacao JWT, convite e aceite de cliente.

### EP-AUTH-01 - Identidade e Acesso

#### FT-AUTH-01 - Cadastro e verificacao de e-mail
- US-AUTH-001
  - Historia: Como advogado/escritorio, eu quero criar minha conta e verificar e-mail, para acessar o sistema com seguranca.
  - Criterios de Aceitacao:
    - Dado cadastro valido, quando concluir o formulario, entao o sistema deve gerar link de verificacao.
    - Dado token valido, quando acessar o link, entao o e-mail deve ser marcado como verificado.
  - Status: Implementado

#### FT-AUTH-02 - Login JWT
- US-AUTH-002
  - Historia: Como usuario verificado, eu quero fazer login, para iniciar minha sessao no BureauFlow.
  - Criterios de Aceitacao:
    - Dado credenciais validas, quando autenticar, entao o sistema deve retornar token JWT e dados do usuario.
    - Dado credenciais invalidas, quando autenticar, entao o sistema deve negar acesso com mensagem adequada.
  - Status: Implementado

### EP-INV-01 - Convites

#### FT-INV-01 - Convite de cliente e aceite
- US-INV-001
  - Historia: Como advogado/escritorio, eu quero convidar cliente por link, para compartilhar acesso ao processo.
  - Criterios de Aceitacao:
    - Dado usuario autenticado, quando criar convite, entao o sistema deve gerar token com expiracao.
    - Dado token valido, quando cliente aceitar, entao o sistema deve criar/ativar conta e iniciar sessao.
  - Status: Implementado

---

## SP-03 - Gestao Documental Inteligente

Modulo entregue
- Operacao completa de solicitacao, envio, analise e aprovacao de documentos.
- Evolucao 3.1: Auditoria Transparente e Cadeia de Evidencias com complexidade progressiva.

### EP-DOC-01 - Dashboard e Operacao Documental

#### FT-DOC-01 - Dashboard Documental
- US-DOC-001
  - Historia: Como advogado, eu quero visualizar o painel documental com filtros e status, para priorizar meu trabalho.
  - Criterios de Aceitacao:
    - Dado documentos cadastrados, quando abrir a pagina Documentos, entao deve exibir cards por status e tabela com colunas definidas.
    - Dado necessidade de triagem, quando aplicar filtros (todos, pendentes, urgentes, assinados, arquivados), entao a lista deve atualizar corretamente.
  - Status: Implementado

#### FT-DOC-02 - Nova Solicitacao de Documento
- US-DOC-002
  - Historia: Como advogado, eu quero solicitar novos documentos com contexto, para orientar clientes com clareza.
  - Criterios de Aceitacao:
    - Dado acao Nova Solicitacao, quando abrir o modal, entao deve permitir titulo, categoria, descricao, obrigatoriedade, prazo, destinatarios, mensagem, modelo e canal.
    - Dado formulario valido, quando enviar solicitacao, entao o pedido deve aparecer no fluxo documental.
  - Status: Implementado

### EP-DOC-02 - Catalogo e Checklist

#### FT-DOC-03 - Categorias e categoria personalizada
- US-DOC-003
  - Historia: Como advogado, eu quero usar categorias prontas e personalizadas, para organizar documentos por contexto juridico.
  - Criterios de Aceitacao:
    - Dado criacao de solicitacao, quando escolher categoria, entao categorias prontas devem estar disponiveis.
    - Dado necessidade especifica, quando selecionar Outros, entao categoria personalizada deve ser aceita.
  - Status: Implementado

#### FT-DOC-04 - Checklist inteligente por modelo
- US-DOC-004
  - Historia: Como advogado, eu quero carregar modelos de checklist, para acelerar a montagem da documentacao.
  - Criterios de Aceitacao:
    - Dado acao Usar Modelo, quando selecionar biblioteca (Trabalhista, Inventario, Usucapiao, Licitacao, Imovel, Empresa, Consumidor, Familia), entao checklist base deve ser preenchido automaticamente.
  - Status: Implementado

### EP-DOC-03 - Portal Cliente e Qualidade de Analise

#### FT-DOC-05 - Portal simplificado do cliente
- US-DOC-005
  - Historia: Como cliente, eu quero enviar e acompanhar meus documentos, para concluir minhas pendencias com autonomia.
  - Criterios de Aceitacao:
    - Dado documento pendente, quando acessar portal, entao devo poder Upload, Visualizar, Substituir e Excluir antes da aprovacao.
    - Dado atualizacao de analise, quando advogado revisar, entao status deve refletir Pendente, Recebido, Em analise, Aprovado e Necessita novo envio.
  - Status: Implementado

#### FT-DOC-06 - Aprovacao com comentarios
- US-DOC-006
  - Historia: Como advogado, eu quero aprovar, rejeitar ou solicitar novo envio com comentario, para garantir qualidade documental.
  - Criterios de Aceitacao:
    - Dado documento em analise, quando executar acao de aprovacao/rejeicao/novo envio, entao o resultado deve ficar visivel ao cliente.
    - Dado comentario registrado, quando cliente visualizar documento, entao deve enxergar orientacao contextual.
  - Status: Implementado

### EP-DOC-04 - Historico, estados e UX

#### FT-DOC-07 - Timeline e rastreabilidade
- US-DOC-007
  - Historia: Como equipe juridica, eu quero timeline de eventos com autoria e horario, para rastrear decisoes.
  - Criterios de Aceitacao:
    - Dado qualquer mudanca de estado, quando ocorrer evento, entao timeline deve registrar usuario, data e hora.
  - Status: Implementado

#### FT-DOC-08 - Estados de operacao
- US-DOC-008
  - Historia: Como usuario, eu quero ver estados claros de sucesso e erro, para agir rapidamente em cada situacao.
  - Criterios de Aceitacao:
    - Dado operacao documental, quando ocorrer vazio/upload/erro/formato invalido/prazo expirado/aprovacao/recusa, entao a interface deve exibir estado correspondente.
  - Status: Implementado

#### FT-DOC-09 - Responsividade e acessibilidade
- US-DOC-009
  - Historia: Como usuario em qualquer dispositivo, eu quero experiencia consistente e acessivel, para operar sem barreiras.
  - Criterios de Aceitacao:
    - Dado desktop/tablet/mobile, quando navegar no modulo, entao layout deve manter usabilidade (mobile com cards no lugar da tabela).
    - Dado navegacao por teclado e mensagens de status, quando interagir com controles, entao foco visivel e aria-live devem funcionar.
  - Status: Parcial (auditoria WCAG formal pendente)

### EP-DOC-05 - Auditoria Transparente e Cadeia de Evidencias (SP-3.1)

#### FT-DOC-10 - Integridade automatica em segundo plano
- US-DOC-010
  - Historia: Como operador, eu quero que a integridade documental seja registrada automaticamente, para garantir rastreabilidade sem aumentar complexidade na operacao.
  - Criterios de Aceitacao:
    - Dado upload ou alteracao de documento, quando evento ocorrer, entao data/hora, usuario, organizacao, processo, versao, hash e historico devem ser registrados automaticamente.
    - Dado atualizacao documental, quando a versao mudar, entao cadeia de evidencias deve evoluir sem acao manual do usuario.
  - Status: Implementado

#### FT-DOC-11 - Complexidade progressiva na interface
- US-DOC-011
  - Historia: Como usuario comum, eu quero ver apenas o estado de confianca do documento, para operar com simplicidade.
  - Criterios de Aceitacao:
    - Dado tela de detalhe, quando abrir documento, entao deve exibir card simples "Integridade do Documento" com status, ultima verificacao e mensagem de ausencia de alteracao.
    - Dado interesse tecnico, quando clicar em "Ver detalhes tecnicos", entao drawer lateral deve abrir secoes de resumo, cadeia de evidencias, linha do tempo, auditoria e exportacoes.
  - Status: Implementado

#### FT-DOC-12 - Integridade no dashboard e area administrativa
- US-DOC-012
  - Historia: Como administrador, eu quero monitorar auditoria em painel dedicado, para identificar alertas e pendencias rapidamente.
  - Criterios de Aceitacao:
    - Dado lista de documentos, quando visualizar tabela e cards, entao coluna e badge de integridade devem exibir estados garantida, pendente e alterado sem expor hash.
    - Dado menu de auditoria, quando acessar dashboard administrativo, entao cards, tabela de eventos e filtros por usuario/processo/documento/data/organizacao devem estar disponiveis.
  - Status: Implementado

---

## SP-04 - Assinaturas Eletronicas

Modulo entregue
- Fluxo de assinatura de ponta a ponta sem sair do BureauFlow.

### EP-SIG-01 - Fluxo base de Assinaturas

#### FT-SIG-01 - Menu e dashboard de assinatura
- US-SIG-001
  - Historia: Como advogado, eu quero acessar um modulo dedicado de assinaturas com visao executiva, para acompanhar volume e risco de prazo.
  - Criterios de Aceitacao:
    - Dado menu principal, quando abrir Assinaturas, entao deve exibir dashboard com Aguardando assinatura, Em andamento, Concluidas, Expiradas e Canceladas.
  - Status: Implementado

#### FT-SIG-02 - Criacao de nova assinatura
- US-SIG-002
  - Historia: Como advogado, eu quero criar um fluxo de assinatura parametrizado, para coordenar participantes e validade do documento.
  - Criterios de Aceitacao:
    - Dado acao Nova Assinatura, quando abrir modal, entao deve permitir documento, assinantes, ordem, testemunhas, prazo, lembretes e mensagem.
    - Dado configuracao de assinatura, quando selecionar tipo, entao deve suportar simples, avancada, rubrica, todas paginas e inicial.
    - Dado cadastro de assinante, quando preencher campos, entao deve aceitar nome, cpf, email, whatsapp, ordem, obrigatorio e posicao.
  - Status: Implementado

#### FT-SIG-03 - Portal cliente de assinatura
- US-SIG-003
  - Historia: Como cliente, eu quero assinar em etapas guiadas, para concluir a assinatura com seguranca.
  - Criterios de Aceitacao:
    - Dado fluxo iniciado, quando clicar em Assinar Documento, entao deve apresentar passos Visualizar, Aceitar termos, Assinar, Confirmar e Download PDF.
  - Status: Implementado

#### FT-SIG-04 - Componentes de assinatura
- US-SIG-004
  - Historia: Como usuario, eu quero recursos visuais de assinatura, para posicionar e validar a assinatura no documento.
  - Criterios de Aceitacao:
    - Dado area de assinatura, quando arrastar marcador no canvas, entao posicao deve ser aplicada ao assinante atual.
    - Dado fluxo em execucao, quando navegar no modulo, entao componentes Canvas, Viewer, Timeline, Assinantes, Comentarios, Certificado Final e Download devem estar disponiveis.
  - Status: Implementado

### EP-SIG-02 - Regras de negocio de assinatura (SP-4.1)

#### FT-SIG-05 - Ordem bloqueante e recusas
- US-SIG-005
  - Historia: Como sistema, eu quero garantir ordem sequencial e recusa com justificativa, para manter integridade processual.
  - Criterios de Aceitacao:
    - Dado fluxo com ordem, quando registrar assinatura, entao apenas proximo assinante deve poder assinar.
    - Dado recusa, quando registrar evento, entao motivo deve ser obrigatorio e fluxo deve ser cancelado.
  - Status: Implementado

#### FT-SIG-06 - Expiracao e encerramento
- US-SIG-006
  - Historia: Como sistema, eu quero expirar fluxos vencidos e emitir certificado no encerramento, para formalizar resultado.
  - Criterios de Aceitacao:
    - Dado prazo vencido e fluxo aberto, quando verificar expiracao, entao fluxo deve mudar para expirada e registrar timeline.
    - Dado todos obrigatorios assinados, quando concluir, entao certificado final deve ser gerado.
  - Status: Implementado

### EP-SIG-03 - Validade juridica e auditoria (SP-4.2)

#### FT-SIG-07 - Auditoria tecnica e hash/versionamento
- US-SIG-007
  - Historia: Como equipe juridica, eu quero trilha de auditoria e hash por versao, para sustentar validade probatoria.
  - Criterios de Aceitacao:
    - Dado acao critica, quando evento ocorrer, entao auditoria deve registrar ip, geolocalizacao, timestamp, email e user-agent.
    - Dado assinatura registrada, quando documento evoluir, entao hash SHA-256 e versao devem ser atualizados.
  - Status: Implementado

#### FT-SIG-08 - Nivel juridico de assinatura
- US-SIG-008
  - Historia: Como operador, eu quero visualizar nivel juridico por tipo de assinatura, para comunicar risco e adequacao legal.
  - Criterios de Aceitacao:
    - Dado tipo selecionado, quando visualizar fluxo, entao sistema deve exibir nivel simples, avancada ou qualificada.
  - Status: Implementado

### EP-SIG-04 - Evidencias e carimbo temporal (SP-4.3)

#### FT-SIG-09 - Carimbo temporal e cadeia de evidencias
- US-SIG-009
  - Historia: Como equipe juridica, eu quero cadeia de evidencias com carimbo temporal, para reforcar confiabilidade da prova.
  - Criterios de Aceitacao:
    - Dado fluxo com hash, quando aplicar carimbo, entao sistema deve registrar provedor, protocolo e data UTC.
    - Dado cadeia atualizada, quando visualizar detalhes, entao deve exibir hash anterior, hash atual e volume de eventos.
  - Status: Implementado

#### FT-SIG-10 - Exportacao de dossie
- US-SIG-010
  - Historia: Como operador, eu quero exportar dossie tecnico-juridico, para uso em auditoria e instrucoes processuais.
  - Criterios de Aceitacao:
    - Dado fluxo selecionado, quando exportar JSON, entao pacote deve incluir fluxo, assinantes, timeline, auditoria e base legal.
    - Dado necessidade de impressao, quando exportar PDF (HTML), entao arquivo deve estar pronto para salvar/imprimir.
  - Status: Implementado

---

## SP-05 - Planejada (Processos)

Modulo planejado
- Processos.

Historias planejadas
- US-PROC-001
- US-PROC-002
- US-PROC-003
- US-PROC-004

Referencias operacionais
- docs/SP-05-Processos-Planejamento.md
- docs/Backend-Plan-Sprints-3-5.md
- docs/Traceability-Matrix-Sprints-3-5.md

---

## Epicos alvo para proximas sprints

### EP-PROC-01 - Processos
- Objetivo: estruturar ciclo completo de processos/casos com fases, prazos e responsabilidades.
- Status: Backlog

### EP-FIN-01 - Financeiro
- Objetivo: controlar cobranca, repasse, provisao e inadimplencia por caso/cliente.
- Status: Backlog

### EP-IA-01 - IA aplicada
- Objetivo: apoiar triagem documental, sugestao de checklist, analise de risco e resumos operacionais.
- Status: Backlog

---

## Checklist de prontidao para backend (VS Code)

Antes de iniciar implementacao de uma feature no backend, validar:
- Historia com ID e criterios de aceitacao definidos.
- Contrato de API (entrada/saida/erros) descrito.
- Regra de negocio explicita (inclusive limites e excecoes).
- Requisitos de auditoria e seguranca mapeados.
- Estado final esperado definido para testes.

Quando esse checklist estiver completo, a etapa de analise funcional ja esta pronta para codificacao.
