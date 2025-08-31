<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 3 créditos restantes para usar o sistema de feedback AI.

# Feedback para gabrielmaiaaa:

Nota final: **48.7/100**

Olá, gabrielmaiaaa! 🎉

Primeiramente, parabéns pelo esforço e pela entrega do seu projeto! Você estruturou muito bem sua aplicação, seguindo a arquitetura MVC com controllers, repositories, routes e middlewares, o que é fundamental para projetos Node.js escaláveis e organizados. Também mandou bem na implementação da autenticação com JWT e bcrypt, e seu código mostra preocupação com validações usando `zod`, o que é ótimo para garantir a qualidade dos dados que entram no sistema.

Além disso, você conseguiu passar diversos testes importantes, como:

- Criação, login e logout de usuários com JWT válido.
- Proteção das rotas de agentes e casos via middleware de autenticação.
- Validações rigorosas para os dados dos usuários, agentes e casos.
- Deleção correta de usuários, agentes e casos.
- Tratamento de erros com mensagens personalizadas.
- Implementação dos endpoints básicos de agentes e casos.

E você também avançou nos bônus, como:

- Endpoint `/usuarios/me` para retornar dados do usuário autenticado.
- Filtros e buscas nos agentes e casos.
- Mensagens customizadas de erro para validações.

Agora, vamos analisar os pontos que precisam de atenção para você destravar a nota e deixar seu projeto ainda mais robusto! 🚀

---

## Análise dos Testes que Falharam e Causas Raiz 🔍

### 1. **Erro 400 ao tentar criar usuário com email já em uso**

**O que aconteceu?**

O teste espera que, ao tentar registrar um usuário com um email que já existe no banco, o sistema retorne um status 400 (Bad Request).

**Seu código relevante:**

```js
const usuarioExistente = await usuariosRepository.encontrarUsuarioPorEmail(dados.email);

if(usuarioExistente){            
    return next(new ApiError(400, "Esse email já está em uso."));
}
```

**Análise:**

Você fez a verificação corretamente, mas a função `encontrarUsuarioPorEmail` no `usuariosRepository` pode estar retornando `false` ou um objeto, dependendo se o usuário existe ou não. Se a função retornar algo diferente do esperado (ex: `undefined`), o teste pode falhar.

Além disso, verifique se o email está sendo comparado de forma case insensitive no repositório (você usou `.whereRaw('LOWER(email) = ?', email.toLowerCase())` que está correto).

**Possível causa:**

- Talvez o teste esteja enviando o email com letras maiúsculas/minúsculas e o banco não esteja tratando isso corretamente.
- Ou o usuário está sendo criado, mas a resposta do endpoint não está exatamente conforme esperado (ex: formato JSON, status code).

**Sugestão:**

Garanta que a resposta seja exatamente:

```json
{
  "message": "Esse email já está em uso."
}
```

Ou que a mensagem de erro seja capturada corretamente pelo middleware de erro.

---

### 2. **Falha na criação de agentes (status code 201 e dados inalterados)**

**O que aconteceu?**

O teste espera que ao criar um agente, o status seja 201 e os dados retornados sejam exatamente os mesmos enviados, mais o ID gerado.

**Seu código relevante:**

```js
const novoAgente = { nome, dataDeIncorporacao, cargo };
const dados = await agentesRepository.adicionarAgente(novoAgente);

if(!dados){
    return next(new ApiError(404, "Não foi possivel criar esse agente"));
}

res.status(201).json(dados);
```

**Análise:**

Aqui o fluxo está correto, mas o problema pode estar no `agentesRepository.adicionarAgente`.

Veja que você chama:

```js
const agente = await db("agentes").insert(novoAgente).returning("*");
return formatarData(agente[0]);
```

E a função `formatarData` faz:

```js
agente.dataDeIncorporacao = agente.dataDeIncorporacao.toISOString().split('T')[0];
```

Se o campo `dataDeIncorporacao` estiver vindo como string ou nulo, isso pode causar erro ou retornar dados diferentes.

**Possível causa:**

- O formato da data pode estar sendo alterado ou não estar consistente.
- O teste pode esperar o formato da data exatamente como enviado, e a formatação pode estar diferente.

**Sugestão:**

Confirme que o formato da data retornada está exatamente como o teste espera (provavelmente `YYYY-MM-DD`), o que você já tenta fazer no `formatarData`. Teste se o campo está vindo como objeto Date antes do `.toISOString()`.

---

### 3. **Testes 404 e 400 para agentes com IDs inválidos ou inexistentes**

**O que aconteceu?**

Os testes esperam que ao buscar, atualizar ou deletar agentes com IDs inválidos (ex: strings não numéricas) ou que não existem no banco, o sistema retorne status 404 ou 400 conforme o caso.

**Seu código relevante:**

Você usa `zod` para validar o ID:

```js
const { id } = agenteIdValido.parse(req.params);
```

E trata erros assim:

```js
if (error instanceof z.ZodError) {
    return next(new ApiError(404, "ID inválido"))
}
```

**Análise:**

- Usar status 404 para ID inválido pode confundir, pois 404 é para recurso não encontrado. IDs inválidos (ex: letras onde deveria ser número) deveriam retornar 400 (Bad Request).
- O teste pode estar esperando 400 para IDs inválidos e 404 para IDs corretos mas não encontrados.

**Sugestão:**

Altere o tratamento para:

- 400 Bad Request para IDs inválidos (falha na validação).
- 404 Not Found para IDs válidos mas que não existem.

Exemplo:

```js
try {
    const { id } = agenteIdValido.parse(req.params);
} catch (error) {
    if (error instanceof z.ZodError) {
        return next(new ApiError(400, "ID inválido"));
    }
    return next(error);
}
```

E depois:

```js
if (!dados) {
    return next(new ApiError(404, "Agente não encontrado"));
}
```

---

### 4. **Status 401 ao acessar rotas sem token JWT**

**O que aconteceu?**

Os testes esperam que todas as rotas protegidas retornem 401 Unauthorized quando o token JWT não for enviado no header Authorization.

**Seu código relevante:**

No middleware:

```js
const authHeader = req.headers["authorization"];
const headerToken = authHeader && authHeader.split(" ")[1];
const cookieToken = req.cookies?.access_token;

const token = headerToken || cookieToken;

if(!token){
    return next(new ApiError(401, "Token de autenticação não fornecido."));
}
```

**Análise:**

- Seu middleware parece correto e trata o caso.
- Verifique se nas rotas você está realmente aplicando o middleware `authMiddleware` em todas as rotas que precisam de proteção (agentes e casos estão protegidas, ok).
- No `server.js`, você usa:

```js
app.use(agentesRouter);
app.use(casosRouter);
app.use(authRouter);
```

Se as rotas de autenticação não precisam de proteção, está certo.

**Possível causa:**

- Se algum teste tenta acessar rota protegida sem token e seu middleware não está sendo chamado, a rota pode responder 200, falhando o teste.

**Sugestão:**

Confirme que o middleware está aplicado em todas as rotas protegidas, como você já fez. Se estiver, está ok.

---

### 5. **Filtros e buscas (Testes bônus que falharam)**

Você teve falhas em testes bônus relacionados a:

- Filtragem de casos por status.
- Busca de agente responsável por caso.
- Filtragem de casos por agente.
- Busca por keywords em título e descrição.
- Endpoint `/usuarios/me`.

**Análise:**

- Seu código tem esses endpoints e funções, mas os testes falharam.
- Pode ser que o formato da resposta, os status codes ou as validações estejam divergentes do esperado.
- Também pode ser que a lógica dos filtros não esteja cobrindo todos os casos.

**Sugestão:**

- Revise os controllers e repositories relacionados para garantir que:

  - Retorna 404 quando não encontrar dados.
  - Retorna 200 com array vazio quando apropriado (alguns testes podem esperar isso).
  - Os parâmetros de consulta são validados corretamente.
  
- Revise o endpoint `/usuarios/me` para garantir que retorna os dados do usuário autenticado com status 200.

---

## Outras Observações Importantes

### Estrutura de Diretórios

Sua estrutura está conforme o esperado, parabéns! Isso ajuda muito na organização e facilita manutenção.

---

### Uso do `.env` e JWT_SECRET

Você usou `process.env.JWT_SECRET || "secret"` em vários pontos:

```js
const access_token = jwt.sign(..., process.env.JWT_SECRET || "secret", ...);
```

**Atenção:** Para produção e testes, o segredo deve vir do `.env`. Usar fallback `"secret"` pode causar falha nos testes que esperam o segredo do `.env`.

**Sugestão:**

- Garanta que o arquivo `.env` esteja configurado corretamente e o `JWT_SECRET` esteja definido.
- Remova o fallback `"secret"` para forçar o uso do `.env`.
- Isso evita que os tokens gerados não batam com o esperado nos testes.

---

### Validação da senha

Você usa `zod` para validar a senha do usuário, cobrindo os requisitos (mínimo 8 caracteres, letras maiúsculas/minúsculas, números, caracteres especiais). Ótimo!

---

### Uso do cookie para o token JWT

Você está enviando o token JWT também em cookie HTTP-only:

```js
res.cookie('access_token', access_token, {
    maxAge: 60*60*1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
})
```

Isso é legal para segurança, mas os testes parecem esperar o token no corpo JSON e no header Authorization.

**Sugestão:**

- Continue enviando o token no JSON (como você já faz).
- O cookie é um bônus, mas garanta que o middleware aceite o token via header Authorization (como já implementado).
- Se quiser, documente isso no `INSTRUCTIONS.md`.

---

## Recomendações de Recursos para Você 🎓

- Para entender melhor autenticação JWT e bcrypt, recomendo muito este vídeo, feito pelos meus criadores, que explica os conceitos básicos e práticos: https://www.youtube.com/watch?v=Q4LQOfYwujk  
- Para aprofundar no uso de JWT na prática, veja este vídeo: https://www.youtube.com/watch?v=keS0JWOypIU  
- Para entender melhor a integração do bcrypt com JWT, este vídeo é excelente: https://www.youtube.com/watch?v=L04Ln97AwoY  
- Se quiser revisar a estrutura do projeto e boas práticas MVC em Node.js, este vídeo vai te ajudar bastante: https://www.youtube.com/watch?v=bGN_xNc4A1k&t=3s  
- Caso tenha dúvidas sobre configuração do banco com Docker e Knex, recomendo: https://www.youtube.com/watch?v=uEABDBQV-Ek&t=1s e a documentação oficial do Knex.js.

---

## Resumo dos Pontos para Focar 🔑

- Corrigir o status code para IDs inválidos (use 400, não 404).
- Garantir que o email já existente retorne 400 com mensagem correta.
- Confirmar que o formato da data em agentes está exatamente como o teste espera.
- Remover fallback do JWT_SECRET para evitar tokens inconsistentes.
- Revisar os endpoints de filtros e buscas para garantir status codes e respostas conforme esperado.
- Confirmar que o middleware de autenticação está aplicado em todas as rotas protegidas.
- Documentar claramente no INSTRUCTIONS.md o uso do token JWT no header Authorization.
- Testar localmente com ferramentas como Postman para garantir que as respostas e status codes batem com os testes automatizados.

---

Gabriel, seu projeto está muito bem encaminhado e você já domina muitos conceitos avançados! Com esses ajustes finos, sua aplicação vai ficar sólida, segura e alinhada com as expectativas do desafio. Continue praticando, revisando os detalhes e testando cada funcionalidade com atenção.

Se precisar de ajuda para entender melhor algum ponto específico, estou aqui para te ajudar! 🚀💪

Um grande abraço e sucesso na jornada! 👊✨

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>