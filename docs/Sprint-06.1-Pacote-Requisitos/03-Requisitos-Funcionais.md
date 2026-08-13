# Requisitos Funcionais (RF)

## RF-01 Cadastro de pessoa
O sistema deve permitir criar conta de pessoa com papel principal inicial e dados de autenticacao.

## RF-02 Multiplicidade de papeis
O sistema deve permitir que uma pessoa possua mais de um papel simultaneamente.

## RF-03 Inclusao de novo papel
O sistema deve permitir adicionar papel adicional para usuario autenticado.

## RF-04 Cadastro de organizacao
O sistema deve permitir criar organizacao com tipo, dados fiscais e endereco comercial.

## RF-05 Vinculo pessoa-organizacao
O sistema deve permitir vincular pessoa a organizacao sem alterar identidade base da pessoa.

## RF-06 Cadastro de equipe por perfis
O sistema deve permitir incluir membros de equipe por perfil contextual (advogado, colaborador, gestor, representante legal).

## RF-07 Lookup de membros
O sistema deve permitir consultar pessoa por nome, email ou CPF para reaproveitar cadastro.

## RF-08 Criacao de processo
O sistema deve permitir criar processo com contexto organizacional opcional.

## RF-09 Participantes flexiveis
O sistema deve permitir associar participantes ao processo com papel contextual.

## RF-10 Definicao de representante legal
O sistema deve permitir associar representante legal ao processo.

## RF-11 Restricao de representante unico ativo
O sistema deve impedir dois representantes legais ativos no mesmo processo.

## RF-12 Substituicao com historico
O sistema deve permitir substituir representante legal mantendo registro do anterior e motivo.

## RF-13 Auto-representacao automatica
O sistema deve classificar auto-representacao quando CPF de cliente e representante for igual e a pessoa possuir papel de representante legal.

## RF-14 Enderecos estruturados
O sistema deve suportar enderecos por tipo (residential, professional, commercial), com principal/ativo e timestamps.

## RF-15 Contatos estruturados
O sistema deve suportar contatos por tipo (email, phone, mobile, whatsapp), com principal/ativo e timestamps.

## RF-16 Convites
O sistema deve permitir criar convite, consultar convite e aceitar convite.

## RF-17 Convite com usuario existente
Ao aceitar convite para usuario existente, o sistema deve manter conta e adicionar papel quando aplicavel.

## RF-18 Sessao e perfil publico
O sistema deve retornar sessao com dados publicos de usuario e papeis atuais.

## RF-19 Consulta de escopo do usuario
O sistema deve retornar organizacoes, enderecos e contatos relacionados ao usuario autenticado.

## RF-20 Rotulo de persona no frontend
O frontend deve exibir a persona Representante legal (despachante) autonomo e o card Escritorio de Advocacia com a nomenclatura definida.

## RF-21 Validacoes de cadastro no backend
O backend deve validar pre-condicoes de cadastro, incluindo obrigatoriedade de enderecos conforme contexto.

## RF-22 Autorizacao de processo no backend
O backend deve negar acesso a processo quando usuario nao for criador nem tiver vinculo autorizado.
