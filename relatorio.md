<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 9 créditos restantes para usar o sistema de feedback AI.

# Feedback para gabrielmaiaaa:

Nota final: **48.7/100**

# Feedback para gabrielmaiaaa 🚨🔍

Olá, Gabriel! Primeiro, parabéns pelo esforço e pela entrega do seu projeto! 🎉 Você conseguiu implementar várias funcionalidades importantes, como o registro, login, logout e exclusão de usuários, além da proteção das rotas com JWT, o que é fundamental para uma API segura. Além disso, seu projeto está muito bem organizado e estruturado, seguindo a arquitetura MVC com controllers, repositories, middlewares e rotas bem separadas. Isso é essencial para manter o código limpo e escalável. 👏

Também é ótimo ver que você aplicou corretamente o hashing das senhas com bcrypt e que o token JWT tem expiração configurada, além de utilizar variáveis de ambiente para o segredo do JWT, o que é uma prática de segurança fundamental. Você também implementou o middleware de autenticação e aplicou ele nas rotas protegidas, garantindo que apenas usuários autenticados possam acessar os recursos sensíveis. Muito bom! 🚀

---

## ✅ Pontos fortes do seu projeto

- Estrutura do projeto organizada e seguindo o padrão esperado.
- Implementação correta do registro, login, logout e exclusão de usuários.
- Uso correto do bcrypt para hashing de senha.
- Geração de JWT com expiração e uso do segredo via `.env`.
- Middleware de autenticação aplicado nas rotas de agentes e casos.
- Tratamento de erros com mensagens customizadas.
- Documentação no `INSTRUCTIONS.md` clara e explicativa.
- Passou todos os testes base relacionados a usuários e autenticação.
- Passou testes de proteção das rotas (status 401 quando JWT ausente).
- Passou testes bônus que envolvem filtragem simples e busca por palavras-chave.

---

# 🚩 Análise dos testes que falharam e causas raiz

Você teve algumas falhas importantes que impactaram sua nota, principalmente relacionadas ao comportamento esperado da API para usuários e agentes. Vamos destrinchar os principais testes que falharam, entender o motivo e como corrigir.

---

## 1. `USERS: Recebe erro 400 ao tentar criar um usuário com e-mail já em uso`

### O que o teste espera?

Quando tentar registrar um usuário com um email já cadastrado, a API deve responder com status **400 BAD REQUEST** e uma mensagem clara.

### O que seu código faz?

No seu `authController.register`:

```js
if(await usuarioRepository.encontrarUsuarioPorEmail(dados.email)){            
    return next(new ApiError(400, "Esse email já está em uso."));
}  
```

Isso parece correto, porém o teste falhou.

### Por que pode estar falhando?

- **Possível causa 1:** O método `encontrarUsuarioPorEmail` retorna `false` quando não encontra usuário, mas retorna o usuário quando encontra. Isso está certo.
- **Possível causa 2:** O `ApiError` que você está passando para o `next()` pode não estar sendo tratado corretamente para retornar status 400. Talvez o middleware de erro não esteja capturando esse erro como esperado.
- **Possível causa 3:** O teste pode estar esperando uma resposta JSON com um formato específico, e você está passando só o erro via `next()`. Se o middleware de erro não estiver configurado para retornar o status e mensagem no formato esperado, o teste pode falhar.

### O que revisar?

- Verifique se o seu middleware `errorHandler` está capturando o `ApiError` e retornando o status 400 com uma resposta JSON estruturada.
- Certifique-se que o nome do campo do token retornado no login está correto (veja mais abaixo).
- Teste manualmente o endpoint `/auth/register` com um email já cadastrado e veja a resposta HTTP e corpo retornados.

---

## 2. Testes relacionados a agentes que falharam:

- Criação de agentes com status 201 e dados corretos.
- Listar agentes com status 200 e dados corretos.
- Buscar agente por ID com status 200 e dados corretos.
- Atualizar agente com PUT e PATCH com status 200 e dados atualizados.
- Deletar agente com status 204 e corpo vazio.
- Receber status 400 ao criar agente com payload incorreto.
- Receber status 404 ao buscar agente inexistente ou com ID inválido.
- Receber status 401 ao tentar acessar agentes sem JWT.
- Receber status 400 ao atualizar agente com payload incorreto.
- Receber status 404 ao atualizar ou deletar agente inexistente ou ID inválido.

### O que seu código faz?

Seu `agentesController` está muito bem estruturado, com validações rigorosas e tratamento de erros customizados. Você usa o middleware `authMiddleware` nas rotas de agentes, o que está correto.

### Por que esses testes podem estar falhando?

- **Possível causa 1:** No seu `server.js` você faz:

```js
app.use(agentesRouter);
app.use(casosRouter);
app.use(authRouter);
```

Mas não especifica um prefixo para as rotas. Se dentro do arquivo `agentesRoutes.js` você tem:

```js
router.get('/agentes', authMiddleware, agentesController.getAllAgentes);
```

Isso está certo, mas o ideal é usar o prefixo no `app.use` para evitar conflitos e garantir organização, assim:

```js
app.use('/agentes', agentesRouter);
app.use('/casos', casosRouter);
app.use('/auth', authRouter);
```

Caso contrário, pode haver conflito ou rota mal interpretada.

- **Possível causa 2:** No seu `authController.login`, você retorna o token com a chave `access_token`:

```js
res.status(200).json({access_token});
```

Mas no `INSTRUCTIONS.md` e nos testes, o campo esperado é `acess_token` (com "c" só uma vez):

```json
{
    "acess_token": "token"
}
```

Repare que no seu código está com dois "c"s: `access_token`, mas o teste espera `acess_token`.

Isso gera falha nos testes de login e autenticação, que impacta também os testes de agentes que precisam do token.

- **Possível causa 3:** No `authController.login` você está setando o cookie do token, mas o teste provavelmente espera o token no corpo da resposta, e o nome do campo precisa bater exatamente com o esperado.

- **Possível causa 4:** Em alguns pontos, você usa `next(new ApiError(...))` para erros, mas não está claro se seu middleware de erro está configurado para transformar isso em resposta HTTP corretamente. Isso pode impactar status e mensagens.

---

## 3. Testes relacionados a casos que falharam

Testes de criação, listagem, busca, atualização, deleção e filtros de casos falharam com status 400 ou 404.

### O que seu código faz?

O `casosController` está bem detalhado, com validações e tratamentos de erros. O repositório usa Knex para as queries.

### Possíveis causas:

- Falta de validação adequada para os parâmetros `agente_id` e `status` em algumas rotas, ou inconsistência no tratamento de `agente_id` como string ou número.
- Em `patchCaso`, você tem essa verificação:

```js
if (agente_id !== undefined) {
    if (typeof agente_id === "string") {
        return res.status(404).json(errorHandler.handleError(404, "ID do agente não fornecido", "agenteInvalido", "ID do agente deve ser fornecido no formato de número."));
    }
    ...
}
```

Mas essa validação pode ser problemática se o `agente_id` vier como string numérica (ex: "1"), que é comum em JSON. O correto é tentar converter para número e validar, não simplesmente rejeitar strings.

- Isso pode fazer com que o teste que envia o `agente_id` como string numérica falhe.

---

## 4. Testes bônus que falharam

Você não passou os testes bônus, que envolvem:

- Filtragem simples e complexa de casos e agentes.
- Busca de agente responsável pelo caso.
- Endpoint `/usuarios/me` para retornar dados do usuário logado.

### O que falta?

- Implementar o endpoint `/usuarios/me` que retorna os dados do usuário autenticado (você tem um método `getDados` no `authController`, mas verifique se está corretamente exposto e funcionando).
- Melhorar a filtragem para agentes por data de incorporação com ordenação ascendente e descendente.
- Melhorar a filtragem de casos por status e agente com mais robustez.
- Implementar busca de agente responsável por caso corretamente.

---

# Correções e melhorias sugeridas

### 1. Corrigir o nome do campo do token JWT no login

No `authController.login`, altere:

```js
res.status(200).json({access_token});
```

para

```js
res.status(200).json({acess_token: access_token});
```

Assim você alinha com o esperado nos testes e documentação.

---

### 2. Ajustar o `server.js` para usar prefixos nas rotas

Altere seu `server.js` para:

```js
app.use('/agentes', agentesRouter);
app.use('/casos', casosRouter);
app.use('/auth', authRouter);
```

Isso evita conflitos e deixa mais claro o caminho das rotas.

---

### 3. Revisar o middleware de erro para garantir que `ApiError` seja tratado corretamente

Seu `errorHandler.js` deve capturar o erro do tipo `ApiError` e responder com o status e mensagem corretos. Exemplo:

```js
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
}

module.exports = {
  ApiError,
  errorHandler,
};
```

Se já tiver isso, ótimo! Caso contrário, ajuste para garantir que erros personalizados sejam enviados corretamente.

---

### 4. Ajustar validação do `agente_id` no `patchCaso`

No trecho:

```js
if (agente_id !== undefined) {
    if (typeof agente_id === "string") {
        return res.status(404).json(errorHandler.handleError(404, "ID do agente não fornecido", "agenteInvalido", "ID do agente deve ser fornecido no formato de número."));
    }
    ...
}
```

Sugiro substituir por algo assim:

```js
if (agente_id !== undefined) {
    const agenteIdNum = Number(agente_id);
    if (Number.isNaN(agenteIdNum) || !Number.isInteger(agenteIdNum)) {
        return res.status(404).json(errorHandler.handleError(404, "ID do agente inválido", "agenteInvalido", "ID do agente deve ser um número inteiro."));
    }
    if (!await agentesRepository.encontrarAgenteById(agenteIdNum)) {
        return res.status(404).json(errorHandler.handleError(404, "Agente não encontrado", "agenteNaoEncontrado", "Agente não encontrado. Verifique se o agente está registrado no sistema."));
    }
}
```

Assim você aceita strings numéricas e faz a validação correta.

---

### 5. Verificar se a migration da tabela `usuarios` está sendo executada corretamente

Sua migration parece correta, mas certifique-se que a tabela `usuarios` está criada no banco com os campos certos e que as seeds estão rodando.

---

### 6. Implementar o endpoint `/usuarios/me` para passar o teste bônus

Você já tem no `authRoutes.js`:

```js
router.get('/usuarios/me', authMiddleware, authController.getDados);
```

E no `authController.js`:

```js
async function getDados(req, res, next) {
    const user = req.user;

    if(!user) {
        return next(new ApiError(404, "Usuário não foi encontrado."));
    }

    const dados = { nome: user.nome, email: user.email };

    res.status(200).json(dados);    
}
```

Só verifique se o `authMiddleware` está funcionando corretamente e preenchendo `req.user` com os dados do token. Teste a rota manualmente para garantir.

---

# Recursos que recomendo para você aprofundar e corrigir esses pontos:

- **Autenticação e JWT**:  
  [Esse vídeo, feito pelos meus criadores, fala muito bem sobre autenticação e segurança em APIs com JWT](https://www.youtube.com/watch?v=Q4LQOfYwujk)  
  [Vídeo prático sobre JWT](https://www.youtube.com/watch?v=keS0JWOypIU)  
  [Vídeo que aborda uso de JWT e bcrypt juntos](https://www.youtube.com/watch?v=L04Ln97AwoY)

- **Knex.js e Migrations**:  
  [Documentação oficial do Knex.js sobre migrations](https://www.youtube.com/watch?v=dXWy_aGCW1E)  
  [Guia detalhado do Knex Query Builder](https://www.youtube.com/watch?v=GLwHSs7t3Ns&t=4s)  

- **Estrutura MVC e boas práticas em Node.js**:  
  [Arquitetura MVC para Node.js explicada](https://www.youtube.com/watch?v=bGN_xNc4A1k&t=3s)

---

# Resumo rápido dos pontos principais para focar:

- [ ] Corrigir o nome do campo do token JWT no login para `acess_token` (com um "c").
- [ ] Ajustar o `server.js` para usar prefixos nas rotas (`app.use('/agentes', agentesRouter)` etc).
- [ ] Garantir que o middleware de erro (`errorHandler`) trata corretamente o `ApiError` e retorna status e JSON conforme esperado.
- [ ] Melhorar validação do parâmetro `agente_id` para aceitar string numérica e validar corretamente.
- [ ] Verificar se a migration da tabela `usuarios` foi executada e o banco está consistente.
- [ ] Testar e garantir que o endpoint `/usuarios/me` retorna os dados do usuário autenticado.
- [ ] Testar manualmente os endpoints que falharam para entender o comportamento e ajustar conforme os testes esperam.

---

# Finalizando...

Gabriel, seu projeto está no caminho certo e já tem várias implementações sólidas! 💪 Com esses ajustes que te indiquei, você vai conseguir destravar os testes que faltam e melhorar bastante sua nota. Continue assim, revisando cuidadosamente os detalhes que os testes pedem, alinhando os nomes e formatos das respostas, e validando os dados de entrada.

Se precisar, volte aos vídeos recomendados para entender melhor autenticação, JWT, bcrypt e organização de projetos Node.js. Isso vai te ajudar a consolidar o conhecimento e evitar erros comuns.

Estou na torcida pelo seu sucesso! 🚀 Qualquer dúvida, só chamar que vamos destrinchar juntos! 😉

Um abraço e bons códigos! 👨‍💻👩‍💻

---

Se quiser, posso ajudar você a corrigir algum trecho específico do código. Quer que eu faça isso?

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>