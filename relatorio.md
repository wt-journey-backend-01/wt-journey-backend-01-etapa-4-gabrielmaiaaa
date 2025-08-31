<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 4 créditos restantes para usar o sistema de feedback AI.

# Feedback para gabrielmaiaaa:

Nota final: **48.7/100**

Olá, gabrielmaiaaa! 👋🚀

Primeiramente, parabéns pelo esforço e pelo que você já conseguiu entregar neste desafio tão complexo de segurança, autenticação e autorização em Node.js com Express e PostgreSQL! 🎉 Você implementou a estrutura básica de autenticação com JWT, hashing de senhas com bcrypt e proteção das rotas, e isso já é um grande avanço.

Além disso, você conseguiu passar vários testes importantes, como criação e login de usuários, logout, exclusão de usuários, e proteção das rotas com middleware de autenticação — isso mostra que você está no caminho certo! 👏 Também implementou endpoints para agentes e casos com as validações necessárias, o que é muito bom.

---

## 🚩 Análise dos Testes que Falharam e Causas Raiz

### Testes que falharam (resumo):
- `'USERS: Recebe erro 400 ao tentar criar um usuário com e-mail já em uso'`
- `'AGENTS: Cria agentes corretamente com status code 201 e os dados inalterados do agente mais seu ID'`
- `'AGENTS: Lista todos os agente corretamente com status code 200 e todos os dados de cada agente listados corretamente'`
- `'AGENTS: Busca agente por ID corretamente com status code 200 e todos os dados do agente listados dentro de um objeto JSON'`
- `'AGENTS: Atualiza dados do agente com por completo (com PUT) corretamente com status code 200 e dados atualizados do agente listados num objeto JSON'`
- `'AGENTS: Atualiza dados do agente com por completo (com PATCH) corretamente com status code 200 e dados atualizados do agente listados num objeto JSON'`
- `'AGENTS: Deleta dados de agente corretamente com status code 204 e corpo vazio'`
- `'AGENTS: Recebe status code 400 ao tentar criar agente com payload em formato incorreto'`
- `'AGENTS: Recebe status 404 ao tentar buscar um agente inexistente'`
- `'AGENTS: Recebe status 404 ao tentar buscar um agente com ID em formato inválido'`
- `'AGENTS: Recebe status code 401 ao tentar buscar agente corretamente mas sem header de autorização com token JWT'`
- `'AGENTS: Recebe status code 400 ao tentar atualizar agente por completo com método PUT e payload em formato incorreto'`
- `'AGENTS: Recebe status code 404 ao tentar atualizar agente por completo com método PUT de agente inexistente'`
- `'AGENTS: Recebe status code 404 ao tentar atualizar agente por completo com método PUT de agente de ID em formato incorreto'`
- `'AGENTS: Recebe status code 400 ao tentar atualizar agente parcialmente com método PATCH e payload em formato incorreto'`
- `'AGENTS: Recebe status code 404 ao tentar atualizar agente por parcialmente com método PATCH de agente inexistente'`
- `'AGENTS: Recebe status code 404 ao tentar deletar agente inexistente'`
- `'AGENTS: Recebe status code 404 ao tentar deletar agente com ID inválido'`
- `'CASES: Cria casos corretamente com status code 201 e retorna dados inalterados do caso criado mais seu ID'`
- `'CASES: Lista todos os casos corretamente com status code 200 e retorna lista com todos os dados de todos os casos'`
- `'CASES: Busca caso por ID corretamente com status code 200 e retorna dados do caso'`
- `'CASES: Atualiza dados de um caso com por completo (com PUT) corretamente com status code 200 e retorna dados atualizados'`
- `'CASES: Atualiza dados de um caso parcialmente (com PATCH) corretamente com status code 200 e retorna dados atualizados'`
- `'CASES: Deleta dados de um caso corretamente com status code 204 e retorna corpo vazio'`
- `'CASES: Recebe status code 400 ao tentar criar caso com payload em formato incorreto'`
- `'CASES: Recebe status code 404 ao tentar criar caso com ID de agente inexistente'`
- `'CASES: Recebe status code 404 ao tentar criar caso com ID de agente inválido'`
- `'CASES: Recebe status code 404 ao tentar buscar um caso por ID inválido'`
- `'CASES: Recebe status code 404 ao tentar buscar um caso por ID inexistente'`
- `'CASES: Recebe status code 400 ao tentar atualizar um caso por completo com método PUT com payload em formato incorreto'`
- `'CASES: Recebe status code 404 ao tentar atualizar um caso por completo com método PUT de um caso inexistente'`
- `'CASES: Recebe status code 404 ao tentar atualizar um caso por completo com método PUT de um caso com ID inválido'`
- `'CASES: Recebe status code 404 ao tentar atualizar um caso parcialmente com método PATCH de um caso inexistente'`
- `'CASES: Recebe status code 404 ao tentar atualizar um caso parcialmente com método PATCH de um caso com ID inválido'`
- `'CASES: Recebe status code 404 ao tentar deletar um caso inexistente'`
- `'CASES: Recebe status code 404 ao tentar deletar um caso com ID inválido'`

---

### 1. Erro ao criar usuário com email já em uso (Erro 400 esperado, mas falha)
**Causa raiz:**  
No `authController.js`, você faz a verificação correta se o email já está em uso:

```js
const usuarioExistente = await usuariosRepository.encontrarUsuarioPorEmail(dados.email);

if(usuarioExistente){            
    return next(new ApiError(400, "Esse email já está em uso."));
}
```

Porém, no `usuariosRepository.js`, a função `encontrarUsuarioPorEmail` retorna `false` quando não encontra o usuário, e o objeto do usuário caso encontre:

```js
async function encontrarUsuarioPorEmail(email) {
    try {
        const user = await db('usuarios').whereRaw('LOWER(email) = ?', email.toLowerCase());

        if(!user || user.length === 0) {
            return false;
        }

        return user[0];
    } catch (error) {
        console.log(error);
        return false;        
    }
}
```

O problema pode estar no uso da comparação via `whereRaw` com parâmetro, que pode não estar funcionando corretamente no Knex com PostgreSQL para comparar strings em lowercase. Isso pode fazer com que a verificação não encontre o usuário mesmo que ele exista, permitindo a criação duplicada e quebrando o teste que espera erro 400.

**Solução recomendada:**  
Use o método `.where` com `LOWER` no lado do banco de dados, para garantir a comparação case-insensitive correta:

```js
const user = await db('usuarios')
  .whereRaw('LOWER(email) = LOWER(?)', [email])
```

Ou ainda melhor, use `.where` com função Knex para evitar SQL injection e garantir compatibilidade:

```js
const user = await db('usuarios')
  .where(db.raw('LOWER(email)'), email.toLowerCase());
```

Isso garante que a consulta seja feita de forma correta. Também vale a pena logar o valor retornado para ter certeza.

**Recurso recomendado:**  
Para entender melhor consultas case-insensitive no Knex com PostgreSQL, recomendo este vídeo:  
https://www.youtube.com/watch?v=GLwHSs7t3Ns&t=4s (Guia detalhado do Knex Query Builder)

---

### 2. Problemas com os endpoints de agentes e casos (criação, listagem, atualização, deleção, buscas, filtros, etc)

Você tem muitos testes falhando para agentes e casos, principalmente relacionados a:

- Status codes incorretos (ex: 400 em vez de 404, ou vice-versa)
- Dados retornados incompletos ou incorretos
- Filtros e buscas que não retornam os dados esperados

**Causas comuns encontradas:**

- **Retorno falso em vez de erro:**  
Em quase todos os repositórios, quando não encontra dados, você retorna `false`. Isso pode confundir o controller, que espera `null` ou `undefined` para diferenciar ausência de dados, e pode gerar erros de lógica.

- **Validação Zod e tratamento de erros:**  
Você usa o `zod` para validar parâmetros, o que é ótimo! Mas em alguns controllers, o tratamento do erro `ZodError` retorna status 404 para erros de validação de ID em vez de 400 (exemplo em `getAgente`):

```js
if (error instanceof z.ZodError) {
    return next(new ApiError(404, "ID inválido"))
}
```

O correto seria retornar **400 Bad Request** para parâmetros inválidos, pois 404 é para recurso não encontrado.

- **Formato da data no agente:**  
Você tem uma função para formatar datas para string, mas em alguns lugares pode estar faltando aplicar essa formatação, ou pode haver inconsistência no formato esperado.

- **Tratamento de payloads incompletos ou inválidos:**  
Certifique-se que o schema `zod` usado para validar o corpo da requisição está cobrindo todos os casos, e que erros são tratados com status 400.

- **Middleware de autenticação:**  
Está correto, mas vale reforçar que todos os endpoints de agentes e casos estão protegidos com `authMiddleware`, o que é ótimo! Só fique atento para garantir que ele retorne 401 quando o token estiver ausente ou inválido, o que você já fez.

**Exemplo de melhoria no tratamento de erro de validação:**

```js
if (error instanceof z.ZodError) {
    return next(new ApiError(400, "Parâmetros inválidos"));
}
```

---

### 3. Falha nos testes bônus (filtros, buscas e endpoint /usuarios/me)

Você implementou o endpoint `/usuarios/me` que retorna dados do usuário autenticado, mas o teste bônus falhou. Isso pode estar relacionado a:

- Falta de retorno correto dos dados esperados (ex: retornar só `nome` e `email` exatamente, sem campos extras)
- Algum problema no middleware que popula `req.user` (mas seu middleware parece OK)
- Algum detalhe no formato JSON ou status code diferente de 200

**Dica:**  
Faça testes manuais com Postman ou Insomnia para garantir que `/usuarios/me` retorna exatamente:

```json
{
  "nome": "nome do usuário",
  "email": "email@exemplo.com"
}
```

com status 200.

---

### 4. Estrutura de diretórios e arquivos

Sua estrutura está muito próxima do esperado! Você tem:

- `server.js`
- `knexfile.js`
- `.env` (não enviado, mas presumido)
- `INSTRUCTIONS.md`
- Pastas `db`, `routes`, `controllers`, `repositories`, `middlewares`, `utils`

E os arquivos novos para autenticação (`authRoutes.js`, `authController.js`, `usuariosRepository.js`, `authMiddleware.js`) estão no lugar correto.

**Ponto de atenção:**  
No seu `package.json`, o `"main"` está apontando para `"knexfile.js"`. O ideal é que o `main` aponte para o arquivo principal da aplicação, que é o `server.js`. Isso não causa erro direto, mas pode confundir algumas ferramentas.

```json
"main": "server.js",
```

---

## 💡 Recomendações para você avançar e corrigir os erros

1. **Refine a verificação de email ao registrar usuário** para garantir que a busca seja case-insensitive e correta, evitando criar usuários duplicados.

2. **Padronize o tratamento de erros de validação** para sempre retornar status 400 para parâmetros inválidos, e 404 para recursos não encontrados.

3. **Ajuste os retornos dos repositórios para `null` ou `undefined` ao invés de `false`** para indicar ausência de dados, facilitando a lógica no controller.

4. **Teste manualmente os endpoints de agentes e casos**, especialmente os métodos PUT, PATCH e DELETE, para garantir que retornam os status codes e dados corretos.

5. **Confirme que o endpoint `/usuarios/me` retorna exatamente os dados esperados**, e que o middleware autentica corretamente.

6. **Atualize o campo `main` do `package.json` para `"server.js"`**, para seguir boas práticas.

7. **Continue usando o `zod` para validação, mas garanta tratamento uniforme dos erros**.

---

## Exemplos de ajustes práticos

### Ajuste no `usuariosRepository.js` para busca de email:

```js
async function encontrarUsuarioPorEmail(email) {
    try {
        const user = await db('usuarios')
            .whereRaw('LOWER(email) = LOWER(?)', [email]);

        if(!user || user.length === 0) {
            return null;  // Use null para indicar não encontrado
        }

        return user[0];
    } catch (error) {
        console.log(error);
        return null;        
    }
}
```

### Ajuste no tratamento de erros Zod no controller (exemplo em `getAgente`):

```js
if (error instanceof z.ZodError) {
    return next(new ApiError(400, "ID inválido"));
}
```

### Atualização do `package.json`:

```json
"main": "server.js",
```

---

## 🎯 Resumo dos principais pontos para focar:

- [ ] Corrigir a busca de usuário por email para evitar duplicidade no cadastro.
- [ ] Padronizar o tratamento de erros de validação para status 400.
- [ ] Usar `null` em vez de `false` para ausência de dados nos repositórios.
- [ ] Validar e testar manualmente os endpoints de agentes e casos para garantir status codes e respostas corretas.
- [ ] Garantir que o endpoint `/usuarios/me` retorne os dados corretos e que middleware funcione perfeitamente.
- [ ] Ajustar o campo `main` no `package.json`.
- [ ] Revisar mensagens de erro para serem claras e consistentes.

---

## Recursos recomendados para você aprofundar:

- **Autenticação com JWT e bcrypt:**  
  Esse vídeo, feito pelos meus criadores, fala muito bem sobre autenticação e segurança em Node.js, JWT e bcrypt:  
  https://www.youtube.com/watch?v=L04Ln97AwoY

- **JWT na prática:**  
  Para entender melhor a geração e verificação de tokens JWT:  
  https://www.youtube.com/watch?v=keS0JWOypIU

- **Knex Query Builder:**  
  Para consultas avançadas e corretas com Knex, incluindo comparações case-insensitive:  
  https://www.youtube.com/watch?v=GLwHSs7t3Ns&t=4s

- **Arquitetura MVC em Node.js:**  
  Para organizar seu projeto e entender a separação de responsabilidades:  
  https://www.youtube.com/watch?v=bGN_xNc4A1k&t=3s

---

Gabriel, você está mandando muito bem, e corrigindo esses pontos, seu projeto vai ficar ainda mais sólido e profissional! Continue praticando e testando cada endpoint com calma, e não hesite em usar os recursos recomendados para aprofundar seu conhecimento. Estou aqui torcendo pelo seu sucesso! 💪🚀

Se precisar de mais ajuda, é só chamar! 😉

Um abraço e bons códigos! 👨‍💻✨

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>