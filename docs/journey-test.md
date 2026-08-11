# Teste da Jornada

1. Inicie a API e o front-end conforme o `README.md`.
2. Acesse `http://127.0.0.1:5173`.
3. Crie uma conta de advogado ou escritório.
4. Para um escritório, informe responsável, organização e ao menos um advogado, depois revise os dados.
5. Na tela de confirmação, abra o link local exibido pela aplicação.
6. Faça login com o e-mail e a senha definidos no cadastro.
7. Na tela de onboarding, escolha uma das opções de início ou use o botão **Quero ir para o painel**.
8. No painel, abra **Clientes**, informe os dados do convite e copie o link resultante.
9. Abra o link em uma janela anônima, crie a senha do cliente e aceite o convite.

Em desenvolvimento, os dados ficam em memória e são apagados ao reiniciar a API. Para persistência, configure PostgreSQL e execute as migrations descritas no `README.md`.