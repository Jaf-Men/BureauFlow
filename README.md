# BureauFlow

Iniciação do sistema BureauFlow.

Este é o código do design do sistema BureauFlow. O projeto original está disponível em https://www.figma.com/design/cRpnrCjOmFWBSJOK8Izi2r/BureauFlow-system-design.

## Tecnologias definidas

| Camada | Tecnologias |
| --- | --- |
| Front-end | React, TypeScript, Vite e Tailwind CSS |
| Back-end | Node.js, NestJS e Prisma ORM |
| Banco de dados | PostgreSQL |
| Autenticação | JWT |

O front-end utiliza React, Vite e Tailwind CSS. O backend em `backend/` usa NestJS e JWT; o schema de produção para PostgreSQL está em `backend/prisma/schema.prisma`.

## Jornada implementada

1. Criar conta como advogado ou escritório.
2. Informar dados do responsável, organização e integrantes do escritório.
3. Revisar os dados, criar a conta e confirmar o e-mail por token.
4. Fazer o primeiro login com JWT.
5. Convidar um cliente por link com expiração.
6. Aceitar o convite e criar a conta de cliente.

No ambiente local, os links de confirmacao e convite aparecem na interface para viabilizar o teste sem um provedor de e-mail. A API usa armazenamento em memoria neste modo; configure `DATABASE_URL` e aplique as migrations do Prisma para usar PostgreSQL persistente.

## Atualizacoes recentes (versao atual)

- Onboarding com chamada direta para escolha de modulo e atalho opcional para painel.
- Dashboard com sidebar colapsavel, menu consolidado (Processos, Clientes, Documentos, Assinaturas, BureauIA e Auditoria) e acao de saida destacada.
- Persistencia de sessao e tela atual no front-end via localStorage (`bf-auth`, `bf-session`, `bf-view`) para manter contexto apos recarregar.
- Fallback de erro de renderizacao no app com acao de recarregar para evitar tela branca silenciosa.
- Acesso em rede local (LAN) habilitado no fluxo de desenvolvimento:
	- front-end com host `0.0.0.0`;
	- back-end com host configuravel e CORS flexivel em ambiente nao-producao;
	- resolucao automatica da URL da API em `src/app/api.ts` com base no host do navegador.

## Executar o projeto

Execute os comandos abaixo em dois terminais:

```powershell
npm install
npm run dev -- --host 127.0.0.1
```

```powershell
cd backend
npm install
npm run dev
```

A aplicacao fica disponivel em `http://127.0.0.1:5173` e a API em `http://127.0.0.1:3000`.

Opcionalmente, para reduzir conflito de porta e padronizar o navegador fora da IDE, use:

```powershell
npm run dev:browser
```

Esse comando fixa o front-end em `http://127.0.0.1:5176`.

### Execucao rapida no Windows (fora da IDE)

Se o PowerShell bloquear o comando `npm`, use o arquivo `start-dev.bat` na raiz do projeto (o script usa `npm.cmd`).

1. Dê duplo clique em `start-dev.bat`.
2. O script abrirá duas janelas separadas:
	- Front-end (Vite)
	- Back-end (NestJS)
3. Para encerrar, feche as duas janelas.

Por padrao, o front-end sobe em `http://127.0.0.1:5176/` (porta fixa) e tambem fica acessivel na rede local (`http://SEU_IP_LOCAL:5176/`). Se abrir uma tela em branco no navegador, faca um recarregamento forcado (`Ctrl + F5`) ou feche a aba antiga e abra novamente esse endereco.

Se ainda houver conflito de instância antiga, execute `start-clean.bat`. Ele encerra processos nas portas `5176` e `3000` e inicia o projeto novamente.

## Execução estável fora da IDE (modo produção local)

Para validar o sistema em navegadores externos sem depender do servidor de desenvolvimento:

1. Execute `start-prod.bat` na raiz do projeto.
2. O script instala dependências, gera build do front-end e back-end e abre duas janelas:
	- API em modo `start` (build compilado)
	- Front-end em `vite preview`
3. Acesse no navegador:
	- Front-end: `http://127.0.0.1:4173/`
	- API: `http://127.0.0.1:3000/`

Esse modo reduz diferenças entre ambiente de IDE e uso em navegador comum (Chrome, Edge, Firefox).

## PostgreSQL

1. Copie `backend/.env.example` para `backend/.env`.
2. Configure `DATABASE_URL` com a URL do seu PostgreSQL.
3. Execute `npm run prisma:generate` e `npm run prisma:migrate` dentro de `backend/`.

## Documentacao de produto

Para evolucao orientada a produto (Sprint -> Epico -> Feature -> Historia -> Criterios de Aceitacao), usar:

- `docs/Product-Methodology.md`
- `docs/Product-Backlog-Sprints-0-4.md`
- `docs/SP-05-Processos-Planejamento.md`
- `docs/Sprint-06-Orquestracao-de-Processos.md`
- `docs/Backend-Plan-Sprints-3-5.md`
- `docs/Traceability-Matrix-Sprints-3-5.md`

O documento `docs/Sprint-3-Checklist-e-Sprint-4.md` permanece como historico legado de checklist.
