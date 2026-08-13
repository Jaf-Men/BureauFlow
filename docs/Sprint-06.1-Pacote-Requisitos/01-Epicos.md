# Epicos

## EP-01 - Identidade e Acesso
Permitir cadastro, autenticacao e verificacao de contas com base em identidade de pessoa e sem acoplamento rigido a uma unica funcao.

### Resultados esperados
- Cadastro por perfil principal.
- Adicao de papeis adicionais para a mesma pessoa.
- Sessao com informacoes de papeis e dados basicos.

## EP-02 - Dominio de Pessoas, Papeis e Organizacoes
Separar conceito de pessoa, papel e associacao organizacional, permitindo multiplos vinculos sem duplicacao de identidade.

### Resultados esperados
- Pessoa com multiplos papeis.
- Vinculo de pessoa com uma ou mais organizacoes.
- Suporte a autonomos com operacao completa.

## EP-03 - Enderecos e Contatos Estruturados
Normalizar endereco e contato para evolucao futura e reuso em pessoas e organizacoes.

### Resultados esperados
- Endereco residencial/profissional/comercial.
- Contatos tipados (email, phone, mobile, whatsapp).
- Marcacao de principal e ativo.

## EP-04 - Processos com Participacao Flexivel
Modelar processo com participantes contextuais, sem campos fixos e sem bloqueios indevidos de atuacao.

### Resultados esperados
- Participantes por papel contextual.
- Participacao de cliente, advogado, representante e partes.
- Reuso de pessoa em multiplos processos.

## EP-05 - Regra de Representante Legal
Garantir integridade do representante legal por processo com historico de substituicao.

### Resultados esperados
- No maximo um representante legal ativo por processo.
- Substituicao sem perda de historico.
- Suporte a representante interno e externo.

## EP-06 - Auto-representacao por CPF
Reconhecer automaticamente auto-representacao legal quando identidade de cliente e representante coincide.

### Resultados esperados
- Regra automatica no backend por CPF.
- Classificacao do processo como AUTO_REPRESENTANTE_LEGAL.
- Exibicao no frontend conforme retorno do backend.

## EP-07 - Convites e Colaboracao
Manter convite como mecanismo de colaboracao sem destruir papeis existentes da pessoa.

### Resultados esperados
- Aceite de convite cria conta quando necessario.
- Aceite de convite adiciona papel quando pessoa ja existe.

## EP-08 - Governanca Tecnica e Evolucao
Consolidar documentacao funcional e tecnica para garantir continuidade do roadmap e reduzir retrabalho de dominio.

### Resultados esperados
- Pacote completo de requisitos.
- Diagramas de dominio e processo.
- Rastreabilidade entre escopo e implementacao.
