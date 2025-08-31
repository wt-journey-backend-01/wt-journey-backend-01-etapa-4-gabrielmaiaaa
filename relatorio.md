<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 1 créditos restantes para usar o sistema de feedback AI.

# Feedback para gabrielmaiaaa:

Nota final: **48.7/100**

Olá, gabrielmaiaaa! 👋🚀

Antes de tudo, quero parabenizar você pelo esforço e pelo código que enviou. Você conseguiu implementar muitos dos requisitos essenciais do projeto, como o cadastro e login de usuários, o uso de JWT para autenticação, a proteção das rotas de agentes e casos, e até mesmo o logout e exclusão de usuários. Isso é um ótimo avanço! 🎉👏

Além disso, você também entregou funcionalidades bônus importantes, como o endpoint `/usuarios/me` para retornar os dados do usuário autenticado, e implementou filtros e buscas nos agentes e casos, o que mostra um excelente domínio do projeto. Muito bom mesmo! 🌟

---

## 🚦 Análise dos Testes que Falharam

Você teve falhas principalmente nos testes base que são obrigatórios para a aprovação, especialmente relacionados a:

- Erro 400 ao tentar criar usuário com e-mail já em uso.
- Criação, listagem, busca, atualização e deleção de agentes com status code e dados corretos.
- Falhas nas validações e erros de status code para agentes e casos.
- Autorização com JWT (status 401 quando token ausente).
- Atualização e deleção corretas com tratamento de erros.

---

### 1. Erro 400 ao tentar criar usuário com e-mail já em uso

**O que o teste espera:**  
Quando você tenta registrar um usuário com um e-mail que já existe no banco, a API deve responder com status 400 e uma mensagem de erro clara.

**Seu código relevante:**
```js
async function register(req, res, next) {
    try{
        const dados = usuarioRegistroSchema.parse(req.body);
        const usuarioExistente = await usuariosRepository.encontrarUsuarioPorEmail(dados.email);

        if(usuarioExistente){            
            return next(new ApiError(400, "Esse email já está em uso."));
        }             

        // resto do código...
    }
    // ...
}
```

**Análise:**  
Aqui você já trata a existência do usuário e retorna erro 400. Isso está correto. Porém, o teste falhou, indicando que talvez o método `encontrarUsuarioPorEmail` não esteja funcionando como esperado.

No `usuariosRepository.js`:
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

Aqui, você usa `whereRaw` com `LOWER(email) = ?`, o que é correto para buscar ignorando caixa. Porém, o uso do `?` e o parâmetro podem estar com problema de sintaxe dependendo do driver e versão do Knex/Postgres.

**Sugestão:**  
Use a sintaxe do Knex para evitar problemas, por exemplo:
```js
const user = await db('usuarios').whereRaw('LOWER(email) = LOWER(?)', [email]);
```

Além disso, verifique se a migration criou o campo `email` como único e se o banco está com dados corretos.

---

### 2. Falhas em Agentes: Criação, Listagem, Busca, Atualização e Deleção

Você teve vários testes falhando relacionados às operações CRUD de agentes e seus retornos de status code e dados.

**Possíveis causas:**

- **Status code incorreto ou dados retornados diferentes do esperado:**  
  Seu controller geralmente retorna os dados com sucesso, por exemplo:

  ```js
  res.status(201).json(dados);
  ```

  Isso está correto. Porém, o teste pode estar esperando que o ID seja retornado exatamente como no banco, e que os dados não sejam alterados.

- **Validação de payload:**  
  Você usa o Zod para validar dados, o que é ótimo. Mas pode ser que algum campo obrigatório esteja faltando ou com nome diferente.

- **Middleware de autenticação:**  
  Todos os endpoints de agentes usam o `authMiddleware`. Se o token JWT não estiver sendo enviado corretamente no header Authorization, o teste retornará 401.

- **Middleware de debug:**  
  Você usa o `debugMiddleware` em todas as rotas. Isso é bom para desenvolvimento, mas certifique-se que ele não altera nada no fluxo.

**Recomendações:**

- Confira se o token JWT está sendo passado corretamente nos testes (header `Authorization: Bearer <token>`).
- Verifique se o formato da data em agentes está consistente. Você tem uma função `formatarData` que transforma a data para string no formato `YYYY-MM-DD`, isso é correto.
- Garanta que o ID está sendo retornado e que o objeto JSON não tem campos extras ou faltantes.

---

### 3. Erros 400 e 404 em Agentes e Casos ao usar PUT/PATCH e ao buscar IDs inválidos

Você implementou validações com Zod para IDs e payloads, o que é ótimo e esperado.

No entanto, o teste pode estar esperando mensagens e status codes muito específicos.

Exemplo do seu código para validação de ID no agentesController:

```js
try {
    const { id } = agenteIdValido.parse(req.params);
    // ...
} catch (error) {
    if (error instanceof z.ZodError) {
        return next(new ApiError(404, "ID inválido"))
    }
    next(error);
}
```

**Análise:**  
Aqui, quando o ID é inválido, você retorna 404. O teste pode esperar um 400 para IDs mal formatados (como strings não numéricas). Verifique a documentação do teste para saber qual status é esperado.

---

### 4. Status 401 ao acessar rotas protegidas sem token JWT

Você implementou o middleware de autenticação `authMiddleware` corretamente, que verifica o token JWT no header Authorization ou cookie.

No entanto, o teste falhou em alguns casos ao tentar acessar rotas de agentes e casos sem token.

**Análise:**  
No seu middleware:

```js
const authHeader = req.headers["authorization"];
const headerToken = authHeader && authHeader.split(" ")[1];
const cookieToken = req.cookies?.access_token;

const token = headerToken || cookieToken;

if(!token){
    return next(new ApiError(401, "Token de autenticação não fornecido."));
}
```

Isso está correto. Certifique-se que nos testes o token está sendo enviado no header correto e que o middleware está aplicado em todas as rotas que precisam de proteção.

---

### 5. Testes Bônus que falharam

Você tentou implementar filtros, buscas e endpoints adicionais, mas alguns testes bônus falharam, por exemplo:

- Filtragem de casos por status e agente.
- Busca de agente responsável por caso.
- Endpoint `/usuarios/me`.

**Análise:**  
Seu código tem funções para esses filtros, mas pode haver detalhes na validação, retorno ou na forma como os parâmetros são tratados.

Por exemplo, no `casosController.js`, você tem:

```js
const { agente_id, status } = validarAgente_idEStatus.parse(req.query);
```

Se o schema `validarAgente_idEStatus` não aceitar parâmetros opcionais corretamente, pode causar erro 400.

---

## 📋 Estrutura de Diretórios

Sua estrutura está muito próxima do esperado, parabéns! 👏

Você tem as pastas:

- `db/` com `migrations` e `seeds`.
- `routes/` com `agentesRoutes.js`, `casosRoutes.js` e `authRoutes.js`.
- `controllers/` com os controllers corretos.
- `repositories/` com os arquivos necessários.
- `middlewares/` e `utils/` com os arquivos indicados.

**Atenção:**  
Confirme que o arquivo `authRoutes.js` está nomeado corretamente (com 'auth' minúsculo) e que está na pasta `routes/` — isso é importante para o funcionamento correto das rotas.

---

## Exemplos de Ajustes que Podem Ajudar

### Ajuste no método encontrarUsuarioPorEmail para evitar problema no `whereRaw`

```js
async function encontrarUsuarioPorEmail(email) {
    try {
        const user = await db('usuarios').whereRaw('LOWER(email) = LOWER(?)', [email]);

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

---

### Ajuste no tratamento de IDs inválidos para retornar 400

No `agentesController.js`, por exemplo:

```js
try {
    const { id } = agenteIdValido.parse(req.params);
    // ...
} catch (error) {
    if (error instanceof z.ZodError) {
        return next(new ApiError(400, "ID inválido")); // 400 em vez de 404
    }
    next(error);
}
```

---

### Garantindo que o token JWT seja enviado no header Authorization

No Postman/Insomnia, configure a autorização assim:

```
Authorization: Bearer <seu_token_jwt>
```

---

## Recursos para Aprendizado 📚

- Para entender melhor autenticação com JWT e bcrypt, recomendo assistir este vídeo, feito pelos meus criadores, que explica os conceitos básicos e aplicação prática da autenticação: https://www.youtube.com/watch?v=Q4LQOfYwujk

- Para aprofundar no uso do JWT em Node.js na prática, veja este vídeo: https://www.youtube.com/watch?v=keS0JWOypIU

- Se quiser revisar a implementação de hashing de senhas e segurança, este vídeo é excelente: https://www.youtube.com/watch?v=L04Ln97AwoY

- Caso tenha dúvidas sobre a configuração do banco com Docker e Knex, este vídeo ajuda muito: https://www.youtube.com/watch?v=uEABDBQV-Ek&t=1s

- Para entender melhor a arquitetura MVC e organização do seu projeto, recomendo: https://www.youtube.com/watch?v=bGN_xNc4A1k&t=3s

---

## 🎯 Resumo dos Principais Pontos para Melhorar

- Corrigir a consulta no `usuariosRepository.encontrarUsuarioPorEmail` para garantir que a verificação de e-mail funcione perfeitamente, evitando erros 400 no registro.
- Revisar os status codes retornados para IDs inválidos (usar 400 em vez de 404 quando o formato do ID for incorreto).
- Confirmar que o token JWT está sendo enviado corretamente no header Authorization nas requisições protegidas.
- Verificar se os dados retornados nas operações de agentes e casos estão no formato exato esperado (incluindo IDs e campos).
- Ajustar os schemas de validação para aceitar parâmetros opcionais nos filtros e buscas.
- Garantir que a variável de ambiente `JWT_SECRET` esteja definida corretamente no `.env` para evitar problemas na geração e validação dos tokens.
- Revisar a documentação no `INSTRUCTIONS.md` para garantir que o fluxo de autenticação e uso do token esteja claro e correto.

---

Gabriel, você está no caminho certo! A segurança e autenticação são temas complexos, e sua implementação já mostra bastante domínio. Com esses ajustes você vai destravar os testes e entregar uma API robusta e profissional! 💪✨

Continue firme, revise com calma os pontos que destaquei, e não hesite em usar os vídeos que recomendei para fortalecer seus conhecimentos. Estou aqui torcendo pelo seu sucesso! 🚀👊

Um abraço e até a próxima revisão! 🤖💙

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>