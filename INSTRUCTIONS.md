# Projeto
Este projeto foi desenvolvido para a jornada de backend da WebTech.  
Este documento contém as instruções necessárias para configurar e executar o projeto corretamente. **Siga as etapas na ordem indicada para evitar erros.**

## 1. Subir o banco com Docker
O banco de dados utilizado é o **PostgreSQL**, executado em um contêiner Docker. Ele é essencial para o funcionamento da aplicação.

Para subir o banco, execute no terminal:

```bash
docker compose up         # Para versões mais recentes do Docker
docker-compose up         # Para versões mais antigas do Docker
```
> Verifique se você tem o docker baixado em sua máquina para executar o comando `docker`.
> 
> Adicione a flag `-d` após `up` para rodar em segundo plano e liberar o terminal.

Para fazer com que o docker pare de executar, basta rodar esse outro comando:
```bash
docker compose down       # Para versões mais recentes do Docker
docker-compose down       # Para versões mais antigas do Docker
```
> Adicione a flag `-v` para também remover os volumes e dados armazenados.

## 2. Como executar migrations
As migrations criam a estrutura de tabelas do banco de dados.

Para aplicar as migrations:
```bash
npx knex migrate:latest
```

Se você alterou as migrations após já tê-las executado, utilize:
```bash
npx knex migrate:rollback --all
npx knex migrate:latest
```

## 3. Como rodar seeds
As seeds populam o banco de dados com dados iniciais.

Para rodar as seeds:
```bash
npx knex seed:run
```

Esse comando irá popular o banco com os dados definidos nos arquivos da pasta `seeds` (como `agentes` e `casos`).

Após seguir todos os passos, o ambiente estará pronto para executar o projeto.