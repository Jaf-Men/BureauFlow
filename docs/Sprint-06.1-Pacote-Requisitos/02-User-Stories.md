# User Stories

## US-01 - Cadastro de advogado autonomo
Como advogado autonomo,
quero criar minha conta com dados pessoais e profissionais,
para operar processos sem depender de uma organizacao.

### Criterios de aceite
1. Deve permitir cadastro com papel advogado.
2. Deve exigir dados profissionais aplicaveis (ex.: OAB quando requerido).
3. Deve permitir atuar em processos proprios.

## US-02 - Cadastro de representante legal autonomo
Como Representante legal (despachante) autonomo,
quero criar conta com meus dados e enderecos,
para atender clientes e atuar em processos internos e externos.

### Criterios de aceite
1. O label deve aparecer exatamente como Representante legal (despachante) autonomo.
2. Deve permitir uso sem vinculo obrigatorio a organizacao.
3. Deve permitir participacao em processos de terceiros quando autorizado.

## US-03 - Pessoa com multiplos papeis
Como pessoa ja cadastrada,
quero adicionar um novo papel na minha conta,
para atuar em contextos diferentes sem duplicar identidade.

### Criterios de aceite
1. A identidade da pessoa deve ser preservada.
2. O sistema deve manter papeis acumulados.
3. Nao deve sobrescrever papel anterior.

## US-04 - Cadastro de cliente autonomo
Como cliente,
quero criar minha conta diretamente,
para acompanhar demandas sem depender exclusivamente de convite.

### Criterios de aceite
1. Cliente pode existir sem organizacao.
2. Cliente pode participar de multiplos processos.
3. Cliente pode acumular outros papeis quando permitido.

## US-05 - Vinculo com organizacao sem bloqueio de identidade
Como administrador de organizacao,
quero vincular pessoas a minha equipe,
para operar processos sem transformar usuario em entidade exclusiva da minha organizacao.

### Criterios de aceite
1. Vinculo com organizacao deve ser associativo.
2. Pessoa pode manter atuacao externa quando permitido.
3. Vinculo nao altera identidade base da pessoa.

## US-06 - Nomear representante legal interno ou externo
Como escritorio ou empresa,
quero nomear representante legal em um processo,
para cumprir o fluxo juridico em diferentes cenarios operacionais.

### Criterios de aceite
1. Deve permitir representante interno.
2. Deve permitir representante externo.
3. Deve validar papel adequado no backend.

## US-07 - Garantir representante legal unico ativo
Como gestor do processo,
quero que o sistema impeça dois representantes legais ativos simultaneamente,
para manter integridade juridica.

### Criterios de aceite
1. Processo aceita no maximo um representante legal ativo.
2. Substituicao deve inativar o anterior.
3. Historico do anterior deve ser preservado.

## US-08 - Reconhecer auto-representacao
Como operador,
quero que o sistema detecte auto-representacao automaticamente,
para nao depender de marcacao manual e evitar erro humano.

### Criterios de aceite
1. Comparar CPF de cliente e representante no backend.
2. Validar que a pessoa possui papel de representante legal.
3. Marcar representacao como AUTO_REPRESENTANTE_LEGAL.

## US-09 - Enderecos estruturados por contexto
Como produto,
quero separar endereco residencial, profissional e comercial,
para evitar duplicacao e suportar evolucao.

### Criterios de aceite
1. Pessoa pode ter endereco residencial.
2. Pessoa pode ter endereco profissional.
3. Organizacao pode ter endereco comercial.

## US-10 - Contatos estruturados por tipo
Como produto,
quero contatos tipados e gerenciaveis,
para suportar canais de comunicacao presentes e futuros.

### Criterios de aceite
1. Contatos com tipo, principal e ativo.
2. Compatibilidade com fluxo atual de login/cadastro.

## US-11 - Convite sem perda de papeis
Como pessoa convidada,
quero aceitar convite sem perder papeis que ja possuo,
para manter continuidade operacional.

### Criterios de aceite
1. Se usuario existe, convite adiciona papel quando aplicavel.
2. Se usuario nao existe, cria conta conforme dados do convite.

## US-12 - Seguranca por autorizacao no backend
Como sistema,
quero validar autorizacao de acesso a processos e operacoes criticas no backend,
para evitar exposicao indevida por controles apenas de frontend.

### Criterios de aceite
1. Acesso a processo deve ser validado por ownership ou vinculo autorizado.
2. Associacao de representante deve respeitar permissao.
3. Operacoes nao autorizadas devem retornar erro.
