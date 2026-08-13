# Regras de Negocio (RN)

## RN-01 Separacao de conceitos
Pessoa, papel, vinculo organizacional e participacao em processo sao conceitos distintos.

## RN-02 Multipapeis
Uma pessoa pode acumular papeis de cliente, advogado, representante legal e outros futuros.

## RN-03 Papel nao implica exclusividade
Papel principal nao impede papeis adicionais.

## RN-04 Representante legal oficial
A nomenclatura oficial e Representante legal (despachante).

## RN-05 Representante autonomo
Representante legal (despachante) autonomo opera sem obrigacao de pertencer a organizacao.

## RN-06 Representante interno/externo
Representante legal de um processo pode ser membro da organizacao ou externo.

## RN-07 Unicidade de representante ativo por processo
Um processo pode ter no maximo um representante legal ativo simultaneamente.

## RN-08 Historico de substituicao
Substituicao de representante deve preservar historico do participante anterior.

## RN-09 Autorrepresentacao automatica
Se CPF(cliente) = CPF(representante) e a pessoa possui papel despachante, classificacao deve ser AUTO_REPRESENTANTE_LEGAL.

## RN-10 Validacao backend obrigatoria
Regras criticas devem ser validadas no backend.

## RN-11 Endereco individual obrigatorio
Toda pessoa cadastrada deve ter endereco individual (residencial).

## RN-12 Endereco profissional para autonomos
Advogado autonomo e representante autonomo devem ter endereco profissional.

## RN-13 Endereco comercial para organizacoes
Escritorio e empresa devem possuir endereco comercial.

## RN-14 Convite nao remove papeis
Aceite de convite nunca deve remover papeis existentes; apenas adicionar quando aplicavel.

## RN-15 Autorizacao por contexto
Usuario so pode acessar/alterar processo quando for criador ou estiver autorizado por vinculo.

## RN-16 Integridade de papeis contextuais
Participante com papel LAWYER deve possuir papel advogado.

## RN-17 Integridade de representante
Participante com papel LEGAL_REPRESENTATIVE deve possuir papel despachante.

## RN-18 Reuso de identidade
CPF e email devem servir para reaproveitar identidade evitando duplicacao de pessoa.

## RN-19 Evolucao de dominio
Modelo deve permitir novos papeis sem remodelagem estrutural total.

## RN-20 Frontend como camada de apresentacao
Frontend deve refletir regra de negocio, sem ser unica camada de decisao critica.
